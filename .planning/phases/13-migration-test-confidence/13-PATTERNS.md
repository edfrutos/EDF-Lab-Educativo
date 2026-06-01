# Phase 13 Pattern Map

**Mapped:** 2026-06-01

## New Files → Closest Analogs

| New file | Analog | Pattern to reuse |
|----------|--------|------------------|
| `api/seed.js` | `populateIfEmpty` in `db-sqlite.js` | Extract shared; same logs |
| `api/scripts/prepare-test-db.js` | Phase 10 root `compose:*` scripts | Small Node script, exit codes |
| `api/index.pg.test.js` | `api/index.test.js` | Env-before-require; beforeEach reset |

## Existing Assets

- `api/db-sqlite.js` — seed logic to move to `seed.js`
- `api/db-pg.js` — add `populateIfEmptyPg` after schema
- `api/index.test.js` — 16 tests; copy structure for PG file
- `package.json` (root) — `compose:*` → mirror with `test`, `test:pg`, `test:db:prepare`
- `docs/13-sqlite.md` — append «Hacia PostgreSQL» section

## Integration Points

```txt
seed.js
  ├── populateIfEmptySqlite(getDb) ← db-sqlite.initDb
  └── populateIfEmptyPg(pool)      ← db-pg.initDb (+ setval)

npm test (api/)
  ├── node --test index.test.js      (DB_FILE, delete DATABASE_URL)
  └── node --test index.pg.test.js   (DATABASE_URL → edf_lab_test)
```

---

## PATTERN MAPPING COMPLETE
