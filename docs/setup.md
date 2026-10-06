# Setup & Development

How to get the whole system running locally. Assumes you have **Node 20+**,
**Docker** (with the compose plugin), and **Python 3.12** (or `uv`) installed.

## Prerequisites

```bash
node -v        # v20 or newer
docker -v      # docker 24+ with compose
docker compose version
python3 --version   # 3.12+   (or: uv --version)
```

## 1. One-command launch: Full stack via Docker Compose

To start the entire application (`db`, `backend`, and `frontend`) together with zero manual multi-service launch:

```bash
docker compose up -d --build
```

Verify:

```bash
docker compose ps                 # "db", "backend", and "frontend" should be healthy/running
```

Once running:
- **Frontend SPA**: http://localhost:5173
- **Backend API**: http://localhost:8000 (and interactive docs at http://localhost:8000/docs)
- **PostgreSQL**: localhost:5432

Stop all services:
```bash
docker compose down               # preserves database data in pgdata volume
docker compose down -v            # stops and deletes database volume
```

---

## Alternative: Local development per service

If you want live code reloading for the backend or frontend without rebuilding containers:

### 1. Start only the database

From the repo root:

```bash
docker compose up -d db
```

Verify:

```bash
docker compose ps                 # "db" should be healthy/running
docker compose exec db pg_isready # should report accepting connections
```

Connection details (dev defaults from `docker-compose.yml`):

```
host: localhost
port: 5432
database: pregnancy_tracker
user: tracker
password: tracker
```

### 2. Run the backend locally

```bash
cd backend

# Option A: plain pip
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Option B: uv (faster)
uv venv && uv pip install -r requirements.txt
```

Set the environment (or put it in `backend/.env` via a dotenv loader):

```bash
export DATABASE_URL="postgresql+psycopg://tracker:tracker@localhost:5432/pregnancy_tracker"
```

Run in dev mode:

```bash
uvicorn src.main:app --reload --port 8000
```

Smoke test:

```bash
curl -s localhost:8000/health          # {"status":"ok"}
curl -s -X POST localhost:8000/diary -H 'Content-Type: application/json' -d '{"text":"hi"}'
curl -s localhost:8000/diary
```

### 3. Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 . With the Vite proxy in place, diary and question
actions read/write to the backend + Postgres instead of `localStorage`.


## Environment variables

| Variable | Where | Example | Purpose |
|----------|-------|---------|---------|
| `DATABASE_URL` | backend | as above | SQLAlchemy connection string |
| `VITE_API_BASE` | frontend | `https://api.example.com` | Optional API base (empty = same origin / proxy) |

Never commit real secrets. `.env.example` documents the names; `.env` is gitignored.

## Useful commands at a glance

```bash
# from repo root
docker compose up -d        # start db (and backend if configured)
docker compose down         # stop (keeps pgdata volume)
docker compose down -v      # stop AND wipe the database volume

# backend
uvicorn src.main:app --reload --port 8000
pytest                      # once tests exist

# frontend
npm run dev                 # dev server
npm run lint                # oxlint
npm run build               # type-check + production build
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `connection refused` to Postgres | `docker compose up -d db` not run, or a different port |
| Backend 500 on first write | `DATABASE_URL` unset/typo; confirm it matches compose |
| Frontend can't reach API | Vite proxy not configured, or backend not on `:8000` |
| Password auth fails | Postgres default `scram` — compose sets it; make sure you're not using a stale local PG |
