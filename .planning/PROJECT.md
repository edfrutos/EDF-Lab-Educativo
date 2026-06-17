# EDF Lab Educativo

## What This Is

EDF Lab Educativo is a hands-on learning lab for understanding a modern web flow with a separate Express backend and a static frontend dashboard. It is for the project owner and beginner students who need to see, run, break, debug, and document the path from backend endpoints to JSON responses to rendered browser UI.

The lab includes a working API with **dual persistence** (SQLite on host dev, PostgreSQL in Compose), a **vanilla** dashboard plus optional **React** and **Vue** dashboards (same CRUD contract), **32 automated API tests** (16 SQLite + 16 Postgres), guided missions through framework comparison, OpenAPI contract documentation, and optional container paths — all organized as an educational progression.

## Core Value

Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## Current Milestone

**Status:** v2.4 OAuth Foundation shipped 2026-06-17 — planning next milestone.

Use `/gsd-new-milestone` to define the next learning route.

## Current State (v2.4 shipped 2026-06-17)

**Stack:** Express + auth (login, refresh, OAuth mock) + `node:sqlite` / `pg` + vanilla / React / Vue dashboards + Playwright E2E + visual regression  
**Persistence:** SQLite host dev; PostgreSQL in Compose; E2E SQLite `e2e.users.db` + Postgres `edf_lab_e2e`  
**Tests:** `test:sqlite` 36 · `test:pg` (when Postgres up) · `test:e2e` 7 Chromium · `test:e2e:ci` · `test:visual` 3 dashboards  
**CI:** Jobs — `test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`, `visual-regression`  
**Frontends:** `:5173` vanilla (OAuth mock UI) · `:5174` React · `:5175` Vue — login gate + CRUD E2E alineado  
**Auth:** Login clásico + refresh rotation + OAuth mock (`/auth/oauth/start` → callback); CORS `localhost` y `127.0.0.1`  
**Docs:** `docs/17-autenticacion.md` (clásico vs OAuth mock); Mission 14/15; NOTEBOOK OAuth fases 40–41  
**Compose:** `npm run compose:up` — Postgres + API + dashboard nginx

<details>
<summary>Previous milestone: v2.2 Visual Regression (archived)</summary>

**Shipped 2026-06-17:** Playwright `toHaveScreenshot` en 3 dashboards, job CI visual, Mission 18.

See `.planning/milestones/` and phases 34–37 in ROADMAP.

</details>

<details>
<summary>Previous milestone: v2.1 (archived)</summary>

**Shipped 2026-06-16:** CRUD E2E, Postgres E2E, multi-browser CI, Mission 17.

See `.planning/milestones/v2.1-ROADMAP.md` when archived.

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
- ✓ E2E Postgres aislado (`edf_lab_e2e`) — v2.1 Phase 32
- ✓ Multi-browser CI (Chromium+Firefox) + Mission 17 — v2.1 Phase 33
- ✓ Playwright visual snapshots vanilla/React/Vue + CI job — v2.2 Phases 34–37
- ✓ Password change API (`PATCH /auth/password`) — v2.3 Phase 38
- ✓ Refresh token rotation (`POST /auth/refresh`) — v2.3 Phase 39
- ✓ OAuth mock backend start/callback + tests — v2.4 Phase 40
- ✓ OAuth mock dashboard UI + E2E smoke — v2.4 Phase 41

### Active

(Define next milestone with `/gsd-new-milestone`.)

### Out of Scope

- Real Google/GitHub OAuth providers — mock suffices for teaching handoff (deferred post-v2.4)
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

**v2.4 milestone shipped 2026-06-17:** 2 phases, 4 plans, AUTH-ADV-01 (OAuth mock backend + dashboard UI).

**v2.1 milestone shipped 2026-06-16:** 4 phases, 8 plans, 8/8 requirements.

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
| OAuth mock via fetch not redirect | Callback returns JSON on :3100; SPA stays on :5173 | ✓ Good — v2.4 |
| CORS whitelist includes 127.0.0.1 | localhost ≠ 127.0.0.1 for browsers | ✓ Good — v2.4 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-06-17 after v2.4 milestone*
