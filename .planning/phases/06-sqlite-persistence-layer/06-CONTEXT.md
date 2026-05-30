# Phase 6: SQLite Persistence Layer - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace `data/users.json` as the **runtime** persistence store with a SQLite database file accessed via `node:sqlite` (Node 22 built-in). All CRUD endpoints must behave identically from the dashboard's perspective. SQL schema must be explicit and readable. Database path configurable via environment variable.

**In scope (Phase 6):** SQLite layer, schema, CRUD queries, env-configurable DB path, seed data on first run.

**Out of scope (later phases):** JSON→SQLite migration flow (Phase 7), test suite updates (Phase 7), educational docs/missions (Phase 8), dashboard changes, ORM, better-sqlite3 implementation, Docker volume docs.
</domain>

<decisions>
## Implementation Decisions

### Code structure
- **D-01:** Extract database logic into `api/db.js` — `initDb()`, query helpers for CRUD. `index.js` keeps routes, validation helpers, and Express setup only.
- **D-02:** `db.js` exports async functions mirroring current persistence interface: `initDb()`, `getAllUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()` (exact names at planner discretion, but separation is locked).

### Schema visibility
- **D-03:** SQL schema lives in `api/schema.sql` as a readable artifact learners can open directly (SQLITE-03).
- **D-04:** `initDb()` reads and executes `schema.sql` on startup (CREATE TABLE IF NOT EXISTS pattern).

### First-run seed (Phase 6 only)
- **D-05:** On startup, if the `users` table is empty after schema init, insert seed rows John Doe and Jane Smith via SQL INSERT (same fictional data as current `SEED_DATA`). API must be usable immediately without waiting for Phase 7 migration.
- **D-06:** Phase 7 will add JSON→SQLite migration; Phase 6 does NOT read `users.json` at runtime.

### Environment configuration
- **D-07:** New env var `DB_FILE` — default `api/data/users.db` (resolved relative to `api/` via `path.join(__dirname, ...)`).
- **D-08:** Keep existing `DATA_FILE` unused/deprecated for runtime in Phase 6; tests still use their own isolation pattern (Phase 7 updates tests). Do not overload `DATA_FILE` to point at `.db` — avoids confusing learners who learned JSON persistence with that name.

### ID generation
- **D-09:** Use `INTEGER PRIMARY KEY AUTOINCREMENT` for user `id` column — idiomatic SQLite, teaches relational defaults.
- **D-10:** Remove in-memory `nextUserId` counter; POST /users uses SQLite insert and returns `lastInsertRowid`.

### Error handling & API contract
- **D-11:** Preserve all existing HTTP status codes, JSON shapes, and Spanish error message strings — dashboard and OpenAPI spec must remain valid without changes.
- **D-12:** Rollback pattern on failed writes: if DB write fails after in-memory mutation attempt, revert state and return 500 with existing error message (adapt permission message if needed for DB context).

### Claude's Discretion
- Exact SQL query structure (prepared statements vs template strings — prefer prepared statements for safety/didactics).
- Whether seed INSERTs live in `schema.sql` or a separate `seed.sql` / inline in `initDb()` after empty-table check.
- Lodash `sortBy` retention in route layer vs ORDER BY name in SQL.
- OpenAPI spec update timing (Phase 6 vs defer if contract unchanged).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, dependency on Phase 5
- `.planning/REQUIREMENTS.md` — SQLITE-01 through SQLITE-05 (Phase 6 scope)
- `.planning/PROJECT.md` — v1.1 milestone goals, constraints (zero deps, raw SQL, no dashboard changes)

### Current implementation (replace persistence layer)
- `api/index.js` — existing routes, validation, `loadUsers`/`saveUsers`/`saveUsersData` to replace
- `api/data/users.json` — seed format reference only (not runtime store after Phase 6)
- `api/index.test.js` — existing tests (Phase 7 updates; Phase 6 must not break them if run, but test migration is Phase 7 scope)

### Patterns from prior work
- `.planning/milestones/v1.0-ROADMAP.md` — Phase 2 file persistence decisions (async startup, seed recovery)
- `docs/08-memoria-vs-persistencia.md` — learner context on JSON persistence (Phase 8 will extend for SQLite)
- `docs/09-glosario.md` — terms: memoria vs disco, JSON, CRUD

### API contract
- `api/openapi.yaml` — 9 endpoints; responses must stay aligned
- `dashboard/app.js` — consumer of GET/POST/PUT/DELETE /users (no changes allowed)

### Node.js SQLite
- Node.js 22 `node:sqlite` built-in module (official docs) — zero npm dependency requirement

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `parseUserId()`, `validateUserPayload()` — keep in `index.js`, unchanged
- `getSortedUsers()` — may move sort to SQL `ORDER BY name` or keep Lodash in route
- `module.exports = app` + `module.exports.loadUsers` pattern — replace export with `initDb` or equivalent for tests (Phase 7 handles test isolation)
- `DATA_DIR` / `mkdir` pattern from `saveUsersData()` — reuse for ensuring `data/` exists before DB file creation
- `startServer()` async startup — extend to `await initDb()` before `listen`

### Established Patterns
- Single-file Express entry (`api/index.js`) with small pure helpers at top
- Spanish error messages as literal strings in route handlers
- Rollback on failed persistence in POST/PUT/DELETE handlers
- Env-var configuration (`PORT`, `DATA_FILE` precedent → `DB_FILE`)

### Integration Points
- Replace `loadUsers()` / `saveUsers()` calls in route handlers with `db.js` async queries
- `startServer()` must await DB init before accepting requests
- Docker: `.dockerignore` excludes `data/users.json`; will need `users.db` handling (ephemeral by default, same as JSON)

</code_context>

<specifics>
## Specific Ideas

- Learner should be able to open `api/schema.sql` and understand the table structure without reading JavaScript.
- `db.js` separation teaches that persistence is a distinct concern from HTTP routing — natural evolution from Phase 2 inline helpers.
- Seed John/Jane keeps parity with current first-run experience; migration from custom JSON data is explicitly Phase 7.

</specifics>

<deferred>
## Deferred Ideas

- **JSON→SQLite migration on first startup** — Phase 7 (MIG-01, MIG-02, MIG-03)
- **Test suite SQLite isolation** — Phase 7 (TEST-01..03)
- **SQLite docs, mission, better-sqlite3 comparison** — Phase 8 (DOCS-01..05)
- **OpenAPI update** if any response shape changes (should not) — planner discretion
- **Docker volume mount for persistent `.db`** — v1.2 INFRA-02

</deferred>

---

*Phase: 6-SQLite Persistence Layer*
*Context gathered: 2026-05-30*
