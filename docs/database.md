# Database

Database: **PostgreSQL 16**. Provisioned in development with Docker Compose
(see [setup.md](./setup.md)).

The backend is the **only** component that talks to the database. The frontend
never issues SQL — it only speaks the REST API.

## Tables

### `diary_entries`

A free-form daily journal entry.

| Column     | Type           | Constraints            | Notes                              |
|------------|----------------|------------------------|------------------------------------|
| `id`       | `VARCHAR(36)`  | PK, default `uuid4()`  | Stable public identifier           |
| `created_at` | `TIMESTAMP`  | NOT NULL, default `now()` | Creation time (UTC)            |
| `text`     | `TEXT`         | NOT NULL, length ≥ 1   | The entry body                     |

### `doctor_questions`

A question to ask at the next doctor's visit, with an answered flag.

| Column      | Type           | Constraints               | Notes                             |
|-------------|----------------|---------------------------|-----------------------------------|
| `id`        | `VARCHAR(36)`  | PK, default `uuid4()`     | Stable public identifier          |
| `created_at`| `TIMESTAMP`    | NOT NULL, default `now()` | Creation time (UTC)               |
| `text`      | `TEXT`         | NOT NULL, length ≥ 1      | The question                      |
| `is_answered` | `BOOLEAN`   | NOT NULL, default `false` | Toggled by the user               |

> There are no user/ownership columns because the app is single-user. The moment
> multi-user support is desired, a `users` table and a `user_id FK` on each table
> become required (see [roadmap.md](./roadmap.md)).

## ORM models (SQLAlchemy 2.0, `backend/src/models.py`)

```python
from datetime import datetime
from uuid import uuid4
from sqlalchemy import String, Text, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    text: Mapped[str] = mapped_column(Text)

class DoctorQuestion(Base):
    __tablename__ = "doctor_questions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    text: Mapped[str] = mapped_column(Text)
    is_answered: Mapped[bool] = mapped_column(Boolean, default=False)
```

## Conventions

- **Primary keys** are UUID strings. The frontend treats `id` as an opaque string.
- **`created_at`** is always written by the server (or DB default), never accepted
  from the client on create.
- **No hard deletes for now?** — the current UI has no delete action and there is no
  requirement, so the API supports `DELETE` for completeness but the frontend does
  not surface it yet. (Revisit if a "soft delete / archive" is wanted.)
- Column names are **snake_case**; the JSON API surfaces the same snake_case names
  to keep a 1:1 mapping between ORM and API.

## Dev provisioning

Development uses a throwaway container so nothing is ever lost on a real server:

- Image: `postgres:16-alpine`
- Database: `pregnancy_tracker`
- User / password: `tracker` / `tracker`  *(dev only — never ship these)*
- Volume: `pgdata` → `/var/lib/postgresql/data` (persists across container restarts)
- Optional init script mounted at `/docker-entrypoint-initdb.d/` for seed data.

The backend creates tables on startup **in development only**
(`Base.metadata.create_all`). For anything beyond a toy, switch to Alembic
migrations (see [roadmap.md](./roadmap.md)).

## Seed data (optional)

`db/init.sql` can be used to load sample rows on first container start. Example:

```sql
-- db/init.sql (runs once, only on first volume init)
INSERT INTO diary_entries (id, text) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Moved everything into the new architecture.');
```

Seed data is **optional** and purely to make local dev feel less empty.
