---
phase: 18-auth-api-protected-routes
plan: 01
status: complete
completed: 2026-06-01
requirements:
  - AUTH-01
  - AUTH-02
---

# Plan 18-01 Summary

## What Was Built

- Tabla `accounts` en `schema.sql` y `schema.pg.sql` (email UNIQUE, password_hash).
- `seedAdminIfEmptyAccounts` en `seed.js` — bcrypt cost 10, defaults `admin@lab.local` / `changeme`.
- `countAccounts`, `findAccountByEmail`, `insertAccount` en `db-sqlite.js` y `db-pg.js`; seed en `initDb`.
- Dependencias: `bcrypt`, `jsonwebtoken`, `cookie-parser`.

## Key Files

- `api/schema.sql`, `api/schema.pg.sql`
- `api/seed.js`, `api/db-sqlite.js`, `api/db-pg.js`
- `api/package.json`, `api/package-lock.json`

## Verification

- Smoke: `findAccountByEmail('admin@lab.local')` tras `initDb` — OK
- `npm run test:sqlite` — 16/16 pass (sin middleware auth aún)
- `node --check` en archivos modificados — OK

## Notes for 18-02

- `auth.js` debe importar `findAccountByEmail` del backend activo (`db-sqlite` o `db-pg` según `DATABASE_URL`).
- `index.js` sin cambios en esta ola — CRUD sigue abierto hasta plan 02.
