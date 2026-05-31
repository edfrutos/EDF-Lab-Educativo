# Phase 12 Research: PostgreSQL Persistence Layer

**Researched:** 2026-05-31
**Phase:** 12-postgresql-persistence-layer
**Focus:** Dual SQLite/Postgres adapter, `pg` Pool, schema.pg.sql, Compose postgres service

## Summary

Phase 12 adds PostgreSQL as an **optional** runtime backend selected by `DATABASE_URL`, mirroring the Phase 6 SQLite layer without breaking host `npm start`. The implementation splits `api/db.js` into `db-sqlite.js` (extract current code) + `db-pg.js` (new) + `db.js` (router). Compose gains a third service with a **named volume** — intentional contrast with SQLite's **bind mount** on `./api/data`.

JSON seed / `populateIfEmpty` for Postgres is **deferred to Phase 13** (D-16). Phase 12 verification uses empty Postgres + manual CRUD via dashboard or curl.

## Key Findings

### 1. Adapter routing (D-01, D-02)

| Signal | Backend | Module |
|--------|---------|--------|
| `DATABASE_URL` unset | SQLite (default) | `db-sqlite.js` |
| `DATABASE_URL` set | PostgreSQL | `db-pg.js` |

`db.js` exports the same surface: `initDb`, CRUD functions, `DuplicateEmailError`. `index.js` imports only `./db` — no route changes for PGSQL-04.

Startup log recommendation: `console.log('[db] Using SQLite')` or `[db] Using PostgreSQL'` for learner visibility.

### 2. `pg` Pool pattern (D-03, PGSQL-02)

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

- One `Pool` per process; default max 10 connections is fine for lab API
- All queries use `$1`, `$2` placeholders — never string concatenation
- `initDb`: `pool.query(schemaSql)` then return (no seed in Phase 12)
- `initDb` re-entry (tests): `await pool.end()` before creating new pool (mirror SQLite `db.close()`)

### 3. schema.pg.sql (D-04, PGSQL-03)

SQLite equivalent:

```sql
CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

Postgres:

```sql
CREATE TABLE IF NOT EXISTS users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

Apply via `readFileSync('schema.pg.sql')` + `pool.query()` in `initDb`.

### 4. CRUD mapping (PGSQL-04)

| Function | SQLite | PostgreSQL |
|----------|--------|------------|
| getAllUsers | `ORDER BY name` | `ORDER BY name` |
| getUserById | `WHERE id = ?` | `WHERE id = $1` |
| createUser | `lastInsertRowid` | `INSERT ... RETURNING id, name, email` |
| updateUser | `changes === 0` → null | `rowCount === 0` → null |
| deleteUser | fetch then delete | same pattern |

### 5. DuplicateEmailError (D-06)

Postgres unique violation: `err.code === '23505'` → throw `DuplicateEmailError` (409 unchanged in routes).

SQLite keeps existing `SQLITE_CONSTRAINT_UNIQUE` check in `db-sqlite.js`.

### 6. Compose postgres service (D-07–D-12)

```yaml
edf-lab-postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: edf_lab
    POSTGRES_PASSWORD: edf_lab_dev
    POSTGRES_DB: edf_lab
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U edf_lab -d edf_lab"]
    interval: 5s
    timeout: 5s
    retries: 5

edf-lab-api:
  environment:
    DATABASE_URL: postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
  depends_on:
    edf-lab-postgres:
      condition: service_healthy
  volumes:
    - ./api/data:/usr/src/app/data   # kept for users.json; not runtime store in PG mode
```

Top-level volumes block:

```yaml
volumes:
  postgres_data:
```

**Teaching contrast:** SQLite data → bind mount (host-visible file); Postgres data → named volume (Docker-managed).

### 7. Test suite impact (Phase 12 boundary)

`api/index.test.js` sets `DB_FILE` before require — no `DATABASE_URL`. Tests continue on SQLite unchanged (PGSQL-05). Postgres test matrix is Phase 13 (PGTEST-*).

### 8. Dependencies

Add `pg` to `api/package.json` dependencies. First npm DB driver — document trade-off vs `node:sqlite` built-in.

Run `npm install` in `api/` to update `package-lock.json`.

## Risks

| Risk | Mitigation |
|------|------------|
| API starts before Postgres ready | `depends_on` + `service_healthy` healthcheck |
| Port 5432 conflict with local Postgres | Document stop host PG or change host port in summary |
| Empty Postgres on first compose up | Expected in Phase 12; seed in Phase 13 |
| `pg` native bindings on Alpine | `postgres:16-alpine` + `node:22-alpine` both use musl; `pg` is pure JS — no native compile issue |

## Verification Commands (Plan 12-03)

```bash
docker compose down
docker compose up --build -d
curl -sf http://localhost:3100/health
curl -sf http://localhost:3100/users
curl -X POST http://localhost:3100/users -H 'Content-Type: application/json' \
  -d '{"name":"PG Test","email":"pgtest@example.com"}'
docker compose down && docker compose up -d
curl -sf http://localhost:3100/users | grep pgtest
```

Host SQLite path:

```bash
cd api && npm start   # no DATABASE_URL → SQLite
curl -sf http://localhost:3000/users
```

---

## RESEARCH COMPLETE
