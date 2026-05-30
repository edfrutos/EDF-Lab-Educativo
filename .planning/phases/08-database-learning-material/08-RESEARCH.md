# Phase 8 Research: Database Learning Material

**Researched:** 2026-05-30

## RESEARCH COMPLETE

### Patterns to follow

- **Doc tone:** Match `docs/12-docker.md` — short sections, ASCII diagrams, executable bash blocks, Spanish.
- **Mission template:** `missions/09-arrancar-con-docker.md` — objetivo, pasos, resultado esperado, reto extra.
- **NOTEBOOK format:** Dated sections with Contexto, Síntoma, Causa, Solución, Aprendizaje.

### Implementation facts (must match code)

- Runtime store: `api/data/users.db` via `node:sqlite` (`DatabaseSync` in `api/db.js`).
- Seed/migration: `api/data/users.json` read only when `users` table is empty.
- Log: `Migrados N usuarios desde users.json`.
- Schema: `api/schema.sql` with `email TEXT NOT NULL UNIQUE`.
- Env: `DB_FILE` overrides DB path (tests use `users.test.db`).
- 409 on duplicate email: `Ya existe un usuario con ese email.`

### Driver comparison (documentary)

| | node:sqlite | better-sqlite3 |
|---|-------------|----------------|
| Install | Built-in Node 22+ | npm native addon |
| API style | Sync in this lab (`DatabaseSync`) | Sync |
| Deps | Zero | Requires build tools for native module |
| Production | Experimental in Node | Widely used |
| This lab | ✓ chosen | Comparison only |

### Inspection tooling

- Primary: `sqlite3` CLI (`sqlite3 api/data/users.db "SELECT * FROM users;"`).
- Optional GUI: DB Browser for SQLite — one paragraph, not required.

### Stale docs to update

- `docs/08-memoria-vs-persistencia.md` — still describes JSON as runtime store with `saveUsers()`.
- `missions/06-restart-y-persistencia.md` — uses `cat users.json` verification.
