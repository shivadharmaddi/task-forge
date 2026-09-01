import json
import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Activity, Job, JobAttempt, JobEvent, JobLog, JobStatus, generate_job_id
from app.services.processor import WORKERS, add_activity, add_event, add_log

TASKS = [
    "generate_report", "send_email", "resize_image", "process_dataset",
    "sync_customer", "export_invoice", "send_notification",
]
PRIORITIES = ["critical", "high", "normal", "low"]
QUEUES = ["default", "reports", "emails", "processing"]
STATUSES_WEIGHTED = [
    (JobStatus.COMPLETED.value, 50),
    (JobStatus.QUEUED.value, 10),
    (JobStatus.PROCESSING.value, 5),
    (JobStatus.SCHEDULED.value, 8),
    (JobStatus.FAILED.value, 5),
    (JobStatus.DEAD_LETTER.value, 7),
    (JobStatus.RETRYING.value, 3),
    (JobStatus.CANCELLED.value, 2),
]


def _weighted_status():
    total = sum(w for _, w in STATUSES_WEIGHTED)
    r = random.randint(1, total)
    cumulative = 0
    for status, weight in STATUSES_WEIGHTED:
        cumulative += weight
        if r <= cumulative:
            return status
    return JobStatus.COMPLETED.value


def seed_database(db: Session):
    if db.query(Job).count() > 0:
        return

    now = datetime.utcnow()
    jobs_created = []

    for i in range(90):
        job_id = generate_job_id()
        while job_id in jobs_created:
            job_id = generate_job_id()
        jobs_created.append(job_id)

        task = random.choice(TASKS + ["unstable_task", "always_fail"])
        status = _weighted_status()
        priority = random.choice(PRIORITIES)
        queue = random.choice(QUEUES)
        worker = random.choice(WORKERS)["id"] if status in [
            JobStatus.PROCESSING.value, JobStatus.COMPLETED.value,
            JobStatus.FAILED.value, JobStatus.RETRYING.value, JobStatus.DEAD_LETTER.value,
        ] else None

        created = now - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )
        duration = round(random.uniform(0.5, 5.0), 2) if status == JobStatus.COMPLETED.value else None
        started = created + timedelta(seconds=random.randint(1, 30)) if worker else None
        completed = started + timedelta(seconds=duration) if started and duration else None
        scheduled = created + timedelta(hours=random.randint(1, 48)) if status == JobStatus.SCHEDULED.value else None

        attempt_count = random.randint(1, 3) if status in [
            JobStatus.DEAD_LETTER.value, JobStatus.FAILED.value, JobStatus.RETRYING.value,
        ] else (1 if status == JobStatus.COMPLETED.value else 0)

        max_attempts = 3
        error = None
        result = None
        if status == JobStatus.COMPLETED.value:
            result = json.dumps({"status": "completed", "task": task})
        elif status in [JobStatus.FAILED.value, JobStatus.DEAD_LETTER.value]:
            error = random.choice([
                "Connection timeout",
                "Invalid payload format",
                "Resource not found",
                "Rate limit exceeded",
            ])
        elif status == JobStatus.DEAD_LETTER.value:
            attempt_count = max_attempts

        job = Job(
            id=job_id,
            task_name=task,
            payload=json.dumps({"user_id": random.randint(100, 9999), "source": "seed"}),
            status=status,
            priority=priority,
            queue=queue,
            attempt_count=attempt_count,
            max_attempts=max_attempts,
            worker_id=worker,
            error_message=error,
            result=result,
            created_at=created,
            scheduled_at=scheduled,
            started_at=started,
            completed_at=completed,
            duration=duration,
        )
        db.add(job)

        add_event(db, job_id, "created", "Job created")
        add_event(db, job_id, "queued", "Job queued for processing")
        if status != JobStatus.SCHEDULED.value:
            if worker:
                add_event(db, job_id, "processing", f"Picked up by {worker}", worker)
            if status == JobStatus.COMPLETED.value:
                add_event(db, job_id, "completed", "Job completed successfully", worker)
            elif status == JobStatus.DEAD_LETTER.value:
                add_event(db, job_id, "failed", f"Job failed: {error}", worker)
                add_event(db, job_id, "dead_letter", "Maximum attempts reached, moved to dead-letter queue")
            elif status == JobStatus.FAILED.value:
                add_event(db, job_id, "failed", f"Job failed: {error}", worker)

        add_log(db, job_id, "Job received")
        add_log(db, job_id, "Validating payload")
        if worker:
            add_log(db, job_id, f"Worker {worker} assigned")
            add_log(db, job_id, "Processing started")
        if status == JobStatus.COMPLETED.value:
            add_log(db, job_id, "Job completed")

        if attempt_count > 0 and worker:
            for a in range(attempt_count):
                att_status = "completed" if a < attempt_count - 1 or status == JobStatus.COMPLETED.value else "failed"
                db.add(JobAttempt(
                    job_id=job_id,
                    attempt_number=a + 1,
                    worker_id=worker,
                    status=att_status,
                    error_message=error if att_status == "failed" else None,
                    started_at=started or created,
                    completed_at=completed,
                    duration=duration,
                ))

    activities = [
        ("job_completed", "jobs", "job completed successfully"),
        ("worker_pickup", "workers", "picked up job"),
        ("job_failed", "jobs", "failed"),
        ("retry_scheduled", "jobs", "Retry scheduled"),
        ("worker_registered", "workers", "registered"),
        ("dead_letter", "jobs", "moved to dead-letter queue"),
        ("job_ready", "jobs", "became ready for processing"),
        ("system_startup", "system", "TaskForge API started"),
    ]
    for _ in range(50):
        event_type, category, suffix = random.choice(activities)
        job_id = random.choice(jobs_created) if category != "system" else None
        worker_id = random.choice(WORKERS)["id"] if "worker" in event_type else None
        msg = f"{job_id} {suffix}" if job_id else suffix
        if worker_id and "pickup" in event_type:
            msg = f"{worker_id} picked up {job_id}"
        elif worker_id and "registered" in event_type:
            msg = f"{worker_id} registered"

        add_activity(
            db,
            event_type,
            msg,
            category,
            job_id,
            worker_id,
        )

    db.commit()
