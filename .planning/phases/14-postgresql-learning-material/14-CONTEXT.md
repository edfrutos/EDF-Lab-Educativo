# Phase 14: PostgreSQL Learning Material - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Mode:** derived from ROADMAP + REQUIREMENTS (no separate discuss-phase)

<domain>
## Phase Boundary

Complete v1.3 learning material: **`docs/15-postgresql.md`**, **Mission 12**, index/README updates, SQLite doc evolution pointer, and **NOTEBOOK** entries for Postgres integration errors. **No** new API features, dashboard changes, or ORM.

</domain>

<decisions>
## Implementation Decisions

### Documentation (PGDOCS-01, PGDOCS-03, PGDOCS-04)
- **D-01:** Create **`docs/15-postgresql.md`** — connection string, `schema.pg.sql`, `db-pg.js` / `seed.js`, `psql` examples, `DATABASE_URL`, contrast with SQLite; Spanish tone matching `docs/13-sqlite.md`.
- **D-02:** Update **`docs/14-docker-compose.md`** for **three-service stack** (postgres + api + dashboard); named volume `postgres_data`; API uses Postgres via `DATABASE_URL` (not SQLite-only narrative).
- **D-03:** Enhance **`docs/13-sqlite.md`** — explicit prominent link to doc 15 from «Hacia PostgreSQL» (PGDOCS-03; section exists from Phase 13).
- **D-04:** Update **`docs/00-indice.md`**, root **`README.md`**, **`api/README.md`** with Postgres path, `compose:up`, `test:db:prepare`, links to doc 15 and Mission 12.
- **D-05:** Add glossary entries in **`docs/09-glosario.md`** for PostgreSQL, `DATABASE_URL`, named volume (if missing).

### Mission (PGDOCS-02)
- **D-06:** Create **`missions/12-postgres-compose-crud.md`** — Compose up (3 services), dashboard CRUD, `psql` inspect, down/up persistence on **Postgres named volume** (not sqlite3 on host).
- **D-07:** Update **`missions/11-arrancar-con-compose.md`** with short v1.3 note: full stack now includes Postgres; Mission 12 for PG persistence path.

### NOTEBOOK (PGDOCS-05)
- **D-08:** Add **`NOTEBOOK.md`** section for Postgres integration: connection refused, `edf_lab` vs `edf_lab_test`, pg_isready / startup race, port 5432 conflict — document real errors from phases 12–13 or standard lab failures.

### Out of scope (locked)
- **D-09:** No dashboard code changes; no new npm dependencies; no removing SQLite.
- **D-10:** No production deployment / managed cloud Postgres docs.

### Claude's Discretion
- Exact doc 15 section order; NOTEBOOK entry count; whether Mission 12 filename is `12-postgres-compose-crud.md` or `12-arrancar-con-postgres.md`.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 14 success criteria, PGDOCS-*
- `.planning/REQUIREMENTS.md` — PGDOCS-01…05
- `docs/13-sqlite.md` — «Hacia PostgreSQL» (Phase 13)
- `docs/14-docker-compose.md` — update for 3 services
- `docker-compose.yml` — edf-lab-postgres, DATABASE_URL
- `api/db-pg.js`, `api/seed.js`, `api/schema.pg.sql`
- `missions/11-arrancar-con-compose.md` — template for Mission 12
- `.planning/phases/11-compose-learning-material/11-01-PLAN.md` — doc/mission pattern

</canonical_refs>

<deferred>
## Deferred Ideas

- v1.4 frameworks milestone
- nginx reverse proxy implementation (remains doc-only reto)

</deferred>

---

*Phase: 14-postgresql-learning-material*
*Context gathered: 2026-06-01*
