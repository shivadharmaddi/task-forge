# TaskForge

**Distributed job processing, built for reliability.**

Create, schedule, monitor, retry, and inspect background jobs from one clean dashboard.

## Overview

TaskForge is a portfolio project that demonstrates distributed job processing through a polished web application. It shows how background jobs move through queues, get processed by workers, handle retries, and end up in a dead-letter queue when they fail repeatedly.

The frontend provides a professional infrastructure dashboard. The backend is a lightweight FastAPI service with SQLite that actually processes jobs — this is not a static UI mockup.

This implementation uses **simulated workers** and lightweight in-process job processing rather than a production distributed worker cluster.

## Features

- Job creation and monitoring
- Priority queues (critical, high, normal, low)
- Scheduled jobs
- Retry handling
- Dead-letter queue
- Worker monitoring
- Execution timelines
- Activity tracking
- Dashboard analytics

## Architecture

```
Next.js Frontend  →  FastAPI API  →  Job Processing Layer  →  SQLite Database
                              ↓
                    Scheduler / Workers / Metrics
```

- **Frontend:** Next.js dashboard and public landing page
- **Backend:** FastAPI REST API with SQLAlchemy ORM
- **Database:** SQLite locally; PostgreSQL-compatible via `DATABASE_URL`
- **Processing:** Lightweight async scheduler with simulated workers

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Python, FastAPI, SQLAlchemy |
| Testing | pytest |
| Infrastructure | Docker, GitHub Actions |

## Project Structure

```
taskforge/
├── frontend/           # Next.js app (landing + dashboard)
├── backend/            # FastAPI API and job processor
│   ├── app/            # Application code
│   └── tests/          # API tests
├── docs/               # Deployment documentation
├── .github/workflows/  # CI pipeline
├── docker-compose.yml
├── .env.example
└── README.md
```

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.12+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API seeds demo data on first startup.

### Frontend

```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Login

- Email: `demo@taskforge.dev`
- Password: `demo123`

### Docker

```bash
docker compose up --build
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./taskforge.db` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `NEXT_PUBLIC_API_URL` | Backend URL for the frontend | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for metadata | `http://localhost:3000` |

Copy `.env.example` and adjust for your environment. Never commit `.env` files.

## Testing

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm run lint && npm run build
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel (frontend) and Render/Railway (backend) instructions.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | List jobs (with filters) |
| POST | `/api/jobs` | Create a job |
| GET | `/api/jobs/{id}` | Job details |
| POST | `/api/jobs/{id}/retry` | Retry a failed job |
| POST | `/api/jobs/{id}/cancel` | Cancel a job |
| DELETE | `/api/jobs/{id}` | Delete a job |
| GET | `/api/workers` | List workers |
| GET | `/api/queues` | Queue statistics |
| GET | `/api/activity` | Activity feed |
| GET | `/api/metrics` | Dashboard metrics |
| GET | `/api/scheduled` | Scheduled jobs |
| GET | `/api/dead-letter` | Dead-letter jobs |

## Engineering Decisions

1. **Simulated workers** — Six worker identities with realistic metrics, tied to actual job processing
2. **In-process scheduler** — Async loop processes queued and scheduled jobs without Redis or Celery
3. **Predefined tasks only** — No arbitrary code execution from user payloads
4. **SQLite default** — Simple local development; swap to PostgreSQL via `DATABASE_URL`
5. **Frontend-focused** — Polished UI with a functional but lightweight backend

## Limitations

- Workers are simulated, not separate processes
- No horizontal scaling or distributed locking
- Demo authentication only (localStorage)
- Single-node SQLite is not suitable for high concurrency

## License

MIT License. See [LICENSE](LICENSE).
