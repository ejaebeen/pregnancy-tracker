# Architecture

## Goals & constraints

- **Single user, no auth.** This is a personal tool. No login, no multi-tenancy,
  no tokens. All data belongs to the one operator of the app.
- **Clean separation.** Frontend, backend, and database are independent units that
  can run (and, in principle, be deployed) separately.
- **Boring, proven stack.** React + FastAPI + PostgreSQL. No framework surprises.
- **Local-first development.** One `docker compose up` starts the database.
  Nothing else requires a cloud service.

## System overview

```
┌────────────┐   HTTP/JSON    ┌────────────┐   SQL    ┌────────────┐
│  Frontend  │ ─────────────▶ │  Backend   │ ───────▶ │ PostgreSQL │
│ React + TS │ ◀───────────── │  FastAPI   │ ◀─────── │    16      │
│ (Vite dev) │                │ (uvicorn)  │          │ (Docker)   │
│  :5173     │                │   :8000    │          │   :5432    │
└────────────┘                └────────────┘          └────────────┘
      │                            │
      └─── vite dev proxy ─────────┘   (dev-only, avoids CORS)
```

- The **frontend** is a browser app. In development it is served by Vite (`:5173`)
  which proxies API calls to the backend (`:8000`).
- The **backend** is a stateless FastAPI service. It owns all business logic and
  performs the only SQL. It holds no long-lived client state.
- The **database** is the system of record. It holds diary entries and doctor
  questions.

## Why FastAPI + SQLAlchemy 2.0

- FastAPI gives typed request/response models (Pydantic) that line up 1:1 with the
  TypeScript types on the frontend — a natural contract.
- SQLAlchemy 2.0's typed ORM (`Mapped` / `mapped_column`) keeps the model layer
  explicit and testable.
- Both are mature, widely used, and easy to find help for.

## Monorepo layout

The project lives in **one repository** with per-component folders. This keeps the
whole system in one place (easy for a solo project) while still keeping each piece
independent.

```
jl-pregnancy-tracker/           # repo root
├── frontend/                   # React + Vite + TypeScript app
├── backend/                    # FastAPI + SQLAlchemy service
├── db/                         # SQL init / optional seed scripts
├── docs/                       # THIS documentation
├── docker-compose.yml          # postgres (and optionally backend) for dev
├── .env.example                # documented environment variables
└── README.md                   # quickstart pointer into docs/
```

> The pre-existing `pregnancy-tracker/` directory (the original frontend) and the
> top-level `src/jl_pregnancy_tracker/` placeholder package are legacy and will be
> consolidated into `frontend/` and `backend/` respectively (see [roadmap.md](./roadmap.md)).

## Request flow (example: "save a diary entry")

1. User types in the diary textarea and submits.
2. `DiaryPage` component calls the API client: `POST /diary { text }`.
3. Vite dev proxy forwards the request to `http://localhost:8000/diary`.
4. FastAPI route validates the body against `DiaryCreate` (Pydantic).
5. Route opens a DB session, creates a `DiaryEntry` row, commits, closes.
6. FastAPI serializes the created row to `DiaryRead` JSON and returns `201`.
7. React updates local state from the response; the new card appears in the list.

Every mutating request follows this same shape: **validate → touch DB → serialize
→ respond**. Read requests skip the DB write.

## Cross-cutting decisions

| Concern | Decision | Rationale |
|---------|----------|-----------|
| ID type | UUIDv4 string | Generated consistently, safe to expose, no sequential leakage |
| Timestamps | Server-generated `created_at`, stored UTC | Source of truth is the DB clock; display formatted client-side |
| Timezone | Store UTC, render local in UI | Avoids server/timezone coupling |
| Validation | Pydantic on the way in, TS types on the way out | Contract enforced at the boundary |
| Errors | Small JSON error model `{ detail: string }` | Matches FastAPI defaults, easy to render |
| CORS | Dev: Vite proxy (no CORS). Prod: explicit allow-origin | Keeps dev simple, prod explicit |
| Migrations | Auto-create tables in dev; Alembic when it matters | Don't over-engineer a single-user app yet (see roadmap) |
