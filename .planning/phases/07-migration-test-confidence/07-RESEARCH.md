# Phase 7: Migration & Test Confidence - Research

**Researched:** 2026-05-30
**Domain:** JSON→SQLite migration, UNIQUE constraints, test harness expansion
**Confidence:** HIGH

## Summary

Phase 7 extends `api/db.js` so empty databases populate from `api/data/users.json` before falling back to hardcoded John/Jane seed. Migration preserves explicit IDs from JSON; `nextId` is ignored because SQLite `AUTOINCREMENT`/`sqlite_sequence` advances after explicit inserts.

Add `UNIQUE` on `email` in `schema.sql`. `node:sqlite` `DatabaseSync` throws on constraint violations — catch in `createUser`/`updateUser` and surface a typed error (`DuplicateEmailError`) that `index.js` maps to **409** with `Ya existe un usuario con ese email.` PUT updating a user with their own email succeeds (SQLite allows unchanged UNIQUE values).

`initDb({ skipSeed: true })` skips population for empty-database tests. Existing harness (`DB_FILE` before require, `unlink` + `initDb()` in `beforeEach`) already provides per-test isolation (TEST-02).

**Primary recommendation:** Refactor `seedIfEmpty()` → `populateIfEmpty()` with JSON-first flow; add `DuplicateEmailError`; extend tests to ~16 cases; update `docs/10-tests.md` and OpenAPI 409 entries.

<phase_requirements>
| ID | Research Support |
|----|------------------|
| MIG-01 | Auto-migrate in `initDb()` when COUNT=0 |
| MIG-02 | Brief JSON vs SQLite note in docs/10-tests.md or api/README.md |
| MIG-03 | users.json read only at seed time, never as runtime store |
| TEST-01 | All 12 existing tests still pass after changes |
| TEST-02 | DB_FILE + unlink beforeEach pattern preserved |
| TEST-03 | New tests: empty DB, POST duplicate, PUT collision |
</phase_requirements>

## Patterns

### Pattern 1: JSON migration in initDb

```javascript
const USERS_JSON_PATH = path.join(__dirname, 'data', 'users.json');

function populateIfEmpty() {
  const database = getDb();
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) return;

  let users = tryParseUsersJson();
  if (users === null) {
    // corrupt JSON — restore hardcoded seed (D-07)
    console.warn('[warn] data/users.json corrupto — restaurando semilla');
    users = DEFAULT_SEED;
  } else if (users.length === 0) {
    users = DEFAULT_SEED;
  } else {
    console.log(`Migrados ${users.length} usuarios desde users.json`);
  }

  const insert = database.prepare(
    'INSERT INTO users (id, name, email) VALUES (?, ?, ?)'
  );
  for (const u of users) {
    insert.run(u.id, u.name, u.email);
  }
}
```

### Pattern 2: UNIQUE constraint error detection

SQLite throws `SqliteError` with `code: 'SQLITE_CONSTRAINT_UNIQUE'` (Node 22 `node:sqlite`).

```javascript
function isUniqueConstraintError(err) {
  return err && (err.code === 'SQLITE_CONSTRAINT_UNIQUE'
    || /UNIQUE constraint failed/i.test(err.message));
}
```

Export custom error from `db.js`:

```javascript
class DuplicateEmailError extends Error {
  constructor() {
    super('Ya existe un usuario con ese email.');
    this.name = 'DuplicateEmailError';
  }
}
```

### Pattern 3: initDb options

```javascript
async function initDb(options = {}) {
  // ... schema exec ...
  if (!options.skipSeed) {
    populateIfEmpty();
  }
}
```

Tests: `await app.initDb({ skipSeed: true })` for empty DB case.

### Pattern 4: Route 409 mapping

```javascript
} catch (err) {
  if (err.name === 'DuplicateEmailError') {
    return res.status(409).json({ error: err.message });
  }
  // existing 500 path
}
```

## Schema change

```sql
email TEXT NOT NULL UNIQUE
```

`CREATE TABLE IF NOT EXISTS` does not alter existing tables. For dev DBs created in Phase 6 without UNIQUE, learners delete `users.db` or planner documents that fresh DB is required. Tests always `unlink` test DB — schema reapplied each run.

## Risks

| Risk | Mitigation |
|------|------------|
| Existing production users.db lacks UNIQUE | Document delete-and-restart; tests use fresh file |
| Migration runs when learner expects empty | Only when COUNT=0 (D-04) |
| OpenAPI still says users.json persistence | Update POST description + add 409 |

## RESEARCH COMPLETE
