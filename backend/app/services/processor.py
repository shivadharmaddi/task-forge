from typing import Dict, Optional, Tuple
import asyncio
import json
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Activity, Job, JobAttempt, JobEvent, JobLog, JobStatus

WORKERS = [
    {"id": "worker-01", "status": "healthy", "state": "idle", "jobs_processed": 4281, "failures": 26},
    {"id": "worker-02", "status": "healthy", "state": "busy", "jobs_processed": 3992, "failures": 31, "current_job": None},
    {"id": "worker-03", "status": "healthy", "state": "idle", "jobs_processed": 4156, "failures": 22},
    {"id": "worker-04", "status": "healthy", "state": "busy", "jobs_processed": 3874, "failures": 35},
    {"id": "worker-05", "status": "healthy", "state": "idle", "jobs_processed": 4023, "failures": 28},
    {"id": "worker-06", "status": "offline", "state": "offline", "jobs_processed": 3650, "failures": 42},
]

PRIORITY_ORDER = {"critical": 0, "high": 1, "normal": 2, "low": 3}

_processing_lock = asyncio.Lock()
_scheduler_running = False


def add_event(db: Session, job_id: str, event_type: str, description: str, worker_id: Optional[str] = None):
    event = JobEvent(job_id=job_id, event_type=event_type, description=description, worker_id=worker_id)
    db.add(event)


def add_log(db: Session, job_id: str, message: str, level: str = "INFO"):
    log = JobLog(job_id=job_id, level=level, message=message)
    db.add(log)


def add_activity(
    db: Session,
    event_type: str,
    message: str,
    category: str = "jobs",
    job_id: Optional[str] = None,
    worker_id: Optional[str] = None,
):
    activity = Activity(
        event_type=event_type,
        category=category,
        message=message,
        job_id=job_id,
        worker_id=worker_id,
    )
    db.add(activity)


def get_available_worker(db: Session) -> Optional[Dict]:
    busy_workers = {
        j.worker_id
        for j in db.query(Job).filter(Job.status.in_([JobStatus.PROCESSING.value, JobStatus.RETRYING.value])).all()
        if j.worker_id
    }
    for worker in WORKERS:
        if worker["status"] == "offline":
            continue
        if worker["id"] not in busy_workers:
            return worker
    for worker in WORKERS:
        if worker["status"] != "offline":
            return worker
    return None


def _execute_task(task_name: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
    if task_name == "always_fail":
        return False, None, "Task configured to always fail"

    if task_name == "unstable_task":
        if random.random() < 0.5:
            return False, None, "Transient failure in unstable task"
        return True, {"status": "completed", "message": "Unstable task succeeded"}, None

    results = {
        "generate_report": {"report_id": f"rpt_{random.randint(1000, 9999)}", "pages": random.randint(5, 50)},
        "send_email": {"recipient": "user@example.com", "message_id": f"msg_{random.randint(1000, 9999)}"},
        "process_dataset": {"records_processed": random.randint(100, 10000), "duration_ms": random.randint(500, 5000)},
        "resize_image": {"original_size": "1920x1080", "new_size": "800x600"},
        "sync_customer": {"customers_synced": random.randint(1, 100)},
        "export_invoice": {"invoice_id": f"inv_{random.randint(1000, 9999)}", "amount": round(random.uniform(10, 1000), 2)},
        "send_notification": {"notification_id": f"notif_{random.randint(1000, 9999)}"},
    }
    return True, results.get(task_name, {"status": "completed"}), None


async def process_job(db: Session, job: Job):
    worker = get_available_worker(db)
    if not worker:
        return

    worker_id = worker["id"]
    job.worker_id = worker_id
    job.attempt_count += 1
    job.status = JobStatus.PROCESSING.value if job.attempt_count == 1 else JobStatus.RETRYING.value
    job.started_at = datetime.utcnow()

    add_event(db, job.id, "processing", f"Picked up by {worker_id}", worker_id)
    add_log(db, job.id, f"Worker {worker_id} assigned")
    add_log(db, job.id, "Processing started")
    add_activity(db, "worker_pickup", f"{worker_id} picked up {job.id}", "workers", job.id, worker_id)
    db.commit()

    await asyncio.sleep(random.uniform(1.5, 3.5))

    attempt = JobAttempt(
        job_id=job.id,
        attempt_number=job.attempt_count,
        worker_id=worker_id,
        status="processing",
        started_at=job.started_at,
    )
    db.add(attempt)

    success, result, error = _execute_task(job.task_name)
    now = datetime.utcnow()
    job.duration = (now - job.started_at).total_seconds() if job.started_at else None
    attempt.completed_at = now
    attempt.duration = job.duration

    if success:
        job.status = JobStatus.COMPLETED.value
        job.completed_at = now
        job.result = json.dumps(result)
        job.error_message = None
        attempt.status = "completed"
        add_event(db, job.id, "completed", "Job completed successfully", worker_id)
        add_log(db, job.id, "Job completed")
        add_activity(db, "job_completed", f"{job.id} completed successfully", "jobs", job.id, worker_id)
    else:
        attempt.status = "failed"
        attempt.error_message = error
        job.error_message = error
        add_event(db, job.id, "failed", f"Job failed: {error}", worker_id)
        add_log(db, job.id, f"Job failed: {error}", "ERROR")
        add_activity(db, "job_failed", f"{job.id} failed", "jobs", job.id, worker_id)

        if job.attempt_count >= job.max_attempts:
            job.status = JobStatus.DEAD_LETTER.value
            job.completed_at = now
            add_event(db, job.id, "dead_letter", "Maximum attempts reached, moved to dead-letter queue")
            add_log(db, job.id, "Moved to dead-letter queue", "ERROR")
            add_activity(db, "dead_letter", f"{job.id} moved to dead-letter queue", "jobs", job.id)
        else:
            job.status = JobStatus.QUEUED.value
            job.worker_id = None
            add_event(db, job.id, "retry_scheduled", f"Retry scheduled (attempt {job.attempt_count}/{job.max_attempts})")
            add_log(db, job.id, f"Retry scheduled (attempt {job.attempt_count}/{job.max_attempts})")
            add_activity(db, "retry_scheduled", f"Retry scheduled for {job.id}", "jobs", job.id)

    db.commit()


async def process_queue(db: Session):
    now = datetime.utcnow()

    scheduled_jobs = (
        db.query(Job)
        .filter(Job.status == JobStatus.SCHEDULED.value, Job.scheduled_at <= now)
        .all()
    )
    for job in scheduled_jobs:
        job.status = JobStatus.QUEUED.value
        add_event(db, job.id, "queued", "Job became ready for processing")
        add_activity(db, "job_ready", f"{job.id} became ready for processing", "jobs", job.id)
    if scheduled_jobs:
        db.commit()

    queued_jobs = (
        db.query(Job)
        .filter(Job.status == JobStatus.QUEUED.value)
        .order_by(Job.created_at)
        .all()
    )
    queued_jobs.sort(key=lambda j: (PRIORITY_ORDER.get(j.priority, 2), j.created_at))

    for job in queued_jobs[:2]:
        busy = db.query(Job).filter(
            Job.status.in_([JobStatus.PROCESSING.value, JobStatus.RETRYING.value])
        ).count()
        if busy >= 3:
            break
        await process_job(db, job)


async def scheduler_loop():
    global _scheduler_running
    from app.database import SessionLocal

    _scheduler_running = True
    while _scheduler_running:
        try:
            async with _processing_lock:
                db = SessionLocal()
                try:
                    await process_queue(db)
                finally:
                    db.close()
        except Exception:
            pass
        await asyncio.sleep(1)


def stop_scheduler():
    global _scheduler_running
    _scheduler_running = False


def get_workers_data(db: Session) -> list[dict]:
    workers = []
    for w in WORKERS:
        current_job = (
            db.query(Job)
            .filter(
                Job.worker_id == w["id"],
                Job.status.in_([JobStatus.PROCESSING.value, JobStatus.RETRYING.value]),
            )
            .first()
        )
        success_rate = round((1 - w["failures"] / max(w["jobs_processed"], 1)) * 100, 1)
        if w["status"] == "offline":
            heartbeat = datetime.utcnow() - timedelta(minutes=18)
            heartbeat_str = "18 minutes ago"
        else:
            heartbeat = datetime.utcnow() - timedelta(seconds=random.randint(1, 5))
            heartbeat_str = f"{random.randint(1, 5)} sec ago"

        workers.append({
            "id": w["id"],
            "status": w["status"],
            "state": "busy" if current_job else w["state"] if w["status"] != "offline" else "offline",
            "current_job": current_job.id if current_job else w.get("current_job"),
            "jobs_processed": w["jobs_processed"],
            "failures": w["failures"],
            "success_rate": success_rate,
            "average_runtime": round(random.uniform(1.2, 2.5), 1),
            "uptime": f"{random.randint(1, 14)}d {random.randint(1, 23)}h",
            "last_heartbeat": heartbeat_str,
            "last_heartbeat_at": heartbeat,
        })
    return workers
