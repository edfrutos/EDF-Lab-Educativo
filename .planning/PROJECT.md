# EDF Lab Educativo

## What This Is

EDF Lab Educativo is a hands-on learning lab for understanding a modern web flow with a separate Express backend and a static frontend dashboard. It is for the project owner and beginner students who need to see, run, break, debug, and document the path from backend endpoints to JSON responses to rendered browser UI.

The lab includes a working API with **dual persistence** (SQLite on host dev, PostgreSQL in Compose), a **vanilla** dashboard plus optional **React** and **Vue** dashboards (same CRUD contract), **32 automated API tests** (16 SQLite + 16 Postgres), guided missions through framework comparison, OpenAPI contract documentation, and optional container paths — all organized as an educational progression.

## Core Value

Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## Current Milestone: v2.1 Advanced E2E

**Goal:** Extender Playwright más allá del smoke de auth — CRUD UI en los tres dashboards, API Postgres en E2E, y multi-browser en CI — con material didáctico que documenta la fricción real.

**Target features:**
- CRUD E2E completo (vanilla → React/Vue) con helper compartido
- E2E contra API con `DATABASE_URL` / Postgres aislado
- Firefox (y WebKit documentado) en la matriz CI
- Mission 17 + NOTEBOOK v2.1 + `docs/10-tests.md` ampliado

## Current State (v2.0 shipped 2026-06-15)

**Stack:** Express + auth + `node:sqlite` / `pg` + vanilla / React / Vue dashboards + Playwright E2E  
**Persistence:** SQLite host dev; PostgreSQL in Compose; E2E uses isolated `api/data/e2e.users.db`  
**Tests:** `test:sqlite` 24 · `test:pg` 23 · `test:e2e` 3 Playwright specs (vanilla, React, Vue)  
**CI:** Three parallel jobs on every PR — `test-sqlite`, `test-postgres`, `e2e-smoke` (Node 22)  
**Frontends:** `:5173` vanilla · `:5174` React · `:5175` Vue — login gate + `credentials: 'include'`  
**Docs:** Mission 16 (E2E smoke); `docs/10-tests.md` matriz CI; NOTEBOOK Quality & CI (v2.0)  
**Compose:** `npm run compose:up` — Postgres + API + dashboard nginx

<details>
<summary>Previous milestone: v1.6 (archived)</summary>

**Shipped 2026-06-14:** React/Vue auth parity, CI SQLite 24 tests, rate limit, Mission 15.

See `.planning/milestones/v1.6-ROADMAP.md`.

</details>

<details>
<summary>Previous milestone: v1.5 planning context (archived)</summary>

**Goal:** Teach authentication and production-minded deployment without breaking the beginner path.

**Shipped:** Phases 18–21 — API auth, vanilla login, secrets/deploy hardening, learning material.

See `.planning/milestones/v1.5-ROADMAP.md`.

</details>

<details>
<summary>Previous milestone: v1.4 (archived)</summary>

**Shipped:** React/Vue dashboards, `docs/16-frameworks.md`, Mission 13.

See `.planning/milestones/v1.4-ROADMAP.md`.

</details>

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
- ✓ PostgreSQL persistence via `pg` when `DATABASE_URL` is set; same HTTP/JSON contract — v1.3 Phase 12
- ✓ Compose three-service stack with Postgres named volume — v1.3 Phase 12
- ✓ Shared seed into empty Postgres; dual test suite on `edf_lab_test` — v1.3 Phase 13
- ✓ `docs/15-postgresql.md`, Mission 12, NOTEBOOK Postgres errors — v1.3 Phase 14
- ✓ `dashboard-react/` — Vite + React 18, port 5174, full CRUD parity — v1.4 Phase 15
- ✓ `dashboard-vue/` — Vite + Vue 3 Composition API, port 5175, full CRUD parity — v1.4 Phase 16
- ✓ `docs/16-frameworks.md`, Mission 13, NOTEBOOK framework errors — v1.4 Phase 17
- ✓ JWT httpOnly cookie auth; protected `/users`; bcrypt operator accounts — v1.5 Phase 18
- ✓ Vanilla dashboard login/logout; credentialed fetch; 401 UX — v1.5 Phase 19
- ✓ Secrets via `.env`, Compose `env_file`, production fail-fast, doc 18 — v1.5 Phase 20
- ✓ `docs/17-autenticacion.md`, Mission 14, NOTEBOOK auth/deploy, ruta v1.5 — v1.5 Phase 21

- ✓ React/Vue login parity; CI SQLite 24 tests; Mission 15 — v1.6 Phases 22–25
- ✓ Playwright smoke E2E (3 dashboards); Postgres CI on PRs; Mission 16 — v2.0 Phases 26–29
- ✓ CRUD E2E vanilla + `crud-flow` helper — v2.1 Phase 30
- ✓ CRUD E2E React/Vue con ids alineados — v2.1 Phase 31

### Active

- [x] **QA-ADV-01**: Vanilla CRUD E2E + helper compartido — Phase 30 ✓
- [x] **QA-ADV-02**: React/Vue CRUD E2E — Phase 31
- [x] **QA-ADV-03**: E2E contra API Postgres — Phase 32
- [ ] **QA-ADV-04**: Multi-browser en CI — Phase 33
- [x] **QA-CI-05**: BD Postgres aislada para E2E — Phase 32
- [ ] **DOCS-01/02/03**: Mission 17, docs tests, NOTEBOOK v2.1 — Phase 33

### Out of Scope

- OAuth / social providers — email/password + JWT cookie remains the teaching baseline (v2).
- Let's Encrypt automation — manual TLS pattern in doc 18; scripts deferred to v2.
- Kubernetes / Swarm — Compose is the beginner orchestration step.
- nginx reverse proxy `/api` in Compose — documented as advanced reto only.
- Additional frameworks beyond React/Vue (Svelte, Angular, etc.) — v1.4 delivered the comparison milestone.
- Managed cloud PaaS-specific lock-in — document patterns, keep lab runnable locally.
- ORM / managed cloud Postgres — raw SQL + local Compose keep the layer transparent.
- Removing SQLite entirely — host dev stays low-friction; Postgres is additive.
- Complex dependency additions without educational payoff — project rules explicitly prefer avoiding unnecessary dependencies.

## Context

The lab is organized around a learning route:

- `docs/` explains concepts in reading order (through doc 18 deploy; auth doc 17 on advanced path).
- `missions/` provides executable practice (16 missions).
- `ROADMAP.md` lists educational evolution; v1.0–v1.4 milestones complete.
- `NOTEBOOK.md` captures real decisions, errors, and lessons.
- `api/` — Express backend, dual DB adapters, tests, OpenAPI, Dockerfile.
- `dashboard/` — static vanilla frontend with full CRUD; nginx via Compose.
- `dashboard-react/`, `dashboard-vue/` — optional framework paths (advanced).
- `docker-compose.yml` — optional Postgres + API + dashboard stack.

**v1.3 milestone shipped 2026-06-01:** 3 phases, 8 plans, 18/18 requirements.

**v2.0 milestone shipped 2026-06-15:** 4 phases, 8 plans, 12/12 requirements (tag `v2.0`, PR #8).

**v1.6 milestone shipped 2026-06-14:** 4 phases, 8 plans, 14/14 requirements (tag `v1.6`).

**v1.4 milestone shipped 2026-06-01:** 3 phases, 8 plans, 13/13 requirements (FRWK-01–FRWK-13).

**v1.2 milestone shipped 2026-05-31:** 3 phases, 7 plans.

**v1.1 milestone shipped 2026-05-30:** 3 phases, 8 plans.

**v1.0 milestone shipped 2026-05-30:** 5 phases, 13 plans.

<details>
<summary>Previous milestone planning context (v1.4 — archived)</summary>

**Goal:** Same API contract in vanilla, React, and Vue — frameworks as advanced optional branch.

**Shipped:** `dashboard-react/` (:5174), `dashboard-vue/` (:5175), `docs/16-frameworks.md`, Mission 13.

See `.planning/milestones/v1.4-ROADMAP.md`.

</details>

<details>
<summary>Previous milestone planning context (v1.3 — archived)</summary>

**Goal:** Teach SQLite → PostgreSQL as client-server DB while keeping backend → JSON → dashboard intact.

**Shipped:** `db-pg.js`, Compose postgres service, seed.js, 32 tests, doc 15, Mission 12.

</details>

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
| PostgreSQL additive after SQLite | Client-server DB without removing embedded path | ✓ Good — v1.3 |
| Raw SQL + `pg` Pool (no ORM) | Transparent database layer for learners | ✓ Good — v1.3 |
| Postgres named volume in Compose | Persistence distinct from bind-mounted seed JSON | ✓ Good — v1.3 |
| Isolated `edf_lab_test` for PG tests | Dev DB `edf_lab` never contaminated | ✓ Good — v1.3 |
| Allow frameworks later | Future phases may benefit once fundamentals are established | ✓ Good — v1.4 |
| Vanilla primary; React/Vue optional | Beginner path unchanged; frameworks on 5174/5175 | ✓ Good — v1.4 |
| No Pinia/Redux/axios in v1.4 | Keep `fetch` and state visible for teaching | ✓ Good — v1.4 |
| JWT in httpOnly cookie (not localStorage) | Teaches XSS risk; browser sends cookie with credentials | ✓ Good — v1.5 |
| `accounts` separate from CRUD `users` | Operator ≠ data being managed | ✓ Good — v1.5 |
| `AUTH_DISABLED=1` test-only | CRUD tests without login friction | ✓ Good — v1.5 |
| Secrets outside Compose YAML (`env_file`) | Production discipline; no secrets in git | ✓ Good — v1.5 |
| Playwright at repo root (`e2e/`) | One harness for 3 dashboards; no nested lockfile | ✓ Good — v2.0 |
| E2E login via UI only (no `AUTH_DISABLED`) | Didactic: browser path ≠ supertest shortcut | ✓ Good — v2.0 |
| Global quad `webServer` in Playwright | Avoid port 3100 races with parallel workers | ✓ Good — v2.0 |
| Postgres CI mandatory on PRs | Catch PG-only regressions before merge | ✓ Good — v2.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-06-15 — milestone v2.1 Advanced E2E started*
