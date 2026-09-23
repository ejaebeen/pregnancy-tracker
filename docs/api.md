# REST API

Base path: the backend serves its routes at the origin. In development the browser
calls relative paths (`/diary`, `/questions`) and Vite forwards them to the backend.
In production a reverse proxy serves the same contract.

All request and response bodies are **JSON**. All timestamps are
**ISO-8601 UTC** (e.g. `2026-09-20T14:03:22Z`).

## Conventions

- **IDs** are UUID strings, returned as-is.
- **Naming** in JSON is snake_case (`created_at`, `is_answered`).
- **Success** codes: `200` (get/patch), `201` (create).
- **Not found** returns `404` with the standard error body.
- **Validation failure** returns `422`.

### Data shapes

```ts
// DiaryEntry
{
  id: string;        // uuid
  created_at: string; // ISO-8601
  text: string;
}

// DoctorQuestion
{
  id: string;         // uuid
  created_at: string; // ISO-8601
  text: string;
  is_answered: boolean;
}

// Error
{ detail: string }
```

---

## Health

### `GET /health`

Liveness probe.

- **200** → `{ "status": "ok" }`

---

## Diary

### `GET /diary`

List all diary entries, **newest first**.

- **200** → `DiaryEntry[]`
- **204 / empty array** → no entries yet.

### `POST /diary`

Create a diary entry.

- **Request** → `{ "text": "How are you feeling today?" }`
- **201** → the created `DiaryEntry`.
- **422** → missing/empty `text`.

### `DELETE /diary/{id}`

Delete one entry.

- **204** → deleted (no body).
- **404** → no such id.

---

## Questions

### `GET /questions`

List all doctor questions, **newest first**.

- **200** → `DoctorQuestion[]`

### `POST /questions`

Create a question (`is_answered` defaults to `false`).

- **Request** → `{ "text": "Is it safe to eat raw fish?" }`
- **201** → the created `DoctorQuestion`.
- **422** → missing/empty `text`.

### `PATCH /questions/{id}`

Update a question. Used to toggle the answered state.

- **Request** → `{ "is_answered": true }`
- **200** → the updated `DoctorQuestion`.
- **404** → no such id.
- **422** → bad field.

### `DELETE /questions/{id}`

Delete one question.

- **204** → deleted (no body).
- **404** → no such id.

---

## FastAPI route map (for implementers)

| Method | Path             | Handler | Returns |
|--------|------------------|---------|---------|
| GET    | `/health`        | `health` | `HealthOut` |
| GET    | `/diary`         | `list_diary` | `list[DiaryRead]` |
| POST   | `/diary`         | `create_diary` | `DiaryRead` (201) |
| DELETE | `/diary/{id}`    | `delete_diary` | `204` |
| GET    | `/questions`     | `list_questions` | `list[QuestionRead]` |
| POST   | `/questions`     | `create_question` | `QuestionRead` (201) |
| PATCH  | `/questions/{id}`| `update_question` | `QuestionRead` |
| DELETE | `/questions/{id}`| `delete_question` | `204` |

## Manual smoke test (after the backend is running)

```bash
curl -s localhost:8000/health

curl -s -X POST localhost:8000/diary \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello from curl"}'

curl -s localhost:8000/diary

curl -s -X POST localhost:8000/questions \
  -H 'Content-Type: application/json' \
  -d '{"text":"Can I have coffee?"}'

curl -s -X PATCH localhost:8000/questions/<id> \
  -H 'Content-Type: application/json' \
  -d '{"is_answered":true}'
```
