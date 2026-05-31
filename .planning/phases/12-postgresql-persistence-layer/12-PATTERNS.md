# Phase 12 Pattern Map

**Mapped:** 2026-05-31

## New Files → Closest Analogs

| New file | Analog | Pattern to reuse |
|----------|--------|------------------|
| `api/db-sqlite.js` | `api/db.js` (current) | Move verbatim; keep `populateIfEmpty`, `DB_FILE`, `node:sqlite` |
| `api/db-pg.js` | `api/db.js` (CRUD shape) | Same function signatures; swap `?` → `$1`; Pool instead of DatabaseSync |
| `api/db.js` | — (new router) | `DATABASE_URL` → `./db-pg`, else → `./db-sqlite`; re-export API |
| `api/schema.pg.sql` | `api/schema.sql` | Same columns; SERIAL instead of AUTOINCREMENT |

## Existing Assets

- `api/db.js` — source for extraction (174 lines, full CRUD + seed)
- `api/schema.sql` — column contract for `schema.pg.sql`
- `api/index.js` — imports `./db` only; `initDb()` at startup
- `docker-compose.yml` — extend with third service + named volume
- `api/Dockerfile` — unchanged; `npm ci` picks up `pg`

## Integration Points

```
index.js → db.js (router)
              ├── DATABASE_URL set → db-pg.js → pg Pool → PostgreSQL
              └── unset → db-sqlite.js → node:sqlite → users.db

docker-compose.yml
  ├── edf-lab-postgres (postgres:16-alpine, named volume)
  ├── edf-lab-api (DATABASE_URL, depends_on healthy postgres, bind mount ./api/data)
  └── edf-lab-dashboard (unchanged)
```

## Code Excerpt — Router target (db.js)

```javascript
const backend = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

module.exports = {
  DuplicateEmailError: backend.DuplicateEmailError,
  initDb: backend.initDb,
  getAllUsers: backend.getAllUsers,
  // ... same exports
};
```

## Code Excerpt — Postgres createUser target

```javascript
const result = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
  [name, email]
);
return result.rows[0];
```

---

## PATTERN MAPPING COMPLETE
