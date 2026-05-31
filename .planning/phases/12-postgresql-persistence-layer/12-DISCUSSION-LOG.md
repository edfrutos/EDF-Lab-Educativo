# Phase 12 Discussion Log

**Date:** 2026-05-31  
**Mode:** auto (user selected "Tú decides")

## Areas presented

1. Arquitectura del adapter DB
2. Esquema SQL
3. Servicio Postgres en Compose
4. Coexistencia SQLite + Postgres en Compose

## User selection

- **Gray areas:** Tú decides (recomendado) — all areas resolved with lab defaults

## Decisions captured

| Area | Decision |
|------|----------|
| Adapter | `db-sqlite.js` + `db-pg.js` + `db.js` router via `DATABASE_URL` |
| Schema | Separate `schema.pg.sql` (SERIAL); keep `schema.sql` for SQLite |
| Compose | `edf-lab-postgres`, `postgres:16-alpine`, named volume, healthcheck |
| Coexistence | SQLite default without env; bind mount kept for `users.json` only |
| Boundary | No PG seed migration in Phase 12 — Phase 13 |

## Output

- `12-CONTEXT.md` — ready for `/gsd-plan-phase 12`
