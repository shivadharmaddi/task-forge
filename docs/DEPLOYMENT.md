# Deployment Guide

This guide covers deploying TaskForge to production using Vercel (frontend) and Render or Railway (backend).

## Overview

| Component | Platform | URL Example |
|-----------|----------|-------------|
| Frontend | Vercel | `https://taskforge.shivadhar.com` |
| Backend | Render / Railway | `https://taskforge-api.onrender.com` |

## Backend Deployment (Render)

### 1. Create a Web Service

- Connect your GitHub repository
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2. Environment Variables

```
DATABASE_URL=sqlite:///./taskforge.db
CORS_ORIGINS=https://taskforge.shivadhar.com,https://your-app.vercel.app
ENVIRONMENT=production
```

For PostgreSQL on Render, use the provided `DATABASE_URL` connection string. The SQLAlchemy layer supports both SQLite and PostgreSQL without code changes.

### 3. Persistent Disk (SQLite)

If using SQLite in production, attach a persistent disk at `/app` so the database survives restarts.

For PostgreSQL, no disk is needed.

## Backend Deployment (Railway)

1. Create a new project from your repository
2. Set root directory to `backend`
3. Railway auto-detects Python and runs `uvicorn`
4. Add environment variables as above
5. Add a PostgreSQL plugin if desired

## Frontend Deployment (Vercel)

### 1. Import Project

- Connect your GitHub repository
- Root directory: `frontend`
- Framework preset: Next.js

### 2. Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_SITE_URL=https://taskforge.shivadhar.com
```

### 3. Custom Domain

In Vercel project settings → Domains, add your custom domain (e.g., `taskforge.shivadhar.com`).

Update DNS with the records Vercel provides.

## CORS Configuration

Ensure the backend `CORS_ORIGINS` includes your frontend URL:

```
CORS_ORIGINS=https://taskforge.shivadhar.com
```

Multiple origins are comma-separated.

## Docker Deployment

For self-hosted deployment:

```bash
docker compose up --build -d
```

Update `docker-compose.yml` environment variables for production URLs.

## Health Check

Verify the backend is running:

```bash
curl https://your-api-url/api/health
```

Expected response:

```json
{"status": "ok", "version": "v1", "timestamp": "..."}
```

## Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads landing page
- [ ] Demo login works
- [ ] Dashboard metrics load from API
- [ ] Job creation works end-to-end
- [ ] CORS is configured correctly
- [ ] Custom domain resolves
- [ ] Open Graph metadata displays correctly when shared

## Troubleshooting

**API Offline in dashboard:** Check `NEXT_PUBLIC_API_URL` points to the correct backend URL and CORS allows your frontend origin.

**Empty dashboard:** The backend seeds data on first startup. Ensure the database is writable.

**Build failures:** Verify Node.js 20+ and Python 3.12+ in CI/deployment environments.
