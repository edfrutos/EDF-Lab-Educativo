# Phase 6: SQLite Persistence Layer - Research

**Researched:** 2026-05-30
**Domain:** Node.js 22 built-in `node:sqlite` (DatabaseSync), Express CRUD persistence refactor
**Confidence:** HIGH

## Summary

Phase 6 replaces the JSON file store (`loadUsers` / `saveUsers` / in-memory `users[]`) with a SQLite file accessed exclusively through Node.js 22's built-in `node:sqlite` module — zero new npm dependencies. The locked architecture extracts persistence into `api/db.js` with `initDb()` plus CRUD helpers, keeps SQL visible in `api/schema.sql`, and configures the database path via `DB_FILE` (default `api/data/users.db`).

`node:sqlite` in Node 22.22.3 exposes only **synchronous** APIs: `DatabaseSync`, `StatementSync`, `constants`, and `backup`. There is no async `Database` class in this runtime. [VERIFIED: local `require('node:sqlite')` + Node.js docs] The CONTEXT decision to export **async** functions from `db.js` is satisfied by wrapping synchronous SQLite calls inside `async function` bodies (or using `fs/promises` for directory/schema file I/O before sync DB ops). Route handlers remain `async`; blocking SQLite I/O on the main thread is acceptable for this educational lab's traffic profile. [CITED: https://nodejs.org/api/sqlite.html]

Schema initialization should read `schema.sql` with `readFileSync` (or `readFile` in async `initDb`) and execute it via `database.exec(sql)`, which supports **multiple statements in one string** — ideal for readable schema files. [VERIFIED: local test + official docs] Seed data (John Doe, Jane Smith) belongs in `initDb()` after an empty-table check, **not** in `schema.sql`, to keep DDL separate from bootstrap data and align with D-05/D-06.

Replacing in-memory mutation + file write simplifies route handlers: POST/PUT/DELETE write directly to SQLite; rollback becomes "return 500 if the DB operation throws" rather than reverting an in-memory array. HTTP contract (status codes, JSON shapes, Spanish error strings) stays unchanged per D-11.

Tests currently depend on `DATA_FILE` + JSON fixtures + `app.loadUsers()`. They **will fail** after a naive Phase 6 refactor. A **minimal Phase 6 fix** (swap to `DB_FILE`, delete test `.db` in `beforeEach`, call `initDb()`) lets all 12 tests pass without JSON fixtures — full isolation patterns remain Phase 7 scope (TEST-01..03).

Docker impact is small: `.dockerignore` should exclude `data/users.db` (like `users.json` today); Dockerfile's `mkdir -p data && chown` pattern already supports ephemeral DB creation. Seed-on-empty preserves current container behavior.

**Primary recommendation:** Implement `api/db.js` with `DatabaseSync`, prepared statements, `schema.sql` via `exec()`, seed-if-empty in `initDb()`, refactor routes to call DB helpers directly (no in-memory cache), and apply the minimal test env swap (`DB_FILE` + `initDb`) so `npm test` stays green.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Code structure
- **D-01:** Extract database logic into `api/db.js` — `initDb()`, query helpers for CRUD. `index.js` keeps routes, validation helpers, and Express setup only.
- **D-02:** `db.js` exports async functions mirroring current persistence interface: `initDb()`, `getAllUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()` (exact names at planner discretion, but separation is locked).

#### Schema visibility
- **D-03:** SQL schema lives in `api/schema.sql` as a readable artifact learners can open directly (SQLITE-03).
- **D-04:** `initDb()` reads and executes `schema.sql` on startup (CREATE TABLE IF NOT EXISTS pattern).

#### First-run seed (Phase 6 only)
- **D-05:** On startup, if the `users` table is empty after schema init, insert seed rows John Doe and Jane Smith via SQL INSERT (same fictional data as current `SEED_DATA`). API must be usable immediately without waiting for Phase 7 migration.
- **D-06:** Phase 7 will add JSON→SQLite migration; Phase 6 does NOT read `users.json` at runtime.

#### Environment configuration
- **D-07:** New env var `DB_FILE` — default `api/data/users.db` (resolved relative to `api/` via `path.join(__dirname, ...)`).
- **D-08:** Keep existing `DATA_FILE` unused/deprecated for runtime in Phase 6; tests still use their own isolation pattern (Phase 7 updates tests). Do not overload `DATA_FILE` to point at `.db` — avoids confusing learners who learned JSON persistence with that name.

#### ID generation
- **D-09:** Use `INTEGER PRIMARY KEY AUTOINCREMENT` for user `id` column — idiomatic SQLite, teaches relational defaults.
- **D-10:** Remove in-memory `nextUserId` counter; POST /users uses SQLite insert and returns `lastInsertRowid`.

#### Error handling & API contract
- **D-11:** Preserve all existing HTTP status codes, JSON shapes, and Spanish error message strings — dashboard and OpenAPI spec must remain valid without changes.
- **D-12:** Rollback pattern on failed writes: if DB write fails after in-memory mutation attempt, revert state and return 500 with existing error message (adapt permission message if needed for DB context).

### Claude's Discretion
- Exact SQL query structure (prepared statements vs template strings — prefer prepared statements for safety/didactics).
- Whether seed INSERTs live in `schema.sql` or a separate `seed.sql` / inline in `initDb()` after empty-table check.
- Lodash `sortBy` retention in route layer vs ORDER BY name in SQL.
- OpenAPI spec update timing (Phase 6 vs defer if contract unchanged).

### Deferred Ideas (OUT OF SCOPE)
- **JSON→SQLite migration on first startup** — Phase 7 (MIG-01, MIG-02, MIG-03)
- **Test suite SQLite isolation** — Phase 7 (TEST-01..03)
- **SQLite docs, mission, better-sqlite3 comparison** — Phase 8 (DOCS-01..05)
- **OpenAPI update** if any response shape changes (should not) — planner discretion
- **Docker volume mount for persistent `.db`** — v1.2 INFRA-02
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SQLITE-01 | API stores users in SQLite file instead of `data/users.json` as primary store | `DatabaseSync` + `DB_FILE` default `data/users.db`; remove JSON read/write from runtime path |
| SQLITE-02 | Uses `node:sqlite` with zero new npm deps | Built-in module only; no better-sqlite3/sqlite3 packages |
| SQLITE-03 | Explicit SQL schema for `users` table (`id`, `name`, `email`) | `api/schema.sql` executed via `db.exec()` on startup |
| SQLITE-04 | CRUD endpoints behave identically for dashboard | Prepared-statement CRUD + preserve validation/error strings; sort by name (SQL or Lodash) |
| SQLITE-05 | DB path configurable via env var | `DB_FILE` mirroring `DATA_FILE` resolution pattern in `index.js` today |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTTP routing & validation | API / Backend (`index.js`) | — | Express handlers own request/response contract |
| SQL schema definition | API / Backend (`schema.sql`) | — | Readable DDL artifact for learners (D-03) |
| DB connection & CRUD queries | API / Backend (`db.js`) | — | Persistence isolated from HTTP (D-01) |
| Seed on first run | API / Backend (`db.js` init) | — | Bootstrap empty DB; not dashboard concern |
| User listing sort order | API / Backend | — | `ORDER BY name` in SQL or Lodash in route — both server-side |
| Data rendering | Browser (`dashboard/`) | — | Unchanged; consumes same JSON endpoints |
| Test DB isolation | API test harness | — | Env var + file cleanup; Phase 7 deepens patterns |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:sqlite` (`DatabaseSync`) | Built-in Node ≥22.5.0 [CITED: nodejs.org/api/sqlite.html] | SQLite file access | Project locked decision; zero deps (SQLITE-02) |
| Node.js | 22.x (Docker: `node:22-alpine`) [VERIFIED: api/Dockerfile] | Runtime with built-in SQLite | Required for `node:sqlite` |
| Express | ^4.18.2 [VERIFIED: api/package.json] | HTTP server | Existing stack — unchanged |
| `fs` / `fs/promises` | Built-in | Ensure `data/` exists; read `schema.sql` | Same mkdir pattern as current JSON persistence |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lodash` | ^4.17.21 | `sortBy` | Only if planner keeps sort in route layer (discretion) |
| `path` | Built-in | Resolve `DB_FILE`, `schema.sql` paths | Always in `db.js` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node:sqlite` DatabaseSync | `better-sqlite3` npm package | Faster/mature but violates zero-deps constraint — Phase 8 comparison only |
| `schema.sql` + `exec()` | Inline SQL strings in `db.js` | Less visible to learners — violates D-03 |
| `ORDER BY name` in SQL | Lodash `sortBy` in route | SQL sort removes Lodash from read path; Lodash keeps parity with current code |

**Installation:** None — no new packages.

**Version verification:**
- Node.js local: v22.22.3 [VERIFIED: `node --version`]
- `node:sqlite` available without `--experimental-sqlite` flag since v22.13.0 [CITED: nodejs.org/api/sqlite.html]
- Module still emits `ExperimentalWarning` on v22.22.3 [VERIFIED: local runtime] — document in Phase 8 NOTEBOOK, not a blocker

## Architecture Patterns

### System Architecture Diagram

```
HTTP Request (dashboard fetch)
        │
        ▼
┌───────────────────┐
│  Express routes   │  parseUserId(), validateUserPayload()
│  (index.js)       │  unchanged validation + status codes
└─────────┬─────────┘
          │ await db.createUser() / getAllUsers() / ...
          ▼
┌───────────────────┐
│  db.js helpers    │  async wrappers around sync SQLite
│  initDb()         │
└─────────┬─────────┘
          │ DatabaseSync.prepare().run/get/all
          ▼
┌───────────────────┐
│  users.db file    │  schema from schema.sql
│  (DB_FILE env)    │  seed John/Jane if COUNT(*)=0
└───────────────────┘

Startup (before listen):
  mkdir data/ → new DatabaseSync(path) → exec(schema.sql) → seedIfEmpty()
```

### Recommended Project Structure

```
api/
├── index.js          # Routes, validation, startServer → await initDb()
├── db.js             # NEW: initDb + CRUD helpers, module-level db handle
├── schema.sql        # NEW: CREATE TABLE IF NOT EXISTS users (...)
├── data/
│   └── users.db      # Runtime store (gitignored pattern like users.json)
├── Dockerfile        # Update comments; data/ still chowned
├── .dockerignore     # Add users.db exclusion
└── index.test.js     # Minimal: DB_FILE + initDb (Phase 7 expands)
```

### Pattern 1: Module-level DB handle + initDb

**What:** Single `DatabaseSync` instance created once at startup; CRUD helpers use the shared connection.

**When to use:** Single-process Express API (this lab).

**Example:**

```javascript
// Source: https://nodejs.org/api/sqlite.html + project conventions
const { readFileSync, mkdirSync } = require('fs');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'users.db');

let db;

async function initDb() {
  mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE_PATH);
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  seedIfEmpty();
}

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count === 0) {
    const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    insert.run('John Doe', 'john@example.com');
    insert.run('Jane Smith', 'jane@example.com');
  }
}
```

### Pattern 2: Prepared statements for all CRUD

**What:** `database.prepare()` with `?` placeholders; never interpolate user input into SQL strings.

**When to use:** Every query touching user-supplied `name`, `email`, or `id`. [CITED: nodejs.org/api/sqlite.html — StatementSync section]

**Example:**

```javascript
// Source: https://nodejs.org/api/sqlite.html
function createUser(name, email) {
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const { lastInsertRowid } = stmt.run(name, email);
  return { id: Number(lastInsertRowid), name, email };
}

function getAllUsers() {
  return db.prepare('SELECT id, name, email FROM users ORDER BY name').all();
}

function getUserById(id) {
  return db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id);
}

function updateUser(id, name, email) {
  const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
  const { changes } = stmt.run(name, email, id);
  return changes === 0 ? null : { id, name, email };
}

function deleteUser(id) {
  const user = getUserById(id);
  if (!user) return null;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return user;
}
```

**Critical API detail:** `lastInsertRowid` is on the **return value** of `stmt.run()`, not on the statement object. [VERIFIED: Node 22.22.3 local test]

### Pattern 3: Route refactor (memory → direct DB)

**What:** Remove `users[]`, `nextUserId`, `loadUsers`, `saveUsers`. Routes query DB per request.

**When to use:** All user routes in Phase 6.

**POST /users change:**

```javascript
// Before: push to array, increment nextUserId, saveUsers()
// After:
try {
  const user = await createUser(req.body.name.trim(), req.body.email.trim());
  res.status(201).json(user);
} catch (err) {
  console.error('[error] createUser() falló en POST /users:', err.message);
  res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
}
```

D-11 locks the 500 message string even though it mentions "archivo" — keep verbatim.

**Rollback (D-12 adaptation):** With direct DB writes, there is no in-memory state to revert. Failed INSERT/UPDATE/DELETE → catch, log, return 500. Successful DELETE/UPDATE checks `changes === 0` or pre-fetch for 404 before mutating.

### Pattern 4: schema.sql content

**Recommended schema (educational, minimal):**

```sql
-- api/schema.sql — learners read this file directly (D-03)
CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL
);
```

Do **not** put seed INSERTs here (recommendation: inline `seedIfEmpty()` in `initDb` — keeps DDL vs bootstrap data separate).

### Pattern 5: Test compatibility (minimal Phase 6)

**What:** Replace JSON fixture pattern with ephemeral SQLite file.

**Phase 7 owns:** Full isolation hardening, edge-case tests (TEST-03), no cross-test contamination guarantees.

**Minimal change to `index.test.js`:**

```javascript
const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;  // replaces DATA_FILE

const app = require('./index.js');

beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();  // replaces writeFile(JSON) + loadUsers()
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});
```

Fresh DB + seed produces John (id=1) and Jane (id=2) — matches current `TEST_SEED`. POST test gets id=3 via AUTOINCREMENT.

Export from `index.js`:

```javascript
module.exports = app;
module.exports.initDb = initDb;
// Optional backward-compat alias until Phase 7 removes it:
// module.exports.loadUsers = initDb;
```

**Tension note:** D-08 says Phase 7 updates tests; CONTEXT also says tests must not break if run. **Planner should include this minimal test update in Phase 6** — otherwise `npm test` fails immediately.

### Anti-Patterns to Avoid

- **String-interpolated SQL:** `db.exec(\`INSERT ... '${email}'\`)` — SQL injection risk; contradicts teaching goal.
- **Reading users.json at runtime:** Violates D-06; JSON remains reference/migration source only.
- **In-memory cache synced to DB:** Reintroduces dual-state complexity from Phase 2 — unnecessary with SQLite.
- **Using `stmt.lastInsertRowid` property:** Undefined on StatementSync — use destructuring from `run()` return. [VERIFIED: local test]
- **Overloading `DATA_FILE` for `.db` path:** Violates D-08.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL parsing / multi-statement exec | Custom statement splitter | `database.exec()` | Official wrapper around `sqlite3_exec()` [CITED: nodejs.org] |
| Parameter binding / escaping | Manual string escape | `prepare()` + `?` placeholders | Injection-safe; documented in StatementSync |
| ID auto-increment | Application counter (`nextUserId`) | `INTEGER PRIMARY KEY AUTOINCREMENT` | D-09; SQLite-native |
| Schema migration framework | Versioned migration runner | `CREATE TABLE IF NOT EXISTS` | Phase 6 scope is single-table bootstrap; Phase 7 handles JSON import |
| Async SQLite driver | Promisify wrapper library | Sync `DatabaseSync` inside async functions | Only built-in option in Node 22; no new deps |

**Key insight:** SQLite file persistence is simple enough that an ORM or migration framework would hide the learning objective (raw SQL visibility).

## Common Pitfalls

### Pitfall 1: Sync API blocks the event loop

**What goes wrong:** Under concurrent requests, `DatabaseSync` operations block Node's main thread.

**Why it happens:** All `node:sqlite` DatabaseSync/StatementSync methods are synchronous. [CITED: nodejs.org/api/sqlite.html]

**How to avoid:** Acceptable for this lab; keep queries simple. Mention in Phase 8 docs as trade-off vs async drivers.

**Warning signs:** Latency spikes under parallel load — out of scope for v1.1.

### Pitfall 2: WAL mode creates extra files

**What goes wrong:** Enabling `PRAGMA journal_mode=WAL` creates `users.db-wal` and `users.db-shm` alongside the main file — confuses learners expecting one `.db` file.

**Why it happens:** WAL is SQLite's default recommendation for concurrency but adds sidecar files.

**How to avoid:** **Do not enable WAL in Phase 6** — use default DELETE journal mode (single `.db` file). [VERIFIED: WAL works but creates sidecars]

**Warning signs:** Learners see three files in `data/` after first write.

### Pitfall 3: File permissions in Docker

**What goes wrong:** `DatabaseSync` cannot create/write `users.db` → startup or CRUD throws → 500 responses.

**Why it happens:** Container runs as `node` user; `data/` must be writable. Current Dockerfile already runs `mkdir -p data && chown -R node:node`. [VERIFIED: api/Dockerfile]

**How to avoid:** Reuse existing `mkdir` + Docker `chown` pattern; call `mkdirSync(DATA_DIR, { recursive: true })` before opening DB.

**Warning signs:** `SQLITE_CANTOPEN` or EACCES in logs on container start.

### Pitfall 4: ExperimentalWarning on startup

**What goes wrong:** Console shows `(node:xxx) ExperimentalWarning: SQLite is an experimental feature...`

**Why it happens:** Stability 1.2 (release candidate) in latest docs, but v22.22.3 still warns. [VERIFIED: local Node 22.22.3]

**How to avoid:** Document as expected behavior; optional `NODE_OPTIONS='--disable-warning=ExperimentalWarning'` for demos — not required in Phase 6 code.

### Pitfall 5: Test module cache + env var ordering

**What goes wrong:** `DB_FILE` not applied because `index.js` required before `process.env.DB_FILE` set.

**Why it happens:** Same pitfall as current `DATA_FILE` — documented in `index.test.js` lines 4-6.

**How to avoid:** Set `process.env.DB_FILE` **before** `require('./index.js')`.

### Pitfall 6: Assuming lastInsertRowid location

**What goes wrong:** `undefined` id in POST response if reading wrong property.

**Why it happens:** Docs describe `lastInsertRowid` on run() **return object**, not statement instance.

**How to avoid:** `const { lastInsertRowid } = stmt.run(name, email)`.

### Pitfall 7: INTEGER as BigInt

**What goes wrong:** Type mismatch in tests if `readBigInts: true` enabled — ids become `BigInt`, breaking `typeof res.body.id === 'number'` assertion.

**Why it happens:** Optional StatementSync configuration maps INTEGER to BigInt.

**How to avoid:** Keep default `readBigInts: false`; wrap with `Number(lastInsertRowid)` if needed.

## Code Examples

### Execute schema.sql on startup

```javascript
// Source: https://nodejs.org/api/sqlite.html — database.exec()
const schemaSql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schemaSql);
```

### startServer integration

```javascript
// Source: api/index.js pattern + D-01
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.initDb = initDb;
```

### Docker .dockerignore addition

```
# Current: data/users.json
# Add alongside:
data/users.db
data/*.db
```

Ephemeral container behavior preserved: excluded DB → fresh file → seed John/Jane on each container start (mirrors current SEED_DATA flow in docs/12-docker.md).

## Educational Angle: Raw SQL Visibility

Phase 6 teaches that persistence is a **separate layer** from HTTP routing:

| Artifact | Learner action | Concept taught |
|----------|----------------|----------------|
| `schema.sql` | Open in editor | Table structure, columns, AUTOINCREMENT |
| `db.js` | Trace `prepare()` calls | Parameterized queries, CRUD mapping |
| `data/users.db` | Inspect with `sqlite3` CLI (Phase 8) | Binary DB file vs readable JSON |
| `index.js` | See thin routes | Separation of concerns (D-01) |

Recommend `ORDER BY name` in SQL over Lodash to reduce magic and show sorting in the query layer — planner discretion, but aligns with "raw SQL visibility."

## Replacing index.js Persistence (Checklist)

| Remove | Replace with |
|--------|--------------|
| `users[]`, `nextUserId` | DB queries per operation |
| `SEED_DATA` object (runtime) | SQL seed in `db.js` |
| `loadUsers()`, `saveUsers()`, `saveUsersData()` | `initDb()` + CRUD helpers |
| `findUserIndexById()` | `getUserById()` returning row or undefined |
| `getSortedUsers()` | `getAllUsers()` with ORDER BY or Lodash |
| `readFile`/`writeFile` for users | `DatabaseSync` only |
| `module.exports.loadUsers` | `module.exports.initDb` (+ optional alias) |
| `DATA_FILE_PATH` (runtime) | `DB_FILE` in `db.js` |

Keep unchanged: `parseUserId`, `validateUserPayload`, all route URL paths, CORS, middleware, non-user routes.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `--experimental-sqlite` CLI flag | Enabled by default | Node v22.13.0 / v23.4.0 [CITED: nodejs.org] | No flag needed in scripts |
| Experimental stability | Release candidate (Stability 1.2) | Node v25.7.0 [CITED: nodejs.org] | API may still warn on v22 |
| JSON file store (Phase 2) | SQLite file (Phase 6) | This phase | Same HTTP contract, different persistence tier |

**Deprecated/outdated:**
- In-memory + JSON dual-write pattern — replaced by direct SQLite in Phase 6
- `nextUserId` counter in JSON — replaced by AUTOINCREMENT

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | No async `Database` class needed in Node 22 — DatabaseSync only | Standard Stack | Low — verified on v22.22.3 exports |
| A2 | Minimal test swap (DB_FILE + initDb) keeps 12 tests green | Pattern 5 | Medium — planner should verify with `npm test` in Phase 6 gate |
| A3 | Default journal mode (no WAL) keeps single `.db` file for learners | Pitfall 2 | Low — WAL is opt-in |
| A4 | D-11 requires keeping "permisos del archivo" string despite DB store | Pattern 3 | None — locked decision |

## Open Questions

1. **Lodash vs SQL sort for GET /users**
   - What we know: Both produce Jane before John; dashboard unaffected.
   - What's unclear: Whether to remove Lodash dependency eventually.
   - Recommendation: Use `ORDER BY name` in SQL — one less moving part; Lodash can remain in package.json for now.

2. **Export `loadUsers` alias for tests**
   - What we know: Tests call `app.loadUsers()` today.
   - What's unclear: Whether alias violates D-08 naming clarity.
   - Recommendation: Rename test calls to `initDb()` in minimal Phase 6 test update — cleaner than alias.

3. **OpenAPI update in Phase 6**
   - What we know: Contract unchanged if shapes preserved.
   - Recommendation: Defer OpenAPI edit unless planner adds a note that persistence backend changed (optional description tweak only).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.5 | `node:sqlite` | ✓ | v22.22.3 | None — hard requirement |
| `node:sqlite` module | db.js | ✓ | Built-in | None |
| sqlite3 CLI | Phase 8 inspection mission | ✓ | 3.51.2 | Optional for Phase 6 |
| Docker | Container verification | ✓ | 29.3.0 | Manual `npm start` |
| npm dependencies | Express API | ✓ | express 4.18.2 | — |

**Missing dependencies with no fallback:**
- None for Phase 6 implementation.

**Missing dependencies with fallback:**
- None.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — no auth in lab |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A — open CRUD lab |
| V5 Input Validation | yes | `validateUserPayload()` in routes + prepared statements in db.js |
| V6 Cryptography | no | N/A — no encrypted fields |

### Known Threat Patterns for node:sqlite + Express

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via name/email | Tampering | `prepare()` with `?` placeholders — never template user input into SQL |
| Path traversal via DB_FILE | Tampering | `path.resolve()` on env var; document trusted env in Docker/host |
| Unhandled DB errors leaking stack | Information disclosure | Catch in routes; return generic Spanish 500 message (existing pattern) |

## Sources

### Primary (HIGH confidence)
- [Node.js SQLite API](https://nodejs.org/api/sqlite.html) — DatabaseSync, exec(), StatementSync.run() return shape, stability history
- Local verification on Node v22.22.3 — module exports, lastInsertRowid, multi-statement exec, ExperimentalWarning

### Secondary (MEDIUM confidence)
- `api/index.js`, `api/index.test.js`, `api/Dockerfile`, `api/.dockerignore` — current persistence and Docker patterns
- `.planning/phases/06-sqlite-persistence-layer/06-CONTEXT.md` — locked decisions
- `docs/12-docker.md` — ephemeral data behavior to preserve

### Tertiary (LOW confidence)
- Context7 `/nodejs/node` docs fetch failed in this session — relied on official nodejs.org + local verification instead

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified built-in module on project Node version
- Architecture: HIGH — direct mapping from locked CONTEXT decisions to file layout
- Pitfalls: HIGH — several verified locally (lastInsertRowid, WAL sidecars, ExperimentalWarning)

**Research date:** 2026-05-30
**Valid until:** 2026-06-30 (stable API; watch Node 25+ stability promotion)

## RESEARCH COMPLETE

**Phase:** 6 - SQLite Persistence Layer
**Confidence:** HIGH

### Key Findings
- `node:sqlite` in Node 22 is **sync-only** (`DatabaseSync`); async exports wrap sync calls — no npm packages needed.
- `schema.sql` → `db.exec()` supports multiple statements; seed John/Jane in `initDb()` after `COUNT(*)`, not in schema file.
- `lastInsertRowid` comes from `stmt.run()` return value — use for POST 201 responses (D-10).
- Routes simplify: remove in-memory array; DB is single source of truth; preserve exact HTTP/JSON contract (D-11).
- Tests need minimal swap to `DB_FILE` + `initDb()` (delete test `.db` in beforeEach) — full test hardening remains Phase 7.

### File Created
`.planning/phases/06-sqlite-persistence-layer/06-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Official docs + local Node 22.22.3 verification |
| Architecture | HIGH | Locked CONTEXT maps cleanly to db.js + schema.sql |
| Pitfalls | HIGH | lastInsertRowid, WAL, permissions tested or documented |

### Open Questions
- SQL `ORDER BY` vs Lodash — recommend SQL sort.
- Whether to add `loadUsers` alias — recommend rename to `initDb` in tests instead.

### Ready for Planning
Research complete. Planner can now create PLAN.md files with three likely waves: (1) `schema.sql` + `db.js` + `initDb`, (2) `index.js` route refactor, (3) Docker/test minimal updates + manual verification gate.
