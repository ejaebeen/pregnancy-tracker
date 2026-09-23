# Frontend

Stack: **React 19 + Vite + TypeScript** (already present and working). The UI design
and visual language (sage/grey palette, rounded cards) are kept — this is a data +
structure refactor, not a redesign.

## What changes

The original `App.tsx` is a single component that persists to `localStorage`.
The changes are:

1. **Move** the app into the `frontend/` folder of the monorepo.
2. **Replace `localStorage`** with API calls to the FastAPI backend.
3. **Split the monolith** into small, focused components + a typed API layer.
4. **Add loading / error / empty states** so the UI behaves well across the network.

## Target folder structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts        # fetch wrapper: base url, headers, error normalization
│   │   ├── diary.ts         # getDiary, createDiary, deleteDiary
│   │   └── questions.ts     # getQuestions, createQuestion, toggleQuestion, deleteQuestion
│   ├── components/
│   │   ├── TabNav.tsx       # the Diary | Questions switcher
│   │   ├── DiaryCard.tsx    # single entry display
│   │   ├── QuestionRow.tsx  # single question row with the answered checkbox
│   │   └── EmptyMessage.tsx # shared "nothing here yet" text
│   ├── pages/
│   │   ├── DiaryPage.tsx    # form + list, owns diary state
│   │   └── QuestionsPage.tsx# form + list, owns question state
│   ├── styles/
│   │   └── theme.ts         # the sage/grey color palette (currently inline in App.tsx)
│   ├── types/
│   │   └── index.ts         # DiaryEntry, DoctorQuestion — mirror backend JSON
│   ├── App.tsx              # shell: title + active tab state only
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

## API client

A single small wrapper keeps `fetch` concerns in one place.

```ts
// src/api/client.ts
const BASE = import.meta.env.VITE_API_BASE ?? "";   // "" => same origin (proxy)

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const get   = <T>(p: string)            => request<T>(p);
export const post  = <T>(p: string, body: unknown) => request<T>(p, { method: "POST",   body: JSON.stringify(body) });
export const patch = <T>(p: string, body: unknown) => request<T>(p, { method: "PATCH",  body: JSON.stringify(body) });
export const del   =     (p: string)            => request<void>(p, { method: "DELETE" });
```

Domain modules stay thin:

```ts
// src/api/diary.ts
import { get, post, del } from "./client";
import type { DiaryEntry } from "../types";

export const getDiary     = ()        => get<DiaryEntry[]>("/diary");
export const createDiary  = (text)    => post<DiaryEntry>("/diary", { text });
export const deleteDiary  = (id)      => del(`/diary/${id}`);
```

## State ownership

- `App.tsx` keeps **only** which tab is active.
- `DiaryPage` owns diary state: `entries`, `draft`, `loading`, `error`.
- `QuestionsPage` owns question state: `questions`, `draft`, `loading`, `error`.
- On mount, each page `GET`s its collection. On mutation, call the API **then**
  update state from the response (single source of truth = server).

## Shared theme

The color palette currently hardcoded in `App.tsx` moves to `src/styles/theme.ts`:

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

Components import `theme` instead of re-declaring colors — keeps the look identical
but DRY.

## Vite dev proxy

`vite.config.ts` proxies API calls to the backend so the browser thinks the API is
same-origin (no CORS handling in dev):

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/diary":     { target: "http://localhost:8000", changeOrigin: true },
      "/questions": { target: "http://localhost:8000", changeOrigin: true },
      "/health":    { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
```

> Setting `VITE_API_BASE` in a `.env` overrides the base URL (for a deployed API),
> but in local dev you leave it unset and rely on the proxy.

## UX states to handle

| State | Diary | Questions |
|-------|-------|-----------|
| Loading | subtle spinner on first fetch | same |
| Empty | "No entries yet. Start writing above!" | "No questions logged. You're all set!" |
| Error | inline message + retry | inline message + retry |
| Submitting | disable button while `POST` in-flight | same |

These states are the main functional upgrade over the current instant-localStorage
version, and they are what make talking to a real backend feel right.
