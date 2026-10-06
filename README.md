# Pregnancy Tracker

A personal app to keep a daily pregnancy diary and a running list of questions for
the doctor.

Built as three separated pieces: a **React + Vite + TypeScript** frontend, a
**FastAPI + SQLAlchemy** backend (Python 3.12), and a **PostgreSQL** database
provisioned with Docker Compose.

## Quickstart

Run the entire application (database, backend, and frontend) with a single command:

```bash
docker compose up -d --build
```

Then visit http://localhost:5173.

## Documentation

All engineering documentation lives in [`docs/`](./docs/):

- [Architecture](./docs/architecture.md)
- [Database](./docs/database.md)
- [API reference](./docs/api.md)
- [Frontend](./docs/frontend.md)
- [Setup & development](./docs/setup.md)
- [Roadmap](./docs/roadmap.md)

Start with [docs/setup.md](./docs/setup.md) for full setup details and per-service development options.

