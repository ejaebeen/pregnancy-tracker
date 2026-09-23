# Pregnancy Tracker — Documentation

This folder contains the engineering documentation for the Pregnancy Tracker project.
It is written **before** implementation and is the single source of truth for design
decisions, data model, API contract, and local development workflow.

## Contents

| Document | What it covers |
|----------|----------------|
| [architecture.md](./architecture.md) | High-level system design, monorepo layout, request flow, tech choices |
| [database.md](./database.md) | PostgreSQL schema, ORM models, data dictionary, dev DB provisioning |
| [api.md](./api.md) | REST API reference — every endpoint, request/response shapes, error model |
| [frontend.md](./frontend.md) | Frontend architecture, folder structure, API client, component model |
| [setup.md](./setup.md) | Step-by-step: prerequisites, Docker Compose, running each service, env vars |
| [roadmap.md](./roadmap.md) | Implementation order, current status, future work |

## One-paragraph summary

Pregnancy Tracker is a **single-user** personal web app to keep a daily diary and a
"questions for my doctor" checklist. It is built as three cleanly separated pieces:

- **Frontend** — React 19 + Vite + TypeScript single-page app.
- **Backend** — Python 3.12 + FastAPI + SQLAlchemy 2.0 REST API.
- **Database** — PostgreSQL 16, provisioned with Docker Compose in development.

There is **no authentication**; it is a personal app and there is one logical user.
The frontend talks to the backend over HTTP (JSON). In dev, Vite proxies `/` to the
backend so there is no CORS configuration churn.
