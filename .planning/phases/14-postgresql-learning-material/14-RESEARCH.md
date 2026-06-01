# Phase 14 Research: PostgreSQL Learning Material

**Researched:** 2026-06-01
**Phase:** 14-postgresql-learning-material
**Focus:** doc 15, Mission 12, index/README, NOTEBOOK — close v1.3 milestone

## Summary

Phase 14 is **documentation-only**, mirroring **Phase 11** (Compose docs) + **Phase 8** (SQLite doc/mission). All runtime behavior exists from Phases 12–13; planners must not re-implement code.

## Key Findings

### 1. docs/15-postgresql.md structure (PGDOCS-01)

Mirror `docs/13-sqlite.md` sections:

| Section | Content |
|---------|---------|
| Intro | Client-server DB vs SQLite file; when `DATABASE_URL` activates Postgres |
| Connection string | Compose URL; host `psql` examples |
| Schema | `schema.pg.sql` excerpt; SERIAL vs AUTOINCREMENT |
| Code path | `db.js` router → `db-pg.js`; `seed.js` + setval |
| Inspection | `psql` queries on `edf_lab` |
| Compose | Link to updated doc 14; named volume persistence |
| Tests | `test:db:prepare`, dual `npm test` |
| Enlaces | Mission 12, doc 13, doc 14 |

### 2. docs/14-docker-compose.md updates (D-02)

Current doc describes **2 services** and SQLite bind mount only. Must add:

- `edf-lab-postgres` service block
- `volumes: postgres_data`
- API `environment: DATABASE_URL`
- `depends_on` with healthcheck
- Architecture diagram: API → Postgres container (not only host users.db)
- Note: bind mount `./api/data` still for `users.json`; runtime store is Postgres when in Compose

### 3. Mission 12 (PGDOCS-02)

Parallel to Mission 11 but:

- `npm run compose:up` → 3 containers healthy
- CRUD via dashboard
- `psql` instead of `sqlite3` for verification
- `compose down/up` → user persists in **Postgres volume** (not `api/data/users.db` for runtime data)

### 4. PGDOCS-03 vs Phase 13

Phase 13 added «Hacia PostgreSQL» with table + commands. Phase 14 adds:

- Prominent link: «Capítulo completo: [15-postgresql.md](...)»
- Optional one-line in doc intro pointing forward

### 5. NOTEBOOK (PGDOCS-05)

Candidates from integration work:

- Postgres connection refused / Docker not running
- Tests fail: need `test:db:prepare` + postgres up
- `DATABASE_URL` set in shell breaks SQLite `npm run test:sqlite`
- Port 5432 already in use (local Homebrew PG)

### 6. Index numbering

Add item **15** in reading order after 14-docker-compose: `15-postgresql.md`. Mission 12 under prácticas or avanzadas (Postgres is advanced optional like Compose).

## Suggested plans

| Plan | Requirements | Delivers |
|------|--------------|----------|
| 14-01 | PGDOCS-01, PGDOCS-03, partial 04 | doc 15, update doc 14, doc 13 link, glossary |
| 14-02 | PGDOCS-02, PGDOCS-04, PGDOCS-05 | Mission 12, index, README, api/README, NOTEBOOK, Mission 11 note |

---

## RESEARCH COMPLETE
