# Roadmap

Implementation order, and what is / isn't in scope yet.

## Phase 1 — Foundation (first)

1. Scaffold `docker-compose.yml` + `db/init.sql`; confirm Postgres is reachable.
2. Create `backend/` (`main.py`, `config.py`, `database.py`, `models.py`,
   `schemas.py`, `crud.py`, `routers/`); run and verify every endpoint with `curl`.
3. Move `pregnancy-tracker/` → `frontend/`; add Vite dev proxy.

## Phase 2 — Wire the data layer

4. Build `frontend/src/api/` (client + diary + questions).
5. Refactor `App.tsx` into `App.tsx` (shell) + `DiaryPage` + `QuestionsPage`.
6. Replace `localStorage` reads/writes with API calls.
7. Add loading / error / empty / submitting states.

## Phase 3 — Polish & cleanup

8. Extract `theme.ts`; move inline styles into shared components.
9. Add `DELETE` UI (optional, the API already supports it).
10. Housekeeping: remove legacy `pregnancy-tracker/` and the top-level
    `src/jl_pregnancy_tracker/` placeholder; update `.gitignore`, `.env.example`,
    and the root `README.md` to point at `docs/`.
11. (Optional) Add a `backend` service to `docker-compose.yml`.

## Not in scope yet (deliberate)

These are intentionally **out of scope** for the current single-user build.
Each has a clear trigger for when to revisit:

| Feature | When to add |
|---------|-------------|
| **Auth / multi-user** | When the app is used by more than one person. Add `users` table, `user_id` FKs, JWT/session. |
| **Alembic migrations** | When the schema changes in ways that require in-place migration of existing rows. |
| **React Query / SWR** | When list cache / revalidation / optimistic updates become worth it. |
| **Tests** | Unit tests for `crud.py` and API tests via FastAPI `TestClient`; component tests for the pages. High value, do soon. |
| **CI** | A GitHub Actions job: backend `pytest` + frontend `npm run lint && npm run build`. |
| **Deployment** | Serve `frontend/dist` from a static host + reverse proxy to `backend` → `db`. |
| **Soft delete / archive** | If "delete" is too destructive and history matters. |

## Current status

- [x] Initial React frontend (single `App.tsx`, `localStorage`) — present in this repo
- [x] Documentation (`docs/`) — this work
- [ ] Monorepo reorganization (`frontend/`, `backend/`)
- [ ] FastAPI + SQLAlchemy backend
- [ ] PostgreSQL via Docker Compose
- [ ] Frontend wired to the API
- [ ] State handling (loading/error/empty)
