from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Activity, Job, JobAttempt, JobEvent, JobLog, JobStatus
from app.schemas import (
    ActivityResponse,
    JobCreate,
    JobDetailResponse,
    JobResponse,
    MetricsResponse,
    QueueResponse,
    WorkerResponse,
)
from app.services.processor import PRIORITY_ORDER, WORKERS, add_activity, add_event, add_log, get_workers_data

router = APIRouter(prefix="/api")


def _job_to_response(job: Job) -> dict[str, Any]:
    return {
        "id": job.id,
        "task_name": job.task_name,
        "payload": json.loads(job.payload) if job.payload else {},
        "status": job.status,
        "priority": job.priority,
        "queue": job.queue,
        "attempt_count": job.attempt_count,
        "max_attempts": job.max_attempts,
        "worker_id": job.worker_id,
        "error_message": job.error_message,
        "result": json.loads(job.result) if job.result else None,
        "created_at": job.created_at,
        "scheduled_at": job.scheduled_at,
        "started_at": job.started_at,
        "completed_at": job.completed_at,
        "duration": job.duration,
    }


@router.get("/health")
def health():
    return {"status": "ok", "version": "v1", "timestamp": datetime.utcnow().isoformat()}


@router.get("/jobs")
def list_jobs(
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    queue: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    if priority:
        query = query.filter(Job.priority == priority)
    if queue:
        query = query.filter(Job.queue == queue)
    if search:
        query = query.filter(
            (Job.id.contains(search)) | (Job.task_name.contains(search))
        )
    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "jobs": [_job_to_response(j) for j in jobs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.post("/jobs", response_model=JobResponse)
def create_job(job_data: JobCreate, db: Session = Depends(get_db)):
    payload_str = json.dumps(job_data.payload)
    if len(payload_str) > 10240:
        raise HTTPException(status_code=400, detail="Payload too large")

    now = datetime.utcnow()
    status = JobStatus.SCHEDULED.value if job_data.scheduled_at and job_data.scheduled_at > now else JobStatus.QUEUED.value

    job = Job(
        task_name=job_data.task_name,
        payload=payload_str,
        status=status,
        priority=job_data.priority,
        queue=job_data.queue,
        max_attempts=job_data.max_attempts,
        scheduled_at=job_data.scheduled_at,
    )
    db.add(job)
    db.flush()

    add_event(db, job.id, "created", "Job created")
    add_log(db, job.id, "Job received")
    add_log(db, job.id, "Validating payload")
    if status == JobStatus.SCHEDULED.value:
        add_event(db, job.id, "scheduled", f"Scheduled for {job_data.scheduled_at.isoformat()}")
        add_log(db, job.id, f"Scheduled for {job_data.scheduled_at.isoformat()}")
    else:
        add_event(db, job.id, "queued", "Job queued for processing")
        add_log(db, job.id, "Job queued for processing")
    add_activity(db, "job_created", f"{job.id} created", "jobs", job.id)
    db.commit()
    db.refresh(job)
    return _job_to_response(job)


@router.get("/jobs/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    events = db.query(JobEvent).filter(JobEvent.job_id == job_id).order_by(JobEvent.created_at).all()
    logs = db.query(JobLog).filter(JobLog.job_id == job_id).order_by(JobLog.created_at).all()
    attempts = db.query(JobAttempt).filter(JobAttempt.job_id == job_id).order_by(JobAttempt.attempt_number).all()

    return {
        **_job_to_response(job),
        "events": events,
        "logs": logs,
        "attempts": attempts,
    }


@router.post("/jobs/{job_id}/retry")
def retry_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in [JobStatus.FAILED.value, JobStatus.DEAD_LETTER.value, JobStatus.CANCELLED.value]:
        raise HTTPException(status_code=400, detail="Job cannot be retried in current status")

    job.status = JobStatus.QUEUED.value
    job.worker_id = None
    job.error_message = None
    job.started_at = None
    job.completed_at = None
    job.duration = None
    job.attempt_count = 0

    add_event(db, job.id, "retry_scheduled", "Manual retry initiated")
    add_log(db, job.id, "Manual retry initiated")
    add_activity(db, "retry_scheduled", f"Retry scheduled for {job.id}", "jobs", job.id)
    db.commit()
    return _job_to_response(job)


@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status in [JobStatus.COMPLETED.value, JobStatus.CANCELLED.value, JobStatus.DEAD_LETTER.value]:
        raise HTTPException(status_code=400, detail="Job cannot be cancelled")

    job.status = JobStatus.CANCELLED.value
    job.completed_at = datetime.utcnow()
    add_event(db, job.id, "cancelled", "Job cancelled by user")
    add_log(db, job.id, "Job cancelled")
    add_activity(db, "job_cancelled", f"{job.id} cancelled", "jobs", job.id)
    db.commit()
    return _job_to_response(job)


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.query(JobEvent).filter(JobEvent.job_id == job_id).delete()
    db.query(JobLog).filter(JobLog.job_id == job_id).delete()
    db.query(JobAttempt).filter(JobAttempt.job_id == job_id).delete()
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


@router.get("/workers", response_model=list[WorkerResponse])
def list_workers(db: Session = Depends(get_db)):
    return get_workers_data(db)


@router.get("/queues", response_model=list[QueueResponse])
def list_queues(db: Session = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    queues = []
    for priority in ["critical", "high", "normal", "low"]:
        waiting = db.query(Job).filter(Job.priority == priority, Job.status == JobStatus.QUEUED.value).count()
        processing = db.query(Job).filter(Job.priority == priority, Job.status.in_([
            JobStatus.PROCESSING.value, JobStatus.RETRYING.value,
        ])).count()
        failed = db.query(Job).filter(Job.priority == priority, Job.status == JobStatus.FAILED.value).count()
        completed_today = db.query(Job).filter(
            Job.priority == priority, Job.status == JobStatus.COMPLETED.value, Job.completed_at >= today,
        ).count()
        failed_today = db.query(Job).filter(
            Job.priority == priority, Job.status.in_([JobStatus.FAILED.value, JobStatus.DEAD_LETTER.value]),
            Job.completed_at >= today,
        ).count()
        queues.append({
            "name": priority.capitalize(),
            "priority": priority,
            "waiting": waiting,
            "processing": processing,
            "failed": failed,
            "average_wait": round(random_wait(priority), 1),
            "throughput": completed_today + processing,
            "pending": waiting,
            "completed_today": completed_today,
            "failed_today": failed_today,
        })
    return queues


def random_wait(priority: str) -> float:
    waits = {"critical": 0.5, "high": 1.2, "normal": 2.8, "low": 5.1}
    return waits.get(priority, 2.0) + random.uniform(-0.3, 0.3)


@router.get("/activity", response_model=list[ActivityResponse])
def list_activity(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
):
    query = db.query(Activity)
    if category and category != "all":
        query = query.filter(Activity.category == category)
    return query.order_by(Activity.created_at.desc()).limit(limit).all()


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(db: Session = Depends(get_db), period: str = "24h"):
    total = db.query(Job).count()
    completed = db.query(Job).filter(Job.status == JobStatus.COMPLETED.value).count()
    failed = db.query(Job).filter(Job.status == JobStatus.FAILED.value).count()
    queued = db.query(Job).filter(Job.status == JobStatus.QUEUED.value).count()
    scheduled = db.query(Job).filter(Job.status == JobStatus.SCHEDULED.value).count()
    dead_letter = db.query(Job).filter(Job.status == JobStatus.DEAD_LETTER.value).count()
    processing = db.query(Job).filter(Job.status.in_([
        JobStatus.PROCESSING.value, JobStatus.RETRYING.value,
    ])).count()
    retrying = db.query(Job).filter(Job.status == JobStatus.RETRYING.value).count()

    finished = completed + failed + dead_letter
    success_rate = round((completed / finished) * 100, 1) if finished > 0 else 100.0

    avg_duration = db.query(func.avg(Job.duration)).filter(Job.duration.isnot(None)).scalar() or 0.0

    jobs_by_status = {}
    for status in JobStatus:
        jobs_by_status[status.value] = db.query(Job).filter(Job.status == status.value).count()

    jobs_by_priority = {}
    for p in PRIORITY_ORDER:
        jobs_by_priority[p] = db.query(Job).filter(Job.priority == p).count()

    period_map = {"1h": 1, "24h": 24, "7d": 168, "30d": 720}
    hours = period_map.get(period, 24)
    since = datetime.utcnow() - timedelta(hours=hours)

    activity_over_time = []
    if hours <= 24:
        bucket_hours = 1
    elif hours <= 168:
        bucket_hours = 24
    else:
        bucket_hours = 24

    buckets = max(1, hours // bucket_hours)
    for i in range(buckets):
        start = since + timedelta(hours=i * bucket_hours)
        end = start + timedelta(hours=bucket_hours)
        success = db.query(Job).filter(
            Job.status == JobStatus.COMPLETED.value,
            Job.completed_at >= start, Job.completed_at < end,
        ).count()
        fail = db.query(Job).filter(
            Job.status.in_([JobStatus.FAILED.value, JobStatus.DEAD_LETTER.value]),
            Job.completed_at >= start, Job.completed_at < end,
        ).count()
        activity_over_time.append({
            "time": start.isoformat(),
            "label": start.strftime("%H:%M") if bucket_hours == 1 else start.strftime("%b %d"),
            "successful": success,
            "failed": fail,
        })

    queue_distribution = jobs_by_priority
    active_workers = sum(1 for w in WORKERS if w["status"] != "offline")

    return {
        "total_jobs": total,
        "completed": completed,
        "failed": failed,
        "queued": queued,
        "scheduled": scheduled,
        "dead_letter": dead_letter,
        "processing": processing,
        "retrying": retrying,
        "success_rate": success_rate,
        "average_duration": round(avg_duration, 2),
        "queue_depth": queued + processing + retrying,
        "active_workers": active_workers,
        "jobs_by_status": jobs_by_status,
        "jobs_by_priority": jobs_by_priority,
        "activity_over_time": activity_over_time,
        "queue_distribution": queue_distribution,
    }


@router.get("/scheduled")
def list_scheduled(db: Session = Depends(get_db)):
    jobs = (
        db.query(Job)
        .filter(Job.status == JobStatus.SCHEDULED.value)
        .order_by(Job.scheduled_at)
        .all()
    )
    return {"jobs": [_job_to_response(j) for j in jobs]}


@router.get("/dead-letter")
def list_dead_letter(db: Session = Depends(get_db)):
    jobs = (
        db.query(Job)
        .filter(Job.status == JobStatus.DEAD_LETTER.value)
        .order_by(Job.completed_at.desc())
        .all()
    )
    return {"jobs": [_job_to_response(j) for j in jobs]}
