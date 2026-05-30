# Phase 7: Pattern Map

**Mapped:** 2026-05-30

## Files to Modify

### api/db.js — extend persistence layer

**Analog:** Current `seedIfEmpty()` + Phase 2 `loadUsers()` JSON read pattern (from v1.0 index.js, archived in docs/08)

```javascript
// Current seedIfEmpty (replace with populateIfEmpty)
function seedIfEmpty() {
  const { count } = database.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count > 0) return;
  const insert = database.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  insert.run('John Doe', 'john@example.com');
  insert.run('Jane Smith', 'jane@example.com');
}
```

```javascript
// users.json shape (migration source)
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```

### api/index.js — error mapping

**Analog:** Existing try/catch on POST/PUT with 500 response

```javascript
} catch (err) {
  console.error('[error] createUser() falló en POST /users:', err.message);
  return res.status(500).json({ error: 'No se pudo persistir el cambio...' });
}
```

Add branch before 500 for `DuplicateEmailError`.

### api/index.test.js — harness extension

**Analog:** Phase 6 pattern (already in place)

```javascript
process.env.DB_FILE = TEST_DB;
const app = require('./index.js');
beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});
```

Extend with `initDb({ skipSeed: true })` for empty DB describe block.

### docs/10-tests.md — stale DATA_FILE section

**Analog:** Phase 6 index.test.js (source of truth for DB_FILE pattern)

Replace lines 59-100 referencing `DATA_FILE`, `users.test.json`, `loadUsers()`.

## PATTERN MAPPING COMPLETE
