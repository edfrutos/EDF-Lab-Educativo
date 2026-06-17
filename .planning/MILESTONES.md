# Milestones

## v2.4 OAuth Foundation (Shipped: 2026-06-17)

**Phases completed:** 2 phases, 4 plans  
**Timeline:** 2026-06-17  
**Tag:** `v2.4`  
**Known deferred items at close:** Real Google/GitHub providers; OAuth UI in React/Vue dashboards

**Key accomplishments:**

- Backend OAuth mock: `GET /auth/oauth/start`, `GET /auth/oauth/callback`, validación `state`, sesión compatible
- Dashboard vanilla: botón «Continuar con OAuth mock», handoff con `fetch` + `credentials: 'include'`
- E2E: `runOAuthMockSmokeFlow` en `auth-smoke.vanilla.spec.js` (2 tests auth vanilla)
- Docs/misiones/NOTEBOOK: login clásico vs OAuth mock; fricciones `state` y redirección al JSON
- CORS por defecto acepta `localhost` y `127.0.0.1` en puertos 5173–5175

**Delivered:** Learners can complete OAuth mock from the vanilla dashboard UI, compare it with classic login, and debug real CORS/origin friction documented in NOTEBOOK.

---

## v2.0 Quality & CI (Shipped: 2026-06-15)

**Phases completed:** 4 phases, 8 plans  
**Timeline:** 2026-06-14 → 2026-06-15  
**Tag:** `v2.0`  
**Merge:** PR #8  
**Known deferred items at close:** No milestone audit run; QA-ADV-* (full CRUD E2E, multi-browser) deferred post-v2.0

**Key accomplishments:**

- Playwright smoke auth E2E en vanilla (`:5173`), React (`:5174`) y Vue (`:5175`) — login UI real, sin `AUTH_DISABLED`
- CI en paralelo: `test-sqlite` (24) + `test-postgres` (23) + `e2e-smoke` (3 specs Chromium)
- Helper `auth-smoke-flow.js`; quad `webServer` en `e2e/playwright.config.js`
- `docs/10-tests.md` matriz CI, duración orientativa, por qué Postgres en PRs
- Mission 16; NOTEBOOK Quality & CI (v2.0); ruta v2.0 en índice/README

**Delivered:** Learners can run `npm run test:e2e` locally, understand the three CI gates on PRs, and learn from documented E2E/Postgres friction.

---

## v1.6 Framework Auth & CI (Shipped: 2026-06-14)

**Phases completed:** 4 phases, 8 plans  
**Timeline:** 2026-06-02 → 2026-06-14  
**Tag:** `v1.6`  
**Known deferred items at close:** Phase 11 UAT artifact (pre-existing); Postgres CI job optional (v2 QA-02)

**Key accomplishments:**

- React (`:5174`) and Vue (`:5175`) login/logout parity with vanilla — `LoginGate`, `credentials: 'include'`, Spanish 401 UX
- GitHub Actions CI on `main` — 24 SQLite tests, Node 22, green after script + runtime fixes
- `express-rate-limit` on `POST /auth/login` with env config and 429 test
- `docs/16-frameworks.md` three-panel auth (`onLogin` vs `emit`); Mission 15; NOTEBOOK Framework Auth & CI (v1.6)
- README CI badge; ruta avanzada v1.6 in index

**Delivered:** Learners can authenticate on any of the three dashboards, compare framework auth patterns, and rely on automated CI feedback on every push to `main`.

---

## v1.5 Production Auth & Deployment (Shipped: 2026-06-02)

**Phases completed:** 4 phases, 9 plans  
**Timeline:** 2026-06-01 → 2026-06-02  
**Known deferred items at close:** No milestone audit run; Phase 11 UAT artifact status open (pre-existing)

**Key accomplishments:**

- API auth: `accounts` + bcrypt; JWT in httpOnly `edf_session`; `/users` protected; OpenAPI cookieAuth
- Vanilla dashboard login gate, logout, `credentials: 'include'`, Spanish 401/403 UX (19-UAT 6/6)
- Secrets: grouped `api/.env.example`, production fail-fast, Compose `env_file` for API
- `docs/17-autenticacion.md`, `docs/18-production-deploy.md`, Mission 14, NOTEBOOK v1.5 errors
- Advanced learning path in index/README after frameworks; 46-test suite with auth block

**Delivered:** Learners can authenticate as operator, manage protected CRUD, configure secrets for Compose/production, and follow documented deploy/TLS patterns — vanilla remains the primary auth teaching path.

---

## v1.4 Frontend Framework Comparison (Shipped: 2026-06-01)

**Phases completed:** 3 phases, 8 plans  
**Timeline:** 2026-06-01 (single-day milestone execution)  
**Known deferred items at close:** 2 production items (PROD-01/02) carried to v1.5 planning

**Key accomplishments:**

- `dashboard-react/` — Vite + React 18 + Tailwind v4 on port 5174; full CRUD parity with vanilla
- `dashboard-vue/` — Vite + Vue 3 Composition API on port 5175; props/emits component split
- Visible `fetchJson` (no axios); `VITE_API_BASE_URL`; dual 409 feedback on framework apps
- `docs/16-frameworks.md` — vanilla vs React vs Vue (state, forms, HTTP, styling) with repo excerpts
- Mission 13 — API + one framework + Network tab; NOTEBOOK Frameworks (v1.4); unified three-dashboard UAT

**Delivered:** Learners can compare the same Express API contract across vanilla, React, and Vue without changing backend JSON shapes; vanilla remains the primary path.

---

## v1.3 PostgreSQL Persistence (Shipped: 2026-06-01)

**Phases completed:** 3 phases, 8 plans  
**Timeline:** 2026-05-31 → 2026-06-01  
**Known deferred items at close:** 1 (see STATE.md Deferred Items — Phase 11 UAT artifact status unknown)

**Key accomplishments:**

- Dual persistence layer: `db-sqlite.js` + `db-pg.js` routed by `DATABASE_URL`; SQLite default on host `npm start`
- Three-service Compose stack (`edf-lab-postgres` + API + dashboard) with `postgres_data` volume and healthcheck
- Shared `api/seed.js` seeds empty Postgres; `setval` keeps SERIAL ids aligned with SQLite migration
- Test matrix: 32/32 tests (`index.test.js` + `index.pg.test.js` on isolated `edf_lab_test`)
- Learning material: `docs/15-postgresql.md`, Mission 12, doc 14 three-service update, NOTEBOOK Postgres errors

**Delivered:** Learners can run the full stack with PostgreSQL, inspect data with `psql`, and compare SQLite vs Postgres paths without breaking the dashboard contract.

---

## v1.1 SQLite Persistence (Shipped: 2026-05-30)

**Phases completed:** 3 phases, 8 plans  
**Timeline:** 2026-05-30 (single-day milestone execution)  
**Audit:** `.planning/milestones/v1.1-MILESTONE-AUDIT.md` — 16/16 requirements, tech debt resolved at close

**Key accomplishments:**

- SQLite persistence: `api/db.js` + `schema.sql` with `node:sqlite`, zero new npm dependencies, `DB_FILE` env var
- JSON→SQLite migration on cold start with preserved IDs and UNIQUE email constraint (HTTP 409)
- Test suite expanded to 16/16 with isolated `users.test.db` per run
- Learning material: `docs/13-sqlite.md`, Mission 10, NOTEBOOK entries for real SQLite integration errors
- Dashboard unchanged — full CRUD UAT pass with SQLite backend

---

## v1.0 Educational Lab MVP (Shipped: 2026-05-30)

**Phases completed:** 5 phases, 13 plans, 12 tasks  
**Timeline:** 2026-05-26 → 2026-05-30 (4 days)  
**Known deferred items at close:** 1 (see STATE.md Deferred Items — Phase 02 HUMAN-UAT artifact flagged, status verified)

**Key accomplishments:**

- Dashboard CRUD: create, edit, and delete users from the browser with loading/success/error feedback in plain Spanish
- File persistence: users survive API restarts via `api/data/users.json` with memory-vs-disk documentation and missions
- API quality: 12 automated tests (node:test + supertest), `parseUserId` fix, package metadata, and `npm run dev`
- Learning material: 24-entry beginner glossary, renumbered missions, and docs/tests alignment
- Advanced topics: manual OpenAPI 3.0.3 spec (9 endpoints) and optional Docker path (node:22-alpine) marked as advanced/optional

### Known Gaps

- REQUIREMENTS.md checkboxes were not synced before archive; all v1 requirements were implemented and verified via phase UAT/security audits. Traceability table in archive reflects pre-close state.

---
