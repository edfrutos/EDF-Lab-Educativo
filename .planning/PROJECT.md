# EDF Lab Educativo

## What This Is

EDF Lab Educativo is a hands-on learning lab for understanding a modern web flow with a separate Express backend and a static frontend dashboard. It is for the project owner and beginner students who need to see, run, break, debug, and document the path from backend endpoints to JSON responses to rendered browser UI.

The lab includes a working API with **SQLite persistence** (`users.db`), a dashboard that performs full CRUD with `fetch()`, **16 automated API tests**, a beginner glossary, guided missions (including SQLite inspection and Docker Compose), OpenAPI contract documentation, single-container Docker (Mission 09), and an optional **Docker Compose** stack — all organized as an educational progression.

## Core Value

Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

<details>
<summary>Previous milestone context (v1.3 planning — in progress)</summary>

## Milestone: v1.3 PostgreSQL Persistence

**Goal:** Teach the evolution from SQLite to PostgreSQL as a client-server database, keeping the backend → JSON → dashboard flow intact.

**Target features:**
- PostgreSQL service in Docker Compose with persistent volume
- API uses `pg` client when `DATABASE_URL` is set; SQLite remains default for host dev
- Same `users` schema and HTTP contract for dashboard
- Migration/seed path into empty Postgres
- Updated tests, docs (`docs/15-postgresql.md`), and Mission 12

</details>

## Current State (v1.2 shipped 2026-05-31)

**Stack:** Express + `node:sqlite` + static vanilla dashboard + optional Docker Compose (nginx + API)  
**Persistence:** `api/data/users.db` (runtime), `api/data/users.json` (seed/migration only); bind mount in Compose  
**Tests:** 16/16 API tests (`npm test` in `api/`)  
**Docs:** 14 conceptual docs + Missions 10–11 (SQLite, Compose); see `docs/00-indice.md`  
**Compose:** `npm run compose:up` from repo root; dashboard :5173, API :3100

## Current Milestone: v1.3 PostgreSQL Persistence

**Goal:** Teach the evolution from SQLite to PostgreSQL as a client-server database, keeping the backend → JSON → dashboard flow intact and observable.

**Target features:**
- PostgreSQL container in Compose with named volume for data persistence
- API persistence layer using `pg` when `DATABASE_URL` is configured
- SQLite remains the default host-dev path (`npm start` without Postgres)
- Seed/migration into empty Postgres; tests updated for PostgreSQL
- Doc 15, Mission 12, NOTEBOOK entries comparing SQLite vs PostgreSQL

## Next Milestone Goals (v1.4+ — not yet planned)

Candidates deferred from earlier planning:

- Frontend framework comparison (React/Vue) after vanilla flow is solid
- Production authentication when a learning phase explicitly teaches auth

## Requirements

### Validated

- ✓ API Express exposes JSON endpoints for health, users, metadata, about, time, and user CRUD — existing
- ✓ Dashboard runs as a separate static frontend and consumes API data with `fetch()` — existing
- ✓ CORS is enabled and documented as a real browser boundary between `localhost:5173` and `localhost:3100` — existing
- ✓ Documentation explains architecture, startup, Express routes, dashboard fetch flow, CORS, debugging, and extension retos — existing
- ✓ Practical missions guide learners through starting the API, starting the dashboard, inspecting JSON, breaking/fixing CORS, and improving the UI — existing
- ✓ `NOTEBOOK.md` records decisions, real errors, and learning context — existing
- ✓ Codebase map exists in `.planning/codebase/` for stack, architecture, structure, conventions, testing, integrations, and concerns — existing
- ✓ Dashboard CRUD forms let beginners create, edit, and delete users from the browser with visible method/endpoint feedback — v1.0 Phase 01
- ✓ Users persist across API restarts via `api/data/users.json`; memory vs persistence explained with missions — v1.0 Phase 02
- ✓ `npm test` from `api/` runs automated API checks; `parseUserId` rejects partial strings like `1abc` — v1.0 Phase 03
- ✓ OpenAPI 3.0.3 spec documents all 9 API endpoints — v1.0 Phase 05
- ✓ Optional single-container Docker path (`docker:build`, `docker:start`) — v1.0 Phase 05
- ✓ SQLite persistence via `node:sqlite` with explicit `schema.sql` and `api/db.js` — v1.1 Phase 06
- ✓ JSON→SQLite auto-migration on cold start; `users.json` retained as seed only — v1.1 Phase 07
- ✓ 16 API tests with `DB_FILE` isolation; duplicate email 409 — v1.1 Phase 07
- ✓ `docs/13-sqlite.md`, Mission 10, NOTEBOOK SQLite errors — v1.1 Phase 08
- ✓ Docker Compose orchestrates API + dashboard from repo root — v1.2 Phase 09
- ✓ Dashboard nginx container on :5173; API on :3100; full CRUD against containerized API — v1.2 Phase 09
- ✓ SQLite bind mount `./api/data` persists across compose restarts — v1.2 Phase 10
- ✓ Root `compose:up/down/logs` scripts; doc 14 + Mission 11 — v1.2 Phase 11

### Active

- [ ] PostgreSQL persistence layer with `pg` client — v1.3
- [ ] Postgres service in Compose + learning material — v1.3
- [ ] Frontend framework comparison (React/Vue) — candidate v1.4+
- [ ] Production authentication and deployment hardening — future advanced phase

### Out of Scope

- Full production authentication — not needed for the current beginner-focused API/data-flow lab.
- Kubernetes / Swarm — Compose is the beginner orchestration step.
- nginx reverse proxy `/api` in v1.2 — documented as advanced reto only.
- Frontend frameworks in the near term — keep HTML, CSS, and JavaScript vanilla until a framework has clear teaching value.
- Production deployment hardening — local learning remains the first target.
- Complex dependency additions without educational payoff — project rules explicitly prefer avoiding unnecessary dependencies.

## Context

The lab is organized around a learning route:

- `docs/` explains the concepts in reading order (glossary, tests, OpenAPI, Docker, Compose).
- `missions/` provides executable practice (11 missions including SQLite, Docker, Compose).
- `ROADMAP.md` lists the educational evolution; v1.0, v1.1, and v1.2 milestones complete.
- `NOTEBOOK.md` captures real decisions, errors, and lessons.
- `api/` contains the Express backend with SQLite persistence, tests, OpenAPI spec, and Dockerfile.
- `dashboard/` contains the static frontend with full CRUD; optional nginx container via Compose.
- `docker-compose.yml` + root `package.json` scripts for optional multi-container path.

**v1.2 milestone shipped 2026-05-31:** 3 phases, 7 plans, 13/13 requirements, runtime UAT pass (compose persistence).

**v1.1 milestone shipped 2026-05-30:** 3 phases, 8 plans, 16 API tests passing.

**v1.0 milestone shipped 2026-05-30:** 5 phases, 13 plans, dashboard CRUD + JSON persistence + tests + OpenAPI + Docker.

## Constraints

- **Educational clarity**: Every change needs a didactic explanation because the repo is a learning lab.
- **Executable examples**: Every concept should include something learners can run.
- **Documentation discipline**: Relevant real errors belong in `NOTEBOOK.md`.
- **Mission format**: Every mission needs objective, steps, expected result, and extra challenge.
- **Dependency restraint**: Do not add dependencies unless they add clear educational value.
- **Validation**: Validate whenever practical with syntax checks, endpoint checks, audits, or tests.
- **Current stack**: Express backend plus static vanilla frontend remains the base.
- **Future stack flexibility**: Frameworks allowed later when they support the learning path.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the lab beginner-oriented | Stated audience is project owner and beginner students | ✓ Good — v1.0 |
| Use `node:sqlite` over `better-sqlite3` for v1.1 | Zero deps; comparison documentary only | ✓ Good — v1.1 |
| Docker Compose over single-container only | Teaches orchestration after Dockerfile basics | ✓ Good — v1.2 |
| nginx for dashboard container | Static files + simple config; no Node build step | ✓ Good — v1.2 |
| Bind mount for SQLite in Compose | Same path as host dev; inspectable `users.db` | ✓ Good — v1.2 |
| Direct published ports (no reverse proxy) | Beginner transparency; CORS already works | ✓ Good — v1.2 |
| Host dev path remains primary | Compose is advanced optional | ✓ Good — v1.2 |
| Allow frameworks later | Future phases may benefit once fundamentals are established | — Pending v1.4 |
| PostgreSQL as next DB step after SQLite | Client-server DB teaches scaling beyond embedded SQLite | — Pending v1.3 |
| Keep SQLite as host-dev default | Lower friction for beginners; Postgres via Compose/env optional | — Pending v1.3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-31 after v1.3 milestone started*
