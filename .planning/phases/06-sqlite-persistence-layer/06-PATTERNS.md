# Phase 6: SQLite Persistence Layer - Pattern Map

**Mapped:** 2026-05-30
**Files analyzed:** 6
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `api/schema.sql` | model (DDL) | transform | `api/data/users.json` + `api/openapi.yaml` User schema | partial |
| `api/db.js` | service | CRUD | `api/index.js` (persistencia lines 59–89) | exact |
| `api/index.js` | route | request-response + CRUD | `api/index.js` (routes + validation, self) | exact |
| `api/index.test.js` | test | CRUD | `api/index.test.js` (self) | exact |
| `api/.dockerignore` | config | file-I/O | `api/.dockerignore` line 38 (`data/users.json`) | exact |
| `api/Dockerfile` | config | file-I/O | `api/Dockerfile` lines 15–17 (`data/` + chown) | exact |

## Pattern Assignments

### `api/schema.sql` (model/DDL, transform)

**Analog:** `api/data/users.json` (field structure) + `api/openapi.yaml` User schema (types/constraints)

No SQL files exist in the codebase. Map JSON seed fields to DDL columns; OpenAPI confirms contract.

**Seed field reference** (`api/data/users.json` lines 1–7):

```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```

**OpenAPI User schema** (`api/openapi.yaml` lines 286–302):

```yaml
User:
  type: object
  required:
    - id
    - name
    - email
  properties:
    id:
      type: integer
      minimum: 1
    name:
      type: string
    email:
      type: string
```

**DDL pattern to implement** (from RESEARCH.md — no codebase analog; use `CREATE TABLE IF NOT EXISTS`):

```sql
-- api/schema.sql — learners read this file directly (D-03)
CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL
);
```

**Conventions:**
- DDL only — no seed INSERTs (D-05: seed lives in `db.js` after empty-table check).
- Match learner-readable style of `users.json` (minimal, commented header OK).
- `id` is SQLite-managed via AUTOINCREMENT (D-09); drop `nextId` from schema.

---

### `api/db.js` (service, CRUD)

**Analog:** `api/index.js` persistence block (lines 7–10, 12–18, 59–89)

Extract and replace JSON read/write with `node:sqlite`. Keep env-var resolution and mkdir patterns.

**Env var + path resolution** (`api/index.js` lines 7–10):

```javascript
const DATA_DIR       = path.join(__dirname, 'data');
const DATA_FILE_PATH = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(DATA_DIR, 'users.json');
```

**Adapt to `DB_FILE`** (mirror pattern, new name per D-07/D-08):

```javascript
const DATA_DIR    = path.join(__dirname, 'data');
const DB_FILE_PATH = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'users.db');
```

**mkdir before write** (`api/index.js` lines 61–64):

```javascript
async function saveUsersData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}
```

**Adapt for sync SQLite** (RESEARCH recommends `mkdirSync` in `initDb`):

```javascript
const { readFileSync, mkdirSync } = require('fs');
const { DatabaseSync } = require('node:sqlite');

mkdirSync(DATA_DIR, { recursive: true });
db = new DatabaseSync(DB_FILE_PATH);
```

**Seed data reference** (`api/index.js` lines 12–18):

```javascript
const SEED_DATA = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};
```

**Adapt seed-on-empty** (replace JSON ENOENT/corrupt recovery — D-05):

```javascript
function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count === 0) {
    const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    insert.run('John Doe', 'john@example.com');
    insert.run('Jane Smith', 'jane@example.com');
  }
}
```

**initDb pattern** (extends `loadUsers` startup role, `api/index.js` lines 66–85):

```javascript
async function initDb() {
  mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE_PATH);
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  seedIfEmpty();
}
```

**CRUD helpers** (replace in-memory array ops — prepared statements per RESEARCH):

```javascript
async function getAllUsers() {
  return db.prepare('SELECT id, name, email FROM users ORDER BY name').all();
}

async function getUserById(id) {
  return db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id);
}

async function createUser(name, email) {
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const { lastInsertRowid } = stmt.run(name, email);
  return { id: Number(lastInsertRowid), name, email };
}

async function updateUser(id, name, email) {
  const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
  const { changes } = stmt.run(name, email, id);
  return changes === 0 ? null : { id, name, email };
}

async function deleteUser(id) {
  const user = await getUserById(id);
  if (!user) return null;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return user;
}
```

**Module exports:**

```javascript
module.exports = {
  initDb,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
```

**Conventions:**
- Async function signatures (D-02) wrapping sync `DatabaseSync` calls.
- Module-level `let db` handle — single connection per process.
- No `users.json` reads at runtime (D-06).

---

### `api/index.js` (route, request-response + CRUD)

**Analog:** `api/index.js` (self — keep routes/validation; replace persistence)

**Imports to keep** (lines 3–5):

```javascript
const express = require('express');
const cors = require('cors');
```

**Remove:** `fs/promises`, `lodash` (if sort moves to SQL), `users[]`, `nextUserId`, `SEED_DATA`, `loadUsers`, `saveUsers`, `saveUsersData`, `findUserIndexById`, `getSortedUsers`.

**Add:**

```javascript
const db = require('./db');
const { initDb, getAllUsers, getUserById, createUser, updateUser, deleteUser } = db;
```

**Validation helpers — unchanged** (lines 34–57):

```javascript
function parseUserId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateUserPayload(body) {
  const { name, email } = body;
  if (typeof name !== 'string' || name.trim() === '') {
    return 'El campo "name" es obligatorio y debe ser texto.';
  }
  if (typeof email !== 'string' || email.trim() === '') {
    return 'El campo "email" es obligatorio y debe ser texto.';
  }
  return null;
}
```

**GET /users refactor** (lines 110–112 → direct DB):

```javascript
// Before:
app.get('/users', (req, res) => {
  res.json(getSortedUsers());
});

// After:
app.get('/users', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});
```

**GET /users/:id refactor** (lines 114–128):

```javascript
app.get('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);
  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  res.json(user);
});
```

**POST /users — error handling pattern** (lines 130–156, preserve D-11 strings):

```javascript
app.post('/users', async (req, res) => {
  const validationError = validateUserPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const user = await createUser(req.body.name.trim(), req.body.email.trim());
    res.status(201).json(user);
  } catch (err) {
    console.error('[error] createUser() falló en POST /users:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
});
```

**PUT /users/:id — 404 then write** (lines 158–193, simplified — no in-memory rollback):

```javascript
app.put('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);
  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }
  const validationError = validateUserPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  const existing = await getUserById(userId);
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  try {
    const user = await updateUser(userId, req.body.name.trim(), req.body.email.trim());
    res.json(user);
  } catch (err) {
    console.error('[error] updateUser() falló en PUT /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
});
```

**DELETE /users/:id** (lines 195–219, same contract):

```javascript
app.delete('/users/:id', async (req, res) => {
  const userId = parseUserId(req.params.id);
  if (userId === null) {
    return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
  }
  try {
    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ message: 'Usuario eliminado correctamente.', user: deletedUser });
  } catch (err) {
    console.error('[error] deleteUser() falló en DELETE /users/:id:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }
});
```

**Module export + startup** (lines 249–265):

```javascript
module.exports = app;
module.exports.initDb = initDb;

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

**Conventions:**
- Non-user routes (`/`, `/health`, `/about`, `/time`) and error middleware unchanged.
- Spanish error strings verbatim (D-11).
- `startServer()` awaits DB init before `listen` (same async startup as current `loadUsers`).

---

### `api/index.test.js` (test, CRUD)

**Analog:** `api/index.test.js` (self — swap env var and fixture mechanism)

**Env-before-require pattern** (lines 4–16):

```javascript
// CRÍTICO: DATA_FILE debe asignarse ANTES del require de index.js.
// Node.js cachea módulos en el primer require — si index.js se importa antes
// de setear la variable, DATA_FILE_PATH quedará con el valor por defecto.

const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;

const app = require('./index.js');
```

**Adapt to `DB_FILE`** (D-08 — do not reuse `DATA_FILE`):

```javascript
// CRÍTICO: DB_FILE debe asignarse ANTES del require de index.js.

const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;

const app = require('./index.js');
```

**beforeEach/afterEach pattern** (lines 29–39):

```javascript
beforeEach(async () => {
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();
});

afterEach(async () => {
  await unlink(TEST_FILE).catch(() => {});
});
```

**Adapt — delete DB + initDb** (RESEARCH Pattern 5):

```javascript
beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});
```

**Remove:** `TEST_SEED` object, `writeFile` import (keep `unlink`).

**Seed parity** — `initDb()` seed-on-empty produces John (id=1) and Jane (id=2); POST test expects id=3 via AUTOINCREMENT. Existing assertions unchanged (lines 57–156).

**Conventions:**
- AAA comments and `describe`/`it` structure unchanged.
- All 12 tests must pass without JSON fixtures (Phase 7 deepens isolation).

---

### `api/.dockerignore` (config, file-I/O)

**Analog:** `api/.dockerignore` line 38

**Existing exclusion** (line 38):

```
data/users.json
```

**Add alongside** (RESEARCH Pattern — ephemeral DB in container):

```
data/users.db
data/*.db
```

**Rationale** (`docs/12-docker.md` lines 75–84): excluded runtime data → fresh seed on each container start. Same lesson as JSON; Phase 8 docs update deferred.

---

### `api/Dockerfile` (config, file-I/O)

**Analog:** `api/Dockerfile` lines 15–17

**Existing data/ pattern** (lines 15–17):

```dockerfile
# data/ debe ser escribible por node: loadUsers() crea users.json al arrancar
# (excluido del contexto por .dockerignore — comportamiento efímero correcto).
RUN mkdir -p data && chown -R node:node /usr/src/app
```

**Comment update only** (no structural change):

```dockerfile
# data/ debe ser escribible por node: initDb() crea users.db al arrancar
# (excluido del contexto por .dockerignore — comportamiento efímero correcto).
RUN mkdir -p data && chown -R node:node /usr/src/app
```

**Conventions:**
- Keep `node:22-alpine`, `USER node`, `ENV PORT=3100`, `CMD ["node", "index.js"]` unchanged.
- `mkdir -p data && chown` already satisfies SQLite write permissions (RESEARCH Pitfall 3).

---

## Shared Patterns

### Environment variable resolution

**Source:** `api/index.js` lines 7–10
**Apply to:** `api/db.js` (`DB_FILE`), `api/index.test.js` (test isolation)

```javascript
const DATA_DIR = path.join(__dirname, 'data');
const FILE_PATH = process.env.VAR_NAME
  ? path.resolve(process.env.VAR_NAME)
  : path.join(DATA_DIR, 'default-filename');
```

### Async startup before listen

**Source:** `api/index.js` lines 253–257
**Apply to:** `api/index.js` — swap `loadUsers()` → `initDb()`

```javascript
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}
```

### Test module export for harness

**Source:** `api/index.js` lines 249–251
**Apply to:** `api/index.js` — replace `loadUsers` with `initDb`

```javascript
module.exports = app;
module.exports.initDb = initDb;
```

### Spanish error messages in route handlers

**Source:** `api/index.js` lines 48–54, 118, 124, 152, 189, 215
**Apply to:** All user route handlers — strings locked by D-11

```javascript
return res.status(400).json({ error: 'El campo "name" es obligatorio y debe ser texto.' });
return res.status(404).json({ error: 'Usuario no encontrado.' });
return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
```

### Write-error catch in mutating routes

**Source:** `api/index.js` lines 146–153 (POST rollback pattern)
**Apply to:** POST/PUT/DELETE — adapt D-12: no in-memory revert; catch DB throw → 500

```javascript
try {
  // DB write
} catch (err) {
  console.error('[error] <helper>() falló en <METHOD> <path>:', err.message);
  return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
}
```

### Ephemeral runtime data in Docker

**Source:** `api/.dockerignore` line 38 + `docs/12-docker.md` lines 75–84
**Apply to:** `.dockerignore`, Dockerfile comments

Exclude runtime store from build context; `initDb()` seeds John/Jane on empty DB at container start.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All Phase 6 files have codebase analogs or RESEARCH-verified patterns |

**Note:** `api/schema.sql` has no SQL predecessor; field mapping comes from `users.json` + OpenAPI User schema (partial analog).

---

## Metadata

**Analog search scope:** `api/`, `docs/`, `.planning/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-30

## PATTERN MAPPING COMPLETE

**Phase:** 6 - SQLite Persistence Layer
**Files classified:** 6
**Analogs found:** 6 / 6

### Coverage
- Files with exact analog: 5 (`db.js`, `index.js`, `index.test.js`, `.dockerignore`, `Dockerfile`)
- Files with partial analog: 1 (`schema.sql` — fields from JSON/OpenAPI, DDL from RESEARCH)
- Files with no analog: 0

### Key Patterns Identified
- Persistence extraction: move `loadUsers`/`saveUsers`/`SEED_DATA` logic from `index.js` into `db.js` with same env-var + mkdir conventions.
- Routes stay thin: validation helpers unchanged; mutating handlers call `db.*` with existing Spanish 500 strings.
- Tests: `DB_FILE` before `require`, `unlink` + `initDb()` replaces JSON fixture + `loadUsers()`.
- Docker: mirror `data/users.json` exclusion for `users.db`; comment-only Dockerfile update.

### File Created
`.planning/phases/06-sqlite-persistence-layer/06-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can now reference analog patterns in PLAN.md files.
