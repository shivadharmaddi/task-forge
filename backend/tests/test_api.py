import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///./test_taskforge.db"

from app.database import Base, engine, SessionLocal
from app.main import app
from app.seed import seed_database

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    yield


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "v1"


def test_list_jobs():
    response = client.get("/api/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert data["total"] > 0


def test_create_job():
    response = client.post("/api/jobs", json={
        "task_name": "generate_report",
        "payload": {"user_id": 1024, "source": "test"},
        "priority": "normal",
        "queue": "default",
        "max_attempts": 3,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["task_name"] == "generate_report"
    assert data["status"] in ["queued", "processing"]


def test_create_job_invalid_task():
    response = client.post("/api/jobs", json={
        "task_name": "run_shell_command",
        "payload": {},
    })
    assert response.status_code == 422


def test_get_job():
    list_response = client.get("/api/jobs")
    job_id = list_response.json()["jobs"][0]["id"]
    response = client.get(f"/api/jobs/{job_id}")
    assert response.status_code == 200
    assert response.json()["id"] == job_id
    assert "events" in response.json()
    assert "logs" in response.json()


def test_get_job_not_found():
    response = client.get("/api/jobs/job_nonexist")
    assert response.status_code == 404


def test_retry_job():
    dl_response = client.get("/api/dead-letter")
    jobs = dl_response.json()["jobs"]
    if jobs:
        job_id = jobs[0]["id"]
        response = client.post(f"/api/jobs/{job_id}/retry")
        assert response.status_code == 200
        assert response.json()["status"] == "queued"


def test_cancel_job():
    create_response = client.post("/api/jobs", json={
        "task_name": "send_email",
        "payload": {"user_id": 1},
        "priority": "low",
        "queue": "emails",
    })
    job_id = create_response.json()["id"]
    response = client.post(f"/api/jobs/{job_id}/cancel")
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_delete_job():
    create_response = client.post("/api/jobs", json={
        "task_name": "send_notification",
        "payload": {"user_id": 1},
    })
    job_id = create_response.json()["id"]
    response = client.delete(f"/api/jobs/{job_id}")
    assert response.status_code == 200
    assert client.get(f"/api/jobs/{job_id}").status_code == 404


def test_dead_letter():
    response = client.get("/api/dead-letter")
    assert response.status_code == 200
    assert "jobs" in response.json()


def test_scheduled_jobs():
    from datetime import datetime, timedelta
    future = (datetime.utcnow() + timedelta(hours=2)).isoformat()
    response = client.post("/api/jobs", json={
        "task_name": "process_dataset",
        "payload": {"user_id": 1},
        "scheduled_at": future,
    })
    assert response.status_code == 200
    assert response.json()["status"] == "scheduled"

    scheduled_response = client.get("/api/scheduled")
    assert scheduled_response.status_code == 200
    assert len(scheduled_response.json()["jobs"]) > 0


def test_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs" in data
    assert "success_rate" in data


def test_workers():
    response = client.get("/api/workers")
    assert response.status_code == 200
    assert len(response.json()) == 6


def test_queues():
    response = client.get("/api/queues")
    assert response.status_code == 200
    assert len(response.json()) == 4


def test_activity():
    response = client.get("/api/activity")
    assert response.status_code == 200
    assert len(response.json()) > 0
