from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

ALLOWED_TASKS = {
    "generate_report",
    "send_email",
    "process_dataset",
    "resize_image",
    "sync_customer",
    "export_invoice",
    "send_notification",
    "unstable_task",
    "always_fail",
}

ALLOWED_PRIORITIES = {"critical", "high", "normal", "low"}
ALLOWED_QUEUES = {"default", "reports", "emails", "processing"}


class JobCreate(BaseModel):
    task_name: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    priority: str = "normal"
    queue: str = "default"
    max_attempts: int = 3
    scheduled_at: Optional[datetime] = None

    @field_validator("task_name")
    @classmethod
    def validate_task(cls, v: str) -> str:
        if v not in ALLOWED_TASKS:
            raise ValueError(f"Task '{v}' is not allowed. Allowed: {', '.join(sorted(ALLOWED_TASKS))}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in ALLOWED_PRIORITIES:
            raise ValueError(f"Invalid priority '{v}'")
        return v

    @field_validator("queue")
    @classmethod
    def validate_queue(cls, v: str) -> str:
        if v not in ALLOWED_QUEUES:
            raise ValueError(f"Invalid queue '{v}'")
        return v


class JobResponse(BaseModel):
    id: str
    task_name: str
    payload: Dict[str, Any]
    status: str
    priority: str
    queue: str
    attempt_count: int
    max_attempts: int
    worker_id: Optional[str]
    error_message: Optional[str]
    result: Optional[Dict[str, Any]]
    created_at: datetime
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration: Optional[float]

    model_config = {"from_attributes": True}


class JobEventResponse(BaseModel):
    id: int
    event_type: str
    description: str
    worker_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class JobLogResponse(BaseModel):
    id: int
    level: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobAttemptResponse(BaseModel):
    id: int
    attempt_number: int
    worker_id: Optional[str]
    status: str
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    duration: Optional[float]

    model_config = {"from_attributes": True}


class JobDetailResponse(JobResponse):
    events: List[JobEventResponse] = []
    logs: List[JobLogResponse] = []
    attempts: List[JobAttemptResponse] = []


class WorkerResponse(BaseModel):
    id: str
    status: str
    state: str
    current_job: Optional[str]
    jobs_processed: int
    failures: int
    success_rate: float
    average_runtime: float
    uptime: str
    last_heartbeat: str
    last_heartbeat_at: datetime


class QueueResponse(BaseModel):
    name: str
    priority: str
    waiting: int
    processing: int
    failed: int
    average_wait: float
    throughput: int
    pending: int
    completed_today: int
    failed_today: int


class ActivityResponse(BaseModel):
    id: int
    event_type: str
    category: str
    message: str
    job_id: Optional[str]
    worker_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class MetricsResponse(BaseModel):
    total_jobs: int
    completed: int
    failed: int
    queued: int
    scheduled: int
    dead_letter: int
    processing: int
    retrying: int
    success_rate: float
    average_duration: float
    queue_depth: int
    active_workers: int
    jobs_by_status: Dict[str, int]
    jobs_by_priority: Dict[str, int]
    activity_over_time: List[Dict[str, Any]]
    queue_distribution: Dict[str, int]
