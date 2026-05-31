# Phase 13: Migration & Test Confidence - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable learners to **seed an empty PostgreSQL database** from the same `users.json` / default seed path as SQLite, run **all 16 API tests against an isolated Postgres database** (`edf_lab_test`), and read a **concise SQLite vs PostgreSQL comparison** with executable commands. **No** full doc 15, Mission 12, dashboard changes, or `docs/00-indice.md` overhaul — those belong to Phase 14 (PGDOCS-*).

</domain>

<decisions>
## Implementation Decisions

### Postgres seed / migration (PGMIG-01)
- **D-01:** Extract shared seed logic into **`api/seed.js`** (or equivalent name) consumed by **`db-sqlite.js`** and **`db-pg.js`** — single `populateIfEmpty` behavior, no duplicated JSON parsing.
- **D-02:** Postgres seed uses **explicit `id` values** from JSON/default seed, then **reset the SERIAL sequence** (`setval` on `users_id_seq`) so IDs match SQLite semantics and tests expecting id 1/2 remain teachable.
- **D-03:** **Same console messages** as SQLite path (`Migrados N usuarios`, corrupt JSON warn, default seed) — no Postgres-specific wording unless already prefixed by `[db] Using PostgreSQL`.
- **D-04:** **`populateIfEmpty` is no-op when `COUNT(*) > 0`** on Postgres (same as SQLite) — Compose named volume with existing data must not be overwritten.

### Test database isolation (PGTEST-02, PGTEST-03)
- **D-05:** Tests use database **`edf_lab_test`** on the **same Postgres server** as dev (`localhost:5432` or compose-published port) — never `edf_lab` production/dev DB from Compose.
- **D-06:** **`npm run test:db:prepare`** (api/ + wrapper at repo root) creates `edf_lab_test` if missing; document one-time / pre-test requirement in README paths.
- **D-07:** Postgres test **`beforeEach`**: `TRUNCATE users RESTART IDENTITY` (then re-seed or rely on tests that insert fresh data — align with existing SQLite pattern of clean DB + initDb).
- **D-08:** **Postgres must be running** on `localhost:5432` for the Postgres test file to pass — document prerequisite (Homebrew PG 16 or `docker compose up` postgres service). No silent skip of PG suite (PGTEST-01 strict).

### Test matrix (PGTEST-01)
- **D-09:** **`npm test` runs both backends in sequence**: existing **`index.test.js`** (SQLite via `DB_FILE`) then **`index.pg.test.js`** (Postgres via `TEST_DATABASE_URL` or equivalent).
- **D-10:** **Separate test file** `index.pg.test.js` — do not branch SQLite vs PG inside `index.test.js` (preserves v1.1 test file pedagogy).
- **D-11:** **Root `package.json` wrappers** delegate to `api/` for `test`, `test:pg`, and `test:db:prepare` (mirror `compose:*` pattern).
- **D-12:** **`index.test.js` behavior unchanged** for SQLite — dual run adds Postgres confidence without removing the fast, file-based isolation story.

### Documentation (PGMIG-02)
- **D-13:** Add section **at end of `docs/13-sqlite.md`**: comparison table (file vs server, bind mount vs named volume, when to use each in the lab) **plus executable commands** (`psql`, `test:db:prepare`, `TEST_DATABASE_URL`, `npm test` / `test:pg`).
- **D-14:** **Phase 13 doc boundary** — no step-by-step Compose+Postgres mission, no full `docs/15-postgresql.md` content (Phase 14).
- **D-15:** **Do not update `docs/00-indice.md`** in Phase 13 — deferred to Phase 14 (PGDOCS-04).

### Out of scope (locked)
- **D-16:** No dashboard/`app.js` changes; no ORM; no removing SQLite.
- **D-17:** No Mission 12, no NOTEBOOK bulk doc pass (PGDOCS-05 is Phase 14 unless blocker-only note).

### Claude's Discretion
- Exact `seed.js` export surface; `setval` SQL snippet; whether `npm test` chains via root script or `cd api && npm test && npm run test:pg`; `TEST_DATABASE_URL` default connection string shape; duplicate PG test structure (copy vs shared helper).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & Requirements
- `.planning/ROADMAP.md` — Phase 13 goal, success criteria, PGMIG/PGTEST reqs
- `.planning/REQUIREMENTS.md` — PGMIG-01, PGMIG-02, PGTEST-01, PGTEST-02, PGTEST-03
- `.planning/PROJECT.md` — v1.3 milestone intent, mirror v1.1 phase 7 pattern

### Phase 12 (Postgres persistence — upstream)
- `.planning/phases/12-postgresql-persistence-layer/12-CONTEXT.md` — D-16 seed deferred, adapter split
- `.planning/phases/12-postgresql-persistence-layer/12-03-SUMMARY.md` — Compose E2E verification
- `api/db-pg.js` — add seed via shared module
- `api/db-sqlite.js` — refactor to use shared seed
- `api/schema.pg.sql` — SERIAL / UNIQUE contract

### v1.1 migration & tests (pattern reference)
- `api/db-sqlite.js` — current `populateIfEmpty`, `tryParseUsersJson`, `DEFAULT_SEED`
- `api/data/users.json` — seed source
- `api/index.test.js` — 16 tests, `DB_FILE` ordering comment
- `docs/10-tests.md` — test isolation pedagogy
- `docs/13-sqlite.md` — extend for PGMIG-02

### Compose & env
- `docker-compose.yml` — `edf_lab` credentials, port 5432, `DATABASE_URL`
- `package.json` (repo root) — add test wrappers alongside `compose:*`

### Explicitly Phase 14 (do not implement in 13)
- `docs/00-indice.md` — index update (PGDOCS-04)
- Future `docs/15-postgresql.md`, Mission 12 (PGDOCS-01, PGDOCS-02)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `populateIfEmpty` + `tryParseUsersJson` in `db-sqlite.js` — extract to `seed.js`
- `index.test.js` — duplicate structure for `index.pg.test.js` with `TEST_DATABASE_URL`
- Root `package.json` `compose:*` — template for `test` / `test:db:prepare` wrappers

### Established Patterns
- Env before require: `DB_FILE` in tests → mirror with `TEST_DATABASE_URL` only in PG test file
- Phase 7 v1.1: migration log on empty table; Phase 12: empty Postgres until manual POST
- `DuplicateEmailError` / 409 tests already cover PGTEST-03 edge cases when run against PG

### Integration Points
- `db-pg.js` `initDb()` — call shared seed after schema apply
- `api/package.json` scripts — `test`, `test:pg`, `test:db:prepare`
- `docs/13-sqlite.md` — new “Hacia PostgreSQL” section with commands

</code_context>

<specifics>
## Specific Ideas

- Mirror v1.1 Phase 7 (migration + tests) for v1.3 Phase 13 — user expects parallel milestone rhythm.
- Explicit IDs + sequence reset keeps parity with JSON seed ids for teaching.
- Dual `npm test` maximizes confidence; Postgres prerequisite documented honestly (localhost:5432).

</specifics>

<deferred>
## Deferred Ideas

- Full `docs/15-postgresql.md` and Mission 12 walkthrough → **Phase 14**
- `docs/00-indice.md` and README Postgres path completeness → **Phase 14** (PGDOCS-04)
- NOTEBOOK Postgres error catalog → **Phase 14** (PGDOCS-05)
- `FORCE_SEED` / destructive reseed flag → out of scope unless requested later
- Second Postgres container for tests → rejected (use `edf_lab_test` on same server)

</deferred>

---

*Phase: 13-migration-test-confidence*
*Context gathered: 2026-05-31*
