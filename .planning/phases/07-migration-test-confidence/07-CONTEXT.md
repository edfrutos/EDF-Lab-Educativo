# Phase 7: Migration & Test Confidence - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the JSON→SQLite migration path so learners see `users.json` imported into the database on first run, reinforce the automated test suite against SQLite edge cases, and align test documentation with the `DB_FILE` harness. The HTTP/API contract for the dashboard stays unchanged except for new **409 Conflict** responses on duplicate email.

**In scope (Phase 7):** `migrateFromJson()` integrated into startup, duplicate-email constraint, new/expanded tests, `docs/10-tests.md` update, OpenAPI 409 entries, brief MIG-02 note (JSON vs SQLite — full doc in Phase 8).

**Out of scope (Phase 8):** Full SQLite learning doc, mission, `node:sqlite` vs `better-sqlite3` comparison, NOTEBOOK entries, comprehensive `docs/08-memoria-vs-persistencia.md` rewrite.
</domain>

<decisions>
## Implementation Decisions

### Migration trigger
- **D-01:** Migration runs **automatically inside `initDb()`** when `SELECT COUNT(*) FROM users` is 0 after schema creation — no separate `npm run migrate` required for the default learner path (MIG-01).
- **D-02:** JSON source path is **fixed** at `api/data/users.json` via `path.join(__dirname, 'data/users.json')` — no new env var (e.g. `SEED_FILE`). Keeps the mental model simple: one JSON seed file, one DB file (`DB_FILE`).
- **D-03:** On successful migration, log a **didactic console message**: e.g. `Migrados N usuarios desde users.json` (parity with Phase 2 startup logs).
- **D-04:** Migration **never runs** if the `users` table already has rows — protects learner data after weeks of use.

### Migration semantics
- **D-05:** **Preserve IDs** from JSON — `INSERT INTO users (id, name, email) VALUES (?, ?, ?)` with explicit ids so existing tests (`PUT /users/1`, `DELETE /users/1`) and learner expectations remain valid.
- **D-06:** Fallback order when table is empty: **(1) read `users.json`** → **(2) if file missing or `users` array empty, hardcoded John/Jane seed** (current `seedIfEmpty()` behavior). Refactor `seedIfEmpty()` into this unified flow.
- **D-07:** If `users.json` exists but JSON is **invalid/corrupt**, **restore default seed** (John/Jane) and continue startup — same recovery philosophy as Phase 2 file persistence.
- **D-08:** **`nextId` in JSON is ignored** — after explicit ID inserts, SQLite `AUTOINCREMENT` / `sqlite_sequence` naturally yields the next id (3 after ids 1 and 2). No manual sequence sync needed.

### Duplicate email validation
- **D-09:** Add **`email TEXT NOT NULL UNIQUE`** to `schema.sql` — teach SQL constraints as the source of truth.
- **D-10:** Catch SQLite constraint violation in `createUser()` / `updateUser()` (or route layer) and return **409 Conflict** with message: **`Ya existe un usuario con ese email.`** (Spanish, consistent with existing error strings).
- **D-11:** **PUT excludes self** — updating a user with their own current email returns 200; 409 only when another user holds that email.
- **D-12:** **Update `api/openapi.yaml`** with 409 response on POST and PUT `/users` in this phase.

### Test coverage & documentation
- **D-13:** Expose **`initDb({ skipSeed: true })`** (or equivalent internal option) for tests only — allows empty-database test without adding learner-facing env vars.
- **D-14:** Add tests for: **empty DB** (`GET /users` → `[]`), **POST duplicate email** → 409, **PUT email collision with another user** → 409.
- **D-15:** **Update `docs/10-tests.md`** — replace stale `DATA_FILE` / `users.test.json` references with `DB_FILE` / `users.test.db` pattern from Phase 6.
- **D-16:** Test suite **grows** (~15–16 tests) — MIG-01/TEST-01 mean existing tests still pass, not that count stays at exactly 12.

### Claude's Discretion
- Exact function name and module placement for migration logic (`migrateFromJson()` in `db.js` vs separate `migrate.js` — prefer keeping in `db.js` unless file grows unwieldy).
- Whether corrupt-JSON recovery writes a fresh `users.json` or only seeds SQLite (Phase 2 wrote JSON; SQLite-only recovery may suffice).
- MIG-02 placement: brief "JSON vs SQLite" comparison paragraph in `docs/10-tests.md` or `api/README.md`; full treatment deferred to Phase 8.
- Migration test: optional dedicated test with temp JSON fixture vs integration through default `users.json`.
- OpenAPI 409 example body wording (must match D-10 literal string).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, dependency on Phase 6
- `.planning/REQUIREMENTS.md` — MIG-01..03, TEST-01..03 (Phase 7 scope)
- `.planning/PROJECT.md` — v1.1 constraints (zero deps, raw SQL, API contract mostly unchanged)
- `.planning/phases/06-sqlite-persistence-layer/06-CONTEXT.md` — Phase 6 locked decisions (db.js split, DB_FILE, seed deferred to Phase 7)

### Current implementation
- `api/db.js` — `initDb()`, `seedIfEmpty()`, CRUD helpers to extend with migration + UNIQUE handling
- `api/schema.sql` — add `UNIQUE` on `email`
- `api/index.js` — route handlers; map duplicate errors to 409
- `api/data/users.json` — migration source format `{ users: [{id,name,email}], nextId }`
- `api/index.test.js` — existing 12-test harness with `DB_FILE` + `beforeEach(initDb)`
- `api/openapi.yaml` — add 409 responses for POST/PUT users

### Prior persistence patterns (migration parity)
- `.planning/milestones/v1.0-ROADMAP.md` — Phase 2 file persistence (seed recovery, corrupt JSON handling)
- `docs/08-memoria-vs-persistencia.md` — learner context on JSON persistence (MIG-02 brief note; full update Phase 8)

### Test documentation
- `docs/10-tests.md` — must be updated for `DB_FILE` isolation pattern (currently stale with `DATA_FILE`)

### API contract
- `dashboard/app.js` — no changes expected; dashboard ignores 409 unless future UX added
- `api/README.md` — may need duplicate-email / migration notes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `seedIfEmpty()` in `db.js` — refactor into migration-first flow (D-06)
- `initDb()` lifecycle — single hook for schema + migration + seed fallback
- `index.test.js` pattern: set `process.env.DB_FILE` before require, `unlink` + `initDb()` in `beforeEach`
- `users.json` and `users.test.json` — same shape; tests can use temp JSON or default file

### Established Patterns
- Spanish error messages as literal strings in route handlers
- Env var `DB_FILE` for path isolation (tests use `users.test.db`)
- Didactic `console.log` on startup events (Phase 2 precedent)
- Arrange/Act/Assert comments in test file

### Integration Points
- `initDb()` called from `startServer()` before `listen` — migration runs on every cold start when DB empty
- Schema change (`UNIQUE`) requires test DB recreated each run (already handled by `unlink` in `beforeEach`)
- OpenAPI must stay aligned with new 409 status

</code_context>

<specifics>
## Specific Ideas

- Learner should see migration happen transparently on first `npm start` with an empty `.db` file — no extra command required.
- Preserving JSON ids keeps continuity with Phase 2 data and existing test fixtures.
- UNIQUE constraint teaches that databases enforce rules at the schema level, not only in application code.

</specifics>

<deferred>
## Deferred Ideas

- **Full JSON vs SQLite comparison doc (MIG-02)** — Phase 8 (DOCS-01); Phase 7 adds brief note only
- **Standalone `npm run migrate` script** — not required; auto-migration covers learner path; script optional if planner sees educational value
- **Dashboard UX for 409 duplicate email** — out of scope; API returns correct status, dashboard shows generic error if any
- **PostgreSQL migration path** — future milestone per PROJECT.md

</deferred>

---

*Phase: 7-Migration & Test Confidence*
*Context gathered: 2026-05-30*
