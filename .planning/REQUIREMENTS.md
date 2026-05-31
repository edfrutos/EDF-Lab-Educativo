# Requirements: EDF Lab Educativo

**Defined:** 2026-05-31
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.3 Requirements

Requirements for the PostgreSQL Persistence milestone. Each maps to roadmap phases (starting at Phase 12).

### PostgreSQL Persistence

- [ ] **PGSQL-01**: API stores users in PostgreSQL when `DATABASE_URL` is configured (runtime store).
- [ ] **PGSQL-02**: API uses the `pg` npm package with parameterized queries (no string concatenation).
- [ ] **PGSQL-03**: PostgreSQL schema defines a `users` table with `id`, `name`, and `email` (UNIQUE) matching the SQLite contract.
- [ ] **PGSQL-04**: All existing CRUD endpoints behave identically from the dashboard's perspective (same JSON, same HTTP codes).
- [ ] **PGSQL-05**: SQLite remains the default when `DATABASE_URL` is unset — host `npm start` path unchanged.

### Compose Integration

- [ ] **PGCOMPOSE-01**: `docker-compose.yml` adds a `postgres` service with a named volume for data persistence.
- [ ] **PGCOMPOSE-02**: API service connects to Postgres via `DATABASE_URL` when running under Compose.
- [ ] **PGCOMPOSE-03**: Learner can start the full stack (API + dashboard + Postgres) with `npm run compose:up`.

### Migration & Tests

- [ ] **PGMIG-01**: Empty Postgres database is seeded/migrated from `users.json` (or documented seed) on first startup.
- [ ] **PGMIG-02**: Documentation explains when SQLite is enough vs when PostgreSQL is appropriate in this lab.
- [ ] **PGTEST-01**: All 16 existing API tests pass against a PostgreSQL test database.
- [ ] **PGTEST-02**: Tests use an isolated database (separate URL or schema) — no cross-test contamination.
- [ ] **PGTEST-03**: Tests cover duplicate email (409), empty DB, and invalid ID edge cases against Postgres.

### Learning Documentation

- [ ] **PGDOCS-01**: New doc explains PostgreSQL concepts (connection string, schema, queries) with executable examples for this lab.
- [ ] **PGDOCS-02**: New mission guides learners through Compose + Postgres, CRUD, restart, and persistence verification.
- [ ] **PGDOCS-03**: `docs/13-sqlite.md` updated with SQLite → PostgreSQL evolution pointer.
- [ ] **PGDOCS-04**: `docs/00-indice.md`, `README.md`, and `api/README.md` updated with Postgres path and commands.
- [ ] **PGDOCS-05**: Relevant real errors during PostgreSQL integration recorded in `NOTEBOOK.md`.

## v1.4 Requirements

Deferred to future release. Tracked but not in the current roadmap.

### Frameworks

- **FRWK-01**: Introduce a frontend framework comparison after Postgres milestone.
- **FRWK-02**: Compare framework-based state and forms against vanilla implementation.

### Production

- **PROD-01**: Authentication when a learning phase explicitly teaches auth.
- **PROD-02**: Production deployment hardening (TLS, secrets management).

## Out of Scope

Explicitly excluded from v1.3. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Removing SQLite entirely | Host dev must stay low-friction; Postgres is additive |
| ORM (Prisma, Sequelize, TypeORM) | Raw SQL + `pg` keeps the database layer transparent |
| Frontend framework migration | Vanilla dashboard remains inspectable |
| Production auth / JWT hardening | Auth is a separate learning phase |
| Connection pooling libraries beyond `pg` Pool | Single-process lab API; keep deps minimal |
| Kubernetes / managed cloud Postgres | Compose + local Postgres is the teaching target |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PGSQL-01 | Phase 12 | Pending |
| PGSQL-02 | Phase 12 | Pending |
| PGSQL-03 | Phase 12 | Pending |
| PGSQL-04 | Phase 12 | Pending |
| PGSQL-05 | Phase 12 | Pending |
| PGCOMPOSE-01 | Phase 12 | Pending |
| PGCOMPOSE-02 | Phase 12 | Pending |
| PGCOMPOSE-03 | Phase 12 | Pending |
| PGMIG-01 | Phase 13 | Pending |
| PGMIG-02 | Phase 13 | Pending |
| PGTEST-01 | Phase 13 | Pending |
| PGTEST-02 | Phase 13 | Pending |
| PGTEST-03 | Phase 13 | Pending |
| PGDOCS-01 | Phase 14 | Pending |
| PGDOCS-02 | Phase 14 | Pending |
| PGDOCS-03 | Phase 14 | Pending |
| PGDOCS-04 | Phase 14 | Pending |
| PGDOCS-05 | Phase 14 | Pending |

**Coverage:**
- v1.3 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 after v1.3 roadmap creation*
