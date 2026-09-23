# AGENTS.md — Coding Agent Guidelines for Pregnancy Tracker

> **Project Mission**: A clean, single-user personal web application for tracking daily pregnancy journal entries and keeping a running list of questions for the doctor.
> **Single Source of Truth**: The engineering specifications in [`docs/`](./docs/) define all architectural contracts, database schemas, and API routes. Always consult `docs/` before making architectural or design changes.

---

## 1. System Architecture & High-Level Design

The app follows a local-first, three-tier architecture with clean separation of concerns:

- **Frontend**: React 19 + TypeScript + Vite SPA. Talks to the backend over HTTP/JSON.
  - In development, Vite dev server (`:5173`) proxies API requests to `:8000` to avoid CORS issues.
- **Backend**: Python 3.12 + FastAPI + SQLAlchemy 2.0 REST API running on Uvicorn (`:8000`).
  - Stateless service containing all business logic, validation, and database interactions.
- **Database**: PostgreSQL 16 provisioned via Docker Compose (`:5432`).
  - Stores all persistent data (`diary_entries`, `doctor_questions`).

### Key Architectural Tenets
1. **Single-user, zero auth**: No login, JWT, sessions, or multi-tenancy. All data belongs to the single operator. Do NOT add authentication unless explicitly requested.
2. **Server is source of truth**: IDs (UUIDv4) and timestamps (`created_at` in UTC) are generated server-side.
3. **Boring, proven stack**: Keep dependencies lean. Avoid introducing complex state libraries (Redux, Zustand) or server-state wrappers (React Query) unless strictly justified.
4. **Contract alignment**: Frontend TypeScript interfaces mirror FastAPI Pydantic models 1:1 using `snake_case`.

---

## 2. Repository Layout & Current State

### Target Monorepo Structure
```
jl-pregnancy-tracker/
├── frontend/               # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── api/            # client.ts, diary.ts, questions.ts
│   │   ├── components/     # TabNav, DiaryCard, QuestionRow, EmptyMessage
│   │   ├── pages/          # DiaryPage.tsx, QuestionsPage.tsx
│   │   ├── styles/         # theme.ts (sage/grey palette)
│   │   ├── types/          # index.ts (mirrors backend schemas)
│   │   ├── App.tsx         # Shell with tab navigation
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts      # Configured with proxy to :8000
├── backend/                # FastAPI + SQLAlchemy service
│   ├── src/
│   │   ├── main.py         # FastAPI application entrypoint & middleware
│   │   ├── config.py       # Pydantic Settings / environment variables
│   │   ├── database.py     # SQLAlchemy engine, sessionmaker, Base
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   ├── schemas.py      # Pydantic request/response schemas
│   │   ├── crud.py         # Database query and mutation functions
│   │   └── routers/        # diary.py, questions.py, health.py
│   ├── requirements.txt    # Or pyproject.toml / uv.lock
│   └── Dockerfile
├── db/
│   └── init.sql            # Optional seed data for first Docker run
├── docs/                   # Engineering docs (single source of truth)
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── frontend.md
│   ├── setup.md
│   └── roadmap.md
├── docker-compose.yml      # Postgres 16 service (+ optional backend)
├── .env.example            # Documented environment variables
└── README.md
```

### Current Migration Status (See `docs/roadmap.md`)
- The initial React app currently resides in `pregnancy-tracker/` (uses `localStorage`).
- Migration roadmap:
  - Phase 1: Scaffold `docker-compose.yml`, `db/init.sql`, and `backend/`. Rename/move `pregnancy-tracker/` to `frontend/` and configure Vite proxy.
  - Phase 2: Create `frontend/src/api/`, split `App.tsx` into `DiaryPage` and `QuestionsPage`, replace `localStorage` with API calls, and handle loading/error/empty/submitting states.
  - Phase 3: Extract `theme.ts`, remove legacy `src/jl_pregnancy_tracker/` placeholder.

When working on tasks, verify which directory structure is active and follow the phased roadmap in [`docs/roadmap.md`](./docs/roadmap.md).

---

## 3. Database & Schema Specifications

Database: **PostgreSQL 16**. Managed via SQLAlchemy 2.0 ORM (`backend/src/models.py`).

### Schema
1. **`diary_entries`**:
   - `id`: `VARCHAR(36)` (UUIDv4 string, Primary Key).
   - `created_at`: `TIMESTAMP` (NOT NULL, default server UTC `func.now()`).
   - `text`: `TEXT` (NOT NULL, min length 1).

2. **`doctor_questions`**:
   - `id`: `VARCHAR(36)` (UUIDv4 string, Primary Key).
   - `created_at`: `TIMESTAMP` (NOT NULL, default server UTC `func.now()`).
   - `text`: `TEXT` (NOT NULL, min length 1).
   - `is_answered`: `BOOLEAN` (NOT NULL, default `false`).

### Rules for Database Code
- Use modern SQLAlchemy 2.0 typed style (`Mapped[T]`, `mapped_column(...)`).
- Table and column names must be `snake_case`.
- Do NOT add `user_id` or tenant columns (single-user application).
- For local development, create tables via `Base.metadata.create_all(bind=engine)` on startup.

---

## 4. API Contract & Conventions

- **Base URL**: Routes are mounted at root (`/diary`, `/questions`, `/health`).
- **Data Format**: All payloads and responses are JSON.
- **Timestamps**: Serialized as ISO-8601 UTC strings (e.g. `2026-09-22T20:00:00Z`).
- **Error Model**: Standard FastAPI JSON response: `{ "detail": "error message" }`.

### Endpoints
| Method | Path | Request Body | Status | Response Body | Description |
|---|---|---|---|---|---|
| `GET` | `/health` | None | `200` | `{"status": "ok"}` | Liveness check |
| `GET` | `/diary` | None | `200` | `DiaryEntry[]` | List entries, newest first |
| `POST` | `/diary` | `{"text": string}` | `201` | `DiaryEntry` | Create diary entry |
| `DELETE`| `/diary/{id}` | None | `204` | Empty | Delete entry |
| `GET` | `/questions` | None | `200` | `DoctorQuestion[]`| List questions, newest first |
| `POST` | `/questions` | `{"text": string}` | `201` | `DoctorQuestion` | Create question (`is_answered: false`) |
| `PATCH` | `/questions/{id}` | `{"is_answered": boolean}` | `200` | `DoctorQuestion` | Toggle or update answered status |
| `DELETE`| `/questions/{id}` | None | `204` | Empty | Delete question |

---

## 5. Frontend Guidelines & UI Aesthetics

### UI Design & Styling
- The design follows a calming, aesthetic sage-green and grey palette.
- **Color Theme (`src/styles/theme.ts`)**:
  ```ts
  export const theme = {
    sage: "#9fb4a4",
    sageDark: "#7f9183",
    bg: "#ffffff",
    softGrey: "#f4f5f3",
    border: "#e8ece9",
    textMain: "#4a4a4a",
    textLight: "#95a5a6",
  } as const;
  ```
- Use rounded cards (`borderRadius: '14px' | '20px'`), subtle shadows (`0 8px 30px rgba(0,0,0,0.04)`), and generous padding.
- Do not introduce heavy UI component libraries (Tailwind, MUI, etc.) unless requested. Keep existing CSS-in-JS or clean CSS modules aligned with `theme.ts`.

### UX State Handling
When connecting the UI to API endpoints, always support the 4 core asynchronous UX states:
1. **Loading**: Show subtle loading indication during initial fetch.
2. **Empty**:
   - Diary: *"No entries yet. Start writing above!"*
   - Questions: *"No questions logged. You're all set!"*
3. **Submitting**: Disable submit buttons while `POST` is in-flight to prevent duplicate submissions.
4. **Error**: Display a user-friendly error banner/message with a retry action.

---

## 6. Development Workflow & Commands

### Prerequisites & Ports
- Node.js 20+, Python 3.12+ (or `uv`), Docker with Compose.
- **Ports**: Frontend `5173`, Backend `8000`, Database `5432`.

### Starting Services
```bash
# 1. Database (from repo root)
docker compose up -d db

# 2. Backend (from backend/)
uvicorn src.main:app --reload --port 8000

# 3. Frontend (from frontend/ or pregnancy-tracker/)
npm install
npm run dev
```

### Verification & Linting
```bash
# Frontend lint & build check
npm run lint         # oxlint
npm run build        # type-check + production build

# Quick API verification
curl -s http://localhost:8000/health
curl -s http://localhost:8000/diary
curl -s http://localhost:8000/questions
```

---

## 7. Rules & Guardrails for AI Agents

1. **Check `docs/` First**: Before implementing any route, model, or UI change, read the corresponding doc in [`docs/`](./docs/). If code and docs diverge, update code to match docs or flag the discrepancy.
2. **Do Not Over-Engineer**:
   - Do NOT add authentication, user accounts, JWT tokens, or multi-tenant database foreign keys.
   - Do NOT add Alembic migrations during initial scaffolding (use `Base.metadata.create_all`).
   - Do NOT add heavy third-party state managers unless requested.
3. **Maintain Working Code**:
   - Always run `npm run lint` and verify types before finishing frontend work.
   - Ensure imports and dependencies are explicitly declared (`package.json`, `requirements.txt` / `pyproject.toml`).
4. **Preserve Existing Functionality**:
   - Retain the existing diary entry formatting and question checklist behavior.
   - Keep dates formatted clearly for the user (store UTC in database, render localized strings in UI).
5. **Security & Secrets**:
   - Never commit sensitive secrets or credentials into version control. Use `.env` (gitignored) and maintain `.env.example`.
