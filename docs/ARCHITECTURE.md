# TaskForge Architecture

This document describes how TaskForge is structured and how data flows through the system.

## System Overview

TaskForge is a monorepo with a Next.js frontend and a FastAPI backend. The backend owns job persistence, processing, and all monitoring data. The frontend is a dashboard that consumes the REST API.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  Landing page · Login · Dashboard (jobs, workers, metrics)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (polling every 3–5s)
┌──────────────────────────▼──────────────────────────────────┐
│                     FastAPI (backend)                       │
│  routes.py · schemas.py · models.py · services/processor.py │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
┌──────────▼──────────┐         ┌──────────▼──────────┐
│  SQLite / PostgreSQL │         │  Scheduler Loop     │
│  jobs, events, logs  │         │  (async, 1s tick)   │
└─────────────────────┘         └─────────────────────┘
```

## Backend Layers

### API Layer (`app/routes.py`)

Exposes REST endpoints under `/api`. Handles request validation via Pydantic schemas, database queries, and HTTP error responses.

### Schema Layer (`app/schemas.py`)

Defines request/response models and validation rules:

- **Task whitelist** — only predefined task names are accepted
- **Priority whitelist** — `critical`, `high`, `normal`, `low`
- **Queue whitelist** — `default`, `reports`, `emails`, `processing`
- **Payload size limit** — 10 KB maximum

### Data Layer (`app/models.py`, `app/database.py`)

SQLAlchemy models:

| Table | Purpose |
|-------|---------|
| `jobs` | Core job records with status, priority, attempts |
| `job_events` | Lifecycle events (created, queued, processing, completed, etc.) |
| `job_logs` | Processing log lines |
| `job_attempts` | Per-attempt execution records |
| `activities` | System-wide activity feed |

### Processing Layer (`app/services/processor.py`)

The heart of job execution:

1. **Scheduler loop** — runs every second in the FastAPI lifespan
2. **Scheduled promotion** — jobs past their `scheduled_at` move from `scheduled` → `queued`
3. **Priority ordering** — queued jobs sorted by priority then creation time
4. **Concurrency cap** — up to 3 jobs processing simultaneously
5. **Worker assignment** — picks an available simulated worker
6. **Task execution** — runs predefined task handlers (no arbitrary code)
7. **Retry logic** — failed jobs re-queue or move to dead-letter
8. **Activity recording** — writes events, logs, and activity entries

## Job Status Flow

```
scheduled ──(time reached)──► queued ──(worker pick)──► processing
                                                              │
                              ┌───────────────────────────────┤
                              ▼                               ▼
                         completed                        failed
                                                              │
                              ┌───────────────────────────────┤
                              ▼                               ▼
                           queued                      dead_letter
                        (retry left)                  (max attempts)
```

During a retry, status briefly shows as `retrying` while the worker re-processes the job.

## Frontend Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Public landing page |
| `/login` | Demo authentication |
| `/dashboard` | Overview metrics and charts |
| `/dashboard/jobs` | Job list with filters |
| `/dashboard/jobs/[id]` | Job detail with timeline |
| `/dashboard/queues` | Queue statistics |
| `/dashboard/workers` | Worker cards |
| `/dashboard/scheduled` | Future jobs |
| `/dashboard/dead-letter` | Failed jobs |
| `/dashboard/activity` | System activity feed |
| `/dashboard/architecture` | In-app architecture view |
| `/dashboard/settings` | Preferences |

### API Client (`src/lib/api.ts`)

A thin fetch wrapper around the backend REST API. All dashboard pages use this client.

### Data Refresh

Dashboard pages poll the API on intervals (3–5 seconds) rather than using WebSockets. This keeps deployment simple and works reliably across hosting platforms.

### Authentication (`src/lib/auth.ts`)

Demo-only authentication stored in `localStorage`. Not suitable for production.

## Security Model

TaskForge is designed for public inspection and deployment:

- **No arbitrary code execution** — task handlers are hardcoded in `processor.py`
- **Task name validation** — rejected at the API schema layer
- **Payload size limits** — prevents oversized requests
- **No filesystem access** — tasks return simulated results only
- **No environment exposure** — API responses do not include server config
- **CORS configuration** — controlled via `CORS_ORIGINS` environment variable

## Seed Data

On first startup, `app/seed.py` populates the database with ~90 demo jobs across all statuses, priorities, and queues. This gives the dashboard realistic data immediately.

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push and pull request:

- **Frontend:** `npm ci`, `npm run lint`, `npm run build`
- **Backend:** `pip install`, `pytest -v`

## Configuration

All sensitive and environment-specific values are loaded from environment variables via `app/config.py` (backend) and `NEXT_PUBLIC_*` variables (frontend). See `.env.example` for the full list.
