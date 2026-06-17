# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Educational Lab MVP

**Shipped:** 2026-05-30  
**Phases:** 5 | **Plans:** 13 | **Sessions:** ~5

### What Was Built

- Browser-based CRUD dashboard consuming Express API with visible HTTP feedback
- File-backed user persistence (`api/data/users.json`) with seed recovery and educational missions
- 12-test API suite with validation edge cases and documented AAA pattern
- 24-term beginner glossary plus docs/missions hardening (tests doc, mission renumbering)
- OpenAPI 3.0.3 contract (manual YAML, zero deps) and optional Docker containerization path

### What Worked

- Phased learning route (CRUD → persistence → tests → docs → advanced) kept each increment teachable
- Zero-dependency bias (`fs/promises`, `node:test`, manual OpenAPI) preserved educational transparency
- Real bugs captured in NOTEBOOK.md (CORS, parseUserId, Docker EACCES) became learning material
- GSD wave-based execution with parallel plans where files didn't overlap (Phase 05)

### What Was Inefficient

- REQUIREMENTS.md checkboxes drifted from actual delivery; traceability lagged behind implementation
- Docker permission issue (root-owned files vs `USER node`) discovered late in UAT — fixed with `chown`
- Some SUMMARY.md one-liner fields incomplete for automated milestone extraction

### Patterns Established

- Docs + missions + NOTEBOOK triad for every observable behavior change
- Advanced material marked `(avanzado, opcional)` in index without blocking the core path
- `module.exports = app` before listen; `DATA_FILE` env for test isolation
- Security STRIDE pass per phase before milestone close

### Key Lessons

1. Sync REQUIREMENTS checkboxes at phase completion, not only at milestone close
2. Dockerfiles need explicit ownership when dropping privileges (`chown` before `USER`)
3. Keep vanilla frontend until data flow is fully visible — framework comparison deferred correctly

### Cost Observations

- Model mix: not tracked per session
- Sessions: ~5 across 4 calendar days
- Notable: Phase 05 (OpenAPI + Docker) completed in ~1 day after prior phases established stable API surface

---

## Milestone: v1.1 — SQLite Persistence

**Shipped:** 2026-05-30  
**Phases:** 3 | **Plans:** 8

### What Was Built

- SQLite layer (`db.js`, `schema.sql`) with `node:sqlite` and `DB_FILE` configuration
- Auto-migration from `users.json` on empty database; UNIQUE email → HTTP 409
- 16-test suite with per-run DB isolation; dashboard CRUD unchanged
- `docs/13-sqlite.md`, Mission 10, NOTEBOOK integration errors, glosario v1.1 alignment

### What Worked

- Phased split (persistence → migration/tests → docs) kept dashboard contract stable throughout
- Deferred full MIG-02 doc to Phase 8 while Phase 7 shipped code + brief note — clean separation
- Real UAT friction (EADDRINUSE, ExperimentalWarning) became NOTEBOOK curriculum

### What Was Inefficient

- Phase 6 shipped without VERIFICATION.md — caught at milestone audit, fixed retroactively
- REQUIREMENTS.md checkboxes lagged until audit/close (recurring v1.0 lesson)
- `milestone.complete` accomplishments extraction incomplete ("Plan:" placeholders)

### Patterns Established

- `users.json` = seed, `users.db` = runtime — dual-file mental model documented in doc 08 + 13
- `initDb({ skipSeed: true })` for empty-database tests without learner-facing env vars
- Milestone audit cleanup pass before archive when tech_debt status

### Key Lessons

1. Add VERIFICATION.md when phase executes, not only at audit
2. Sync REQUIREMENTS checkboxes at each phase ship, not milestone close
3. Docs phase (8) should follow code phase UAT within same milestone for coherent learner path

### Cost Observations

- Model mix: not tracked
- Timeline: v1.1 executed primarily 2026-05-30 (same day as close)
- Notable: docs-only Phase 8 chained after Phase 7 UAT in one session

---

## Milestone: v1.3 — PostgreSQL Persistence

**Shipped:** 2026-06-01  
**Phases:** 3 | **Plans:** 8

### What Was Built

- Dual DB adapters (`db-sqlite.js`, `db-pg.js`) with `DATABASE_URL` router in `db.js`
- Compose three-service stack: Postgres 16 + API + dashboard; `postgres_data` volume
- Shared `seed.js` for SQLite and Postgres; `edf_lab_test` + `index.pg.test.js` (32 tests total)
- `docs/15-postgresql.md`, Mission 12, doc 14 v1.3 update, NOTEBOOK Postgres errors

### What Worked

- Same milestone shape as v1.1 (persistence → migration/tests → docs) reduced planning risk
- Additive Postgres kept host `npm start` frictionless for beginners
- Phase 13 deferred index/Mission 12 to Phase 14 — clear doc boundary held

### What Was Inefficient

- No v1.3 milestone audit before close (v1.2 had one); relied on phase VERIFICATION files
- `milestone.complete` still failed to extract SUMMARY one-liners automatically
- Phase 11 UAT artifact left in unknown state from v1.2 (carried as deferred)

### Patterns Established

- `DATABASE_URL` as single switch between embedded and client-server DB
- `test:db:prepare` as explicit learner step before PG test suite
- Mission 11 (bind mount flow) + Mission 12 (Postgres/`psql`) as parallel Compose paths

### Key Lessons

1. Document three storage locations: `users.db` (host), `postgres_data` (Compose), `edf_lab_test` (tests)
2. `unset DATABASE_URL` in shell when switching from Compose dev to SQLite tests
3. Update doc 14 when Compose runtime store changes — learners read it before Mission 11/12

### Cost Observations

- Model mix: not tracked
- Timeline: 2026-05-31 → 2026-06-01 (~2 days)
- Notable: Phase 14 docs-only closed milestone without code churn

---

## Milestone: v1.5 — Production Auth & Deployment

**Shipped:** 2026-06-02  
**Phases:** 4 | **Plans:** 9

### What Was Built

- JWT session auth with httpOnly cookie; bcrypt operator accounts; protected `/users` routes
- Vanilla dashboard login gate, logout, and credentialed fetch with Spanish error UX
- Production secrets discipline: `.env.example`, fail-fast, Compose `env_file`, nginx TLS doc
- Learning path: `docs/17-autenticacion.md`, Mission 14, index ruta v1.5, NOTEBOOK auth/deploy

### What Worked

- Layering auth on dual persistence without breaking host-dev SQLite path
- Test split: `AUTH_DISABLED` for CRUD suites + dedicated auth test block (7 tests)
- Docs-only phase 21 closed milestone cleanly after code phases 18–20
- Phase 19 UAT reused in 21-UAT consolidation

### What Was Inefficient

- No v1.5 milestone audit before close; REQUIREMENTS body checkboxes lagged traceability table
- git-secrets hook blocked JWT placeholders in committed templates — required comment-only docs
- Phase 20 commit bundled in single monolithic commit after delayed background git hook

### Patterns Established

- Operator (`accounts`) ≠ CRUD users (`users`)
- Advanced v1.5 path after frameworks in index (not in beginner numbered list)
- Production fail-fast for missing secrets before `listen()`

### Key Lessons

1. Document secrets in comments when git-secrets blocks `VAR=` patterns in tracked files
2. Run `/gsd-audit-milestone` before `/gsd-complete-milestone` for multi-phase auth milestones
3. Keep vanilla as auth teaching surface; frameworks stay comparison-focused

---

## Milestone: v2.0 — Quality & CI

**Shipped:** 2026-06-15  
**Phases:** 4 | **Plans:** 8

### What Was Built

- Playwright E2E smoke auth on vanilla, React, and Vue (`npm run test:e2e`)
- CI matrix: `test-sqlite` + `test-postgres` + `e2e-smoke` on every PR
- Shared `auth-smoke-flow.js` helper; quad `webServer` orchestration
- Mission 16; expanded `docs/10-tests.md`; NOTEBOOK v2.0 friction entries

### What Worked

- Phased rollout (vanilla E2E → multi-dashboard → Postgres CI → docs) kept debugging surface small
- Real selector and webServer errors documented in NOTEBOOK became teaching material in phase 29
- Reusing Spanish UI copy across dashboards enabled one shared E2E helper

### What Was Inefficient

- No milestone audit before close (recurring gap since v1.5)
- Initial Playwright project-per-`webServer` design failed under parallel workers — required config rework

### Patterns Established

- E2E never sets `AUTH_DISABLED`; API tests keep supertest shortcut
- Root `e2e/` + `@playwright/test` devDep (not nested package)
- CI `workers: 1` for E2E stability; three jobs parallel at workflow level

### Key Lessons

1. Scope Playwright selectors to login form (`#login-email`) when CRUD forms share labels
2. One global `webServer` array when all projects share API port 3100
3. Postgres CI on PRs closes the gap between “works on SQLite” and “works on PG”

---

## Milestone: v2.4 — OAuth Foundation

**Shipped:** 2026-06-17  
**Phases:** 2 | **Plans:** 4

### What Was Built

- OAuth mock backend contract (start/callback) with anti-CSRF `state` cookie
- Vanilla dashboard OAuth entry point and fetch-based callback handoff
- E2E smoke for OAuth mock path alongside classic login
- Auth docs/missions distinguishing classic login vs OAuth mock

### What Worked

- Reusing existing session cookie issuance for OAuth callback kept backend additive
- Documenting fetch-vs-redirect friction in NOTEBOOK turned a UI bug into curriculum
- Phase 41 consumed phase 40 contract without backend changes (clean dependency)

### What Was Inefficient

- CORS whitelist missed `127.0.0.1` — common local dev pitfall caught in UAT
- E2E grep mismatch (`auth smoke vanilla` vs actual describe title) slowed verification

### Patterns Established

- OAuth mock in lab: API returns JSON callback; UI completes with `fetch`, not navigation
- Dual auth gate in vanilla: classic form + OAuth mock button for explicit comparison

### Key Lessons

1. `localhost` and `127.0.0.1` are different origins for CORS — whitelist both in dev
2. OAuth in static SPAs: if callback is JSON API, stay on dashboard origin after handoff
3. Keep OAuth scope to mock provider until learners understand classic session flow

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~5 | 5 | GSD phased execution with UAT + security gates |
| v1.1 | ~2 | 3 | SQLite migration + docs; audit cleanup before archive |
| v1.2 | ~2 | 3 | Compose orchestration; bind mount persistence |
| v1.3 | ~2 | 3 | PostgreSQL additive; dual test matrix |
| v1.4 | ~1 | 3 | Parallel framework dashboards; docs-only close |
| v1.5 | ~2 | 4 | Auth + deploy as advanced track; 4-phase milestone |
| v2.0 | ~2 | 4 | Playwright E2E + Postgres CI; docs close milestone |
| v2.4 | ~1 | 2 | OAuth mock backend + dashboard UI; CORS 127.0.0.1 fix |

### Cumulative Quality

| Milestone | Tests | Coverage | Notable deps |
|-----------|-------|----------|--------------|
| v1.0 | 12 API tests | Manual UAT per phase | fs/promises, node:test, manual OpenAPI |
| v1.1 | 16 API tests | Dashboard UAT 5/5 (Phase 7) | node:sqlite (built-in) |
| v1.2 | 16 API tests | Compose E2E UAT | nginx + compose only |
| v1.3 | 32 API tests | Phase 14 verification 5/5 | `pg` (educational) |
| v1.4 | 32 API tests | Three-dashboard UAT | Vite + React/Vue |
| v1.5 | 46 API tests | 19-UAT + 21-UAT | bcrypt, jsonwebtoken, cookie-parser |
| v2.0 | 47 API + 3 E2E | CI 3 jobs on PR | `@playwright/test` |
| v2.4 | 36 API + 7 E2E | OAuth mock + visual CI | cors whitelist expanded |

### Top Lessons (Verified Across Milestones)

1. Document real errors in NOTEBOOK.md — converts friction into curriculum
2. Validate with executable checks (curl, npm test, docker health) before phase sign-off
