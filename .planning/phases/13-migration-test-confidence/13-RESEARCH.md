# Phase 13: Migration & Test Confidence - Research

**Researched:** 2026-06-01
**Domain:** PostgreSQL seed parity, Node.js test isolation, dual-backend test matrix
**Confidence:** HIGH (patterns verified in-repo; PG sequence SQL from official PostgreSQL docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Postgres seed / migration (PGMIG-01)**
- **D-01:** Extract shared seed logic into **`api/seed.js`** consumed by **`db-sqlite.js`** and **`db-pg.js`** — single `populateIfEmpty` behavior, no duplicated JSON parsing.
- **D-02:** Postgres seed uses **explicit `id` values** from JSON/default seed, then **reset the SERIAL sequence** (`setval` on `users_id_seq`) so IDs match SQLite semantics and tests expecting id 1/2 remain teachable.
- **D-03:** **Same console messages** as SQLite path (`Migrados N usuarios`, corrupt JSON warn, default seed) — no Postgres-specific wording unless already prefixed by `[db] Using PostgreSQL`.
- **D-04:** **`populateIfEmpty` is no-op when `COUNT(*) > 0`** on Postgres (same as SQLite) — Compose named volume with existing data must not be overwritten.

**Test database isolation (PGTEST-02, PGTEST-03)**
- **D-05:** Tests use database **`edf_lab_test`** on the **same Postgres server** as dev (`localhost:5432` or compose-published port) — never `edf_lab` production/dev DB from Compose.
- **D-06:** **`npm run test:db:prepare`** (api/ + wrapper at repo root) creates `edf_lab_test` if missing; document one-time / pre-test requirement in README paths.
- **D-07:** Postgres test **`beforeEach`**: `TRUNCATE users RESTART IDENTITY` (then re-seed or rely on tests that insert fresh data — align with existing SQLite pattern of clean DB + initDb).
- **D-08:** **Postgres must be running** on `localhost:5432` for the Postgres test file to pass — document prerequisite (Homebrew PG 16 or `docker compose up` postgres service). No silent skip of PG suite (PGTEST-01 strict).

**Test matrix (PGTEST-01)**
- **D-09:** **`npm test` runs both backends in sequence**: existing **`index.test.js`** (SQLite via `DB_FILE`) then **`index.pg.test.js`** (Postgres via `TEST_DATABASE_URL` or equivalent).
- **D-10:** **Separate test file** `index.pg.test.js` — do not branch SQLite vs PG inside `index.test.js`.
- **D-11:** **Root `package.json` wrappers** delegate to `api/` for `test`, `test:pg`, and `test:db:prepare` (mirror `compose:*` pattern).
- **D-12:** **`index.test.js` behavior unchanged** for SQLite — dual run adds Postgres confidence without removing the fast, file-based isolation story.

**Documentation (PGMIG-02)**
- **D-13:** Add section **at end of `docs/13-sqlite.md`**: comparison table (file vs server, bind mount vs named volume, when to use each in the lab) **plus executable commands** (`psql`, `test:db:prepare`, `TEST_DATABASE_URL`, `npm test` / `test:pg`).
- **D-14:** **Phase 13 doc boundary** — no step-by-step Compose+Postgres mission, no full `docs/15-postgresql.md` content (Phase 14).
- **D-15:** **Do not update `docs/00-indice.md`** in Phase 13 — deferred to Phase 14 (PGDOCS-04).

**Out of scope (locked)**
- **D-16:** No dashboard/`app.js` changes; no ORM; no removing SQLite.
- **D-17:** No Mission 12, no NOTEBOOK bulk doc pass (PGDOCS-05 is Phase 14 unless blocker-only note).

### Claude's Discretion

- Exact `seed.js` export surface; `setval` SQL snippet; whether `npm test` chains via root script or `cd api && npm test && npm run test:pg`; `TEST_DATABASE_URL` default connection string shape; duplicate PG test structure (copy vs shared helper).

### Deferred Ideas (OUT OF SCOPE)

- Full `docs/15-postgresql.md` and Mission 12 walkthrough → **Phase 14**
- `docs/00-indice.md` and README Postgres path completeness → **Phase 14** (PGDOCS-04)
- NOTEBOOK Postgres error catalog → **Phase 14** (PGDOCS-05)
- `FORCE_SEED` / destructive reseed flag → out of scope
- Second Postgres container for tests → rejected (use `edf_lab_test` on same server)

</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

Single-tier application — all capabilities reside in the **API/Backend** tier (`api/`). No dashboard or Compose changes in Phase 13 except documentation references to existing `docker-compose.yml`.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| JSON → Postgres seed on empty DB | API/Backend | Database/Storage | `seed.js` + `db-pg.js` at init |
| Shared seed with SQLite | API/Backend | — | One module, two adapters |
| Isolated test DB `edf_lab_test` | API/Backend (scripts + tests) | Database/Storage | Script creates DB; tests TRUNCATE |
| Dual `npm test` matrix | API/Backend (test runner) | — | Two files, two processes |
| SQLite vs PG comparison doc | Documentation | — | `docs/13-sqlite.md` extension only |

</architectural_responsibility_map>

<research_summary>
## Summary

Phase 13 closes the gap left by Phase 12: PostgreSQL gets the same **seed-on-empty** behavior SQLite already has via `populateIfEmpty` in `db-sqlite.js`, and the **16 existing API tests** gain a Postgres twin in `index.pg.test.js` against an isolated `edf_lab_test` database.

The implementation mirrors **v1.1 Phase 7** (migration + test confidence) but swaps file/SQLite mechanics for `pg` Pool + `TRUNCATE ... RESTART IDENTITY`. The critical Postgres-specific detail is **explicit `INSERT` with `id` + `setval` on the SERIAL sequence** so tests that hit `/users/1` and expect John/Jane from seed keep working after migration.

**Primary recommendation:** Plan as three vertical slices — (1) `api/seed.js` + wire both DB adapters, (2) `test:db:prepare` + `index.pg.test.js` + npm scripts, (3) `docs/13-sqlite.md` “Hacia PostgreSQL” section — with Wave 2 blocked on Wave 1 seed in `db-pg.js`.
</research_summary>

<standard_stack>
## Standard Stack

### Core (already in repo — no new deps)

| Library | Version (repo) | Purpose | Why Standard |
|---------|----------------|---------|--------------|
| `pg` | ^8.13.1 [VERIFIED: api/package.json] | Postgres pool + queries | Phase 12 adapter; parameterized `$1` |
| `node:sqlite` / `DatabaseSync` | built-in [VERIFIED: api/db-sqlite.js] | SQLite tests unchanged | PGSQL-05 host default |
| `node:test` + `supertest` | devDeps [VERIFIED: api/package.json] | HTTP integration tests | Same as v1.1 |

### Supporting

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `psql` CLI | Inspect `edf_lab` / `edf_lab_test` | Documented in PGMIG-02 section |
| `docker compose up` (postgres only) | Local PG on :5432 | When host has no Postgres |
| `CREATE DATABASE IF NOT EXISTS` | `test:db:prepare` | Postgres 16 in compose [VERIFIED: docker-compose.yml `postgres:16-alpine`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `edf_lab_test` on same server | Second compose service | Rejected in CONTEXT — more ops noise |
| `TRUNCATE` in tests | DROP DATABASE per test | Slower; TRUNCATE matches D-07 |
| Branching in `index.test.js` | `index.pg.test.js` | Rejected — D-10 pedagogy |
| `INSERT` without explicit ids | SERIAL only | Breaks tests using id=1,2 from seed |

**No new `npm install` required for Phase 13.**

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Data flow: seed on empty database

```txt
initDb() [db-sqlite | db-pg]
    │
    ├─► apply schema (schema.sql | schema.pg.sql)
    │
    └─► if !skipSeed → seed.populateIfEmpty(adapter)
              │
              ├─ COUNT(*) > 0 ? → return (D-04)
              │
              └─ resolve users:
                    tryParseUsersJson() → DEFAULT_SEED
                    │
                    ├─ SQLite: INSERT (id, name, email) per row
                    │
                    └─ Postgres: INSERT (id, name, email) per row
                          then setval(sequence, MAX(id))
```

### Data flow: Postgres test isolation

```txt
beforeEach (index.pg.test.js)
    │
    ├─ TEST_DATABASE_URL set BEFORE require('./index.js')
    │
    ├─ TRUNCATE users RESTART IDENTITY  (via pool or test helper)
    │
    └─ app.initDb()  → schema + populateIfEmpty → 2 seed users

npm test (api/)
    │
    ├─ Process 1: node --test index.test.js     (DB_FILE → *.test.db)
    │
    └─ Process 2: node --test index.pg.test.js  (DATABASE_URL → edf_lab_test)
```

**Important:** Chain with `&&` (two `node --test` invocations), not one process with both files — `DATABASE_URL` vs `DB_FILE` routing is decided at first `require('./db.js')` [VERIFIED: api/db.js].

### Recommended file layout

```txt
api/
├── seed.js                 # NEW — resolveSeedUsers, populateIfEmptySqlite, populateIfEmptyPg
├── db-sqlite.js            # refactor — require seed.js
├── db-pg.js                # add seed call in initDb when !skipSeed
├── scripts/
│   └── prepare-test-db.js  # NEW — CREATE DATABASE edf_lab_test
├── index.test.js           # unchanged (16 tests)
└── index.pg.test.js        # NEW — mirror suites, PG env
```

### Pattern 1: Shared `seed.js` module

**What:** Move `DEFAULT_SEED`, `tryParseUsersJson`, and `populateIfEmpty` decision tree out of `db-sqlite.js`.

**Exports (recommended):**

| Export | Responsibility |
|--------|----------------|
| `DEFAULT_SEED` | Same array as today |
| `tryParseUsersJson()` | Read `api/data/users.json` |
| `resolveSeedUsers()` | Returns `{ users, source: 'json'|'default'|'corrupt' }` + logging |
| `populateIfEmptySqlite(getDb)` | COUNT + INSERT with explicit ids |
| `populateIfEmptyPg(pool)` | COUNT + INSERT + `setval` |

**When to use:** Both adapters call only their adapter-specific populate; messages stay identical (D-03).

### Pattern 2: Postgres explicit IDs + sequence reset

**What:** After inserting seed rows with explicit `id`, sync SERIAL so next `INSERT` without id gets `MAX(id)+1`.

**When to use:** Every Postgres seed run (D-02).

```sql
-- [CITED: PostgreSQL docs — setval, pg_get_serial_sequence]
SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM users)
);
```

For `users` + `SERIAL PRIMARY KEY`, sequence name is `users_id_seq` [ASSUMED: default naming; `pg_get_serial_sequence` avoids hardcoding if table is qualified].

### Pattern 3: `index.pg.test.js` env ordering

**What:** Copy the critical comment block from `index.test.js` lines 3–6; set `TEST_DATABASE_URL` (or `DATABASE_URL`) before `require('./index.js')`.

**Default URL (recommended for planner):**

```txt
postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test
```

Matches compose credentials [VERIFIED: docker-compose.yml] with different database name (D-05).

**When to use:** Entire PG test file; do not set `DB_FILE` so `db.js` selects `db-pg`.

### Pattern 4: Test DB prepare script

**What:** Small Node script using `pg` connecting to maintenance DB `postgres`, run:

```sql
CREATE DATABASE edf_lab_test OWNER edf_lab;
```

Use `IF NOT EXISTS` on Postgres 15+ [CITED: PostgreSQL 15+ CREATE DATABASE IF NOT EXISTS; image is 16-alpine].

Handle error `42P04` (duplicate_database) as success for idempotency on older syntax without IF NOT EXISTS.

### Pattern 5: npm scripts

**api/package.json (recommended):**

```json
"test": "node --test index.test.js --test-force-exit && node --test index.pg.test.js --test-force-exit",
"test:pg": "node --test index.pg.test.js --test-force-exit",
"test:db:prepare": "node scripts/prepare-test-db.js"
```

**Root package.json (D-11):**

```json
"test": "npm --prefix api test",
"test:pg": "npm --prefix api run test:pg",
"test:db:prepare": "npm --prefix api run test:db:prepare"
```

### Anti-Patterns to Avoid

- **Seeding `edf_lab` during tests:** Contaminates Compose dev data — violates D-05 / PGTEST-02.
- **Skipping PG tests when connection fails:** Violates D-08; fail loudly with clear message.
- **Single `node --test` with both files:** Env for SQLite and PG would conflict in one process.
- **Omitting `setval` after explicit ids:** Next `POST /users` may collide on id or return unexpected ids.
- **Updating `docs/00-indice.md`:** Deferred to Phase 14 (D-15).

</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON seed parsing | Duplicate in db-pg | `api/seed.js` | D-01; one migration log |
| Postgres connection for prepare | Shell-only psql script | `pg` client in `scripts/prepare-test-db.js` | Same dep as adapter; cross-platform |
| Test HTTP assertions | New assertion framework | Copy `index.test.js` describes | 16 tests already proven |
| DB existence check | ORM migration tool | `CREATE DATABASE IF NOT EXISTS` + COUNT | Minimal deps (AGENTS.md rule 5) |
| Sequence repair | Manual guess next id | `setval` + `pg_get_serial_sequence` | Official PG mechanism |

**Key insight:** Phase 13 is consolidation and confidence, not new features. Reuse Phase 7 rhythms and Phase 12 adapters.

</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Module cache / wrong backend in tests

**What goes wrong:** `index.pg.test.js` runs against SQLite or wrong DB path.

**Why it happens:** `require('./index.js')` before setting `DATABASE_URL`; or `DB_FILE` still set.

**How to avoid:** Set `process.env.DATABASE_URL` from `TEST_DATABASE_URL`; `delete process.env.DB_FILE` before require; separate node processes for D-09.

**Warning signs:** Tests pass without Postgres running; or `users.test.db` appears during PG run.

### Pitfall 2: Sequence out of sync after seed

**What goes wrong:** `POST /users` returns 201 with `id: 1` when row id=1 already exists → unique errors or wrong pedagogy.

**Why it happens:** Explicit `INSERT` with id 1,2 without `setval`.

**How to avoid:** Always run `setval` after batch insert (D-02).

**Warning signs:** Duplicate primary key on create after seed; id less than MAX(id).

### Pitfall 3: Tests wipe dev Compose database

**What goes wrong:** `TRUNCATE` or seed against `edf_lab` destroys learner's docker volume data.

**Why it happens:** `DATABASE_URL` points at dev DB.

**How to avoid:** Default test URL ends with `/edf_lab_test`; assert in prepare script; document in docs section.

**Warning signs:** Compose dashboard empty after `npm test`.

### Pitfall 4: Postgres not running — flaky CI/local

**What goes wrong:** `npm test` fails on second half always.

**Why it happens:** No postgres on :5432; D-08 requires hard fail, not skip.

**How to avoid:** Document: `docker compose up -d edf-lab-postgres` then `npm run test:db:prepare`; clear error in `index.pg.test.js` hook if connection refused.

**Warning signs:** ECONNREFUSED in pg Pool.

### Pitfall 5: `CREATE DATABASE` connected to wrong DB

**What goes wrong:** Cannot create `edf_lab_test` while connected to it.

**Why it happens:** Connection string targets `edf_lab_test` before it exists.

**How to avoid:** `prepare-test-db.js` connects to `postgresql://...@localhost:5432/postgres` (or `edf_lab`).

**Warning signs:** `55006` / database in use errors.

### Pitfall 6: TRUNCATE without re-seed

**What goes wrong:** Tests expecting 2 users fail after truncate-only beforeEach.

**Why it happens:** D-07 allows truncate + re-seed; SQLite pattern is `initDb()` which re-seeds.

**How to avoid:** `TRUNCATE` then `await app.initDb()` (with seed enabled), matching SQLite `unlink` + `initDb()`.

**Warning signs:** GET /users returns `[]` in default tests.

</common_pitfalls>

<code_examples>
## Code Examples

### SQLite populate (current — extract to seed.js)

```javascript
// [VERIFIED: api/db-sqlite.js] — behavior to preserve
function populateIfEmpty() {
  const database = getDb();
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) return;
  const fromJson = tryParseUsersJson();
  // ... resolve users, log Migrados N / warn corrupt ...
  insertUsers(users);
}
```

### Postgres populate (new in db-pg initDb)

```javascript
// [CITED: node-postgres Pool.query — parameterized queries]
async function populateIfEmptyPg(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count > 0) return;

  const { users, logLine } = resolveSeedUsers(); // shared with SQLite
  if (logLine) console.log(logLine);

  for (const u of users) {
    await pool.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
      [u.id, u.name, u.email]
    );
  }
  await pool.query(
    `SELECT setval(
      pg_get_serial_sequence('users', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM users)
    )`
  );
}
```

### db-pg initDb integration

```javascript
// [VERIFIED: api/db-pg.js structure] — add after schema apply
await pool.query(schema);
if (!options.skipSeed) {
  await populateIfEmptyPg(pool);
}
console.log('[db] Using PostgreSQL');
```

### index.pg.test.js header

```javascript
'use strict';
// CRÍTICO: TEST_DATABASE_URL / DATABASE_URL antes de require('./index.js')
const DEFAULT_TEST_URL =
  'postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || DEFAULT_TEST_URL;
delete process.env.DB_FILE;

const { describe, it, beforeEach } = require('node:test');
// ... require app, supertest ...
beforeEach(async () => {
  await truncateUsers(); // TRUNCATE users RESTART IDENTITY
  await app.initDb();
});
```

### prepare-test-db.js (sketch)

```javascript
'use strict';
const { Client } = require('pg');
const ADMIN_URL =
  process.env.PG_ADMIN_URL ||
  'postgresql://edf_lab:edf_lab_dev@localhost:5432/postgres';

async function main() {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  await client.query('CREATE DATABASE edf_lab_test OWNER edf_lab');
  await client.end();
  console.log('Base edf_lab_test lista para tests.');
}
main().catch((err) => {
  if (err.code === '42P04') process.exit(0); // already exists
  console.error(err.message);
  process.exit(1);
});
```

### Verification commands (planner acceptance)

```bash
# Postgres running (compose)
docker compose up -d edf-lab-postgres

# Create test DB
npm run test:db:prepare

# Seed check — empty edf_lab_test, start API
DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test PORT=3100 node api/index.js
curl -s http://localhost:3100/users | jq length   # expect 2 after first boot

# Full suite
cd api && npm test   # 16 SQLite + 16 Postgres

# Duplicate email on PG (PGTEST-03)
# covered by existing "Email duplicado" describes in index.pg.test.js
```

</code_examples>

<project_constraints>
## Project Constraints (from CLAUDE.md)

- **CORS / dashboard contract:** No dashboard changes (D-16); HTTP/JSON unchanged.
- **Ports:** 3100 API, 5173 dashboard — test docs should not imply port changes.
- **No unnecessary dependencies:** Phase 13 uses existing `pg` only.
- **Document observable behavior:** Update `docs/13-sqlite.md`; optional brief `api/README.md` test prerequisite — not `00-indice` (D-15).
- **Errors → NOTEBOOK:** Only blocker-level in Phase 13 (D-17); bulk PG errors → Phase 14.

</project_constraints>

<planning_recommendations>
## Planning Recommendations (for gsd-planner)

### Suggested plans (mirror Phase 7 / 12 wave style)

| Plan | Wave | Requirements | Delivers |
|------|------|--------------|----------|
| **13-01** | 1 | PGMIG-01 | `api/seed.js`; refactor `db-sqlite.js`; seed in `db-pg.js` + `setval`; manual verify empty `edf_lab` gets 2 users |
| **13-02** | 2 (depends 13-01) | PGTEST-01, PGTEST-02, PGTEST-03 | `scripts/prepare-test-db.js`; `index.pg.test.js` (16 tests); api + root npm scripts; `npm test` dual run |
| **13-03** | 2 or 3 | PGMIG-02 | Section **«Hacia PostgreSQL»** at end of `docs/13-sqlite.md`; touch `api/README.md` tests section if needed |

### Test count baseline

[VERIFIED: api/index.test.js] — **16** `it()` blocks across health, CRUD, ID validation, empty DB, duplicate email. PG file should match 1:1.

### must_haves truths (goal-backward)

1. Empty Postgres + `initDb` → John (id=1) and Jane (id=2) visible via `GET /users`.
2. `npm test` → 32 passing tests total when Postgres up (16+16).
3. `edf_lab` volume data untouched after test run (tests only hit `edf_lab_test`).
4. `docs/13-sqlite.md` ends with comparison table + commands; no Mission 12 / doc 15.

### Files likely modified

- `api/seed.js` (new)
- `api/db-sqlite.js`, `api/db-pg.js`
- `api/scripts/prepare-test-db.js` (new)
- `api/index.pg.test.js` (new)
- `api/package.json`, `package.json` (root)
- `docs/13-sqlite.md`
- Optionally `api/README.md` (test prerequisite paragraph)

### Not modified

- `dashboard/*`, `docker-compose.yml`, `docs/00-indice.md`, `openapi.yaml` (unless duplicate-email already documented — no change expected)

</planning_recommendations>

<open_questions>
## Open Questions

1. **Shared test helper module?**
   - What we know: Duplicating 16 tests is explicit D-10; v1.1 kept one file.
   - Recommendation: Start with file copy; extract `test-helpers.js` only if checker flags maintenance (discretion).

2. **`TEST_DATABASE_URL` vs overwriting `DATABASE_URL` in PG tests**
   - What we know: Router reads `DATABASE_URL` [VERIFIED: api/db.js].
   - Recommendation: Set `DATABASE_URL` from `TEST_DATABASE_URL` in test file header; document both env names in docs (CONTEXT allows either).

3. **TRUNCATE implementation location**
   - What we know: Tests need pool access; `db-pg` does not export pool.
   - Recommendation: Export minimal `resetUsersForTests()` from `db-pg.js` OR use one-off `pg.Client` in test `beforeEach` — prefer thin export to avoid duplicating connection config.

</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `api/db-sqlite.js`, `api/db-pg.js`, `api/db.js`, `api/index.test.js` — current behavior
- `.planning/phases/13-migration-test-confidence/13-CONTEXT.md` — locked decisions
- `docker-compose.yml` — credentials and Postgres 16 image
- `.planning/milestones/v1.1-ROADMAP.md` — Phase 7 parallel pattern

### Secondary (MEDIUM confidence)
- PostgreSQL `setval` / `pg_get_serial_sequence` — [CITED: postgresql.org documentation]
- `CREATE DATABASE IF NOT EXISTS` — Postgres 15+; compose uses 16-alpine

### Tertiary (LOW confidence — validate at implementation)
- Exact error code for duplicate DB on all PG versions if `IF NOT EXISTS` omitted — handle `42P04` in catch

</sources>

<metadata>
## Metadata

**Research scope:** seed extraction, PG SERIAL reset, test DB isolation, dual npm test, docs section

**Confidence breakdown:**
- Standard stack: HIGH — in-repo verification
- Architecture: HIGH — mirrors Phase 7 + 12
- Pitfalls: HIGH — known PG/Node test gotchas
- Code examples: MEDIUM-HIGH — setval verified from PG docs; test file sketch not run in this session (Postgres availability not confirmed in sandbox)

**Research date:** 2026-06-01
**Valid until:** 2026-07-01

</metadata>

---

## RESEARCH COMPLETE

**Phase:** 13 — Migration & Test Confidence  
**Confidence:** HIGH

### Key findings

1. Extract `populateIfEmpty` / JSON parsing to **`api/seed.js`**; Postgres needs **explicit ids + `setval`** after insert.
2. **`index.pg.test.js`** must set **`DATABASE_URL` before `require('./index.js')`**; run in a **second** `node --test` process.
3. **`edf_lab_test`** + **`npm run test:db:prepare`** isolates tests from Compose **`edf_lab`** data.
4. **`npm test`** = 16 SQLite + 16 Postgres tests; no silent skip when PG is down (D-08).
5. Docs: new section at end of **`docs/13-sqlite.md`** only — not index/Mission 12.

### File created

`.planning/phases/13-migration-test-confidence/13-RESEARCH.md`

### Ready for planning

Yes — run `/gsd-plan-phase 13` (or continue planning if research was the only missing step).
