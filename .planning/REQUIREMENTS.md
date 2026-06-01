# Requirements: EDF Lab Educativo

**Defined:** 2026-05-31
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.3 Requirements

Requirements for the PostgreSQL Persistence milestone. Each maps to roadmap phases (starting at Phase 12).

### PostgreSQL Persistence

- [x] **PGSQL-01**: API stores users in PostgreSQL when `DATABASE_URL` is configured (runtime store).
- [x] **PGSQL-02**: API uses the `pg` npm package with parameterized queries (no string concatenation).
- [x] **PGSQL-03**: PostgreSQL schema defines a `users` table with `id`, `name`, and `email` (UNIQUE) matching the SQLite contract.
- [x] **PGSQL-04**: All existing CRUD endpoints behave identically from the dashboard's perspective (same JSON, same HTTP codes).
- [x] **PGSQL-05**: SQLite remains the default when `DATABASE_URL` is unset — host `npm start` path unchanged.

### Compose Integration

- [x] **PGCOMPOSE-01**: `docker-compose.yml` adds a `postgres` service with a named volume for data persistence.
- [x] **PGCOMPOSE-02**: API service connects to Postgres via `DATABASE_URL` when running under Compose.
- [x] **PGCOMPOSE-03**: Learner can start the full stack (API + dashboard + Postgres) with `npm run compose:up`.

### Migration & Tests

- [x] **PGMIG-01**: Empty Postgres database is seeded/migrated from `users.json` (or documented seed) on first startup.
- [x] **PGMIG-02**: Documentation explains when SQLite is enough vs when PostgreSQL is appropriate in this lab.
- [x] **PGTEST-01**: All 16 existing API tests pass against a PostgreSQL test database.
- [x] **PGTEST-02**: Tests use an isolated database (separate URL or schema) — no cross-test contamination.
- [x] **PGTEST-03**: Tests cover duplicate email (409), empty DB, and invalid ID edge cases against Postgres.

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
| PGSQL-01 | Phase 12 | Complete |
| PGSQL-02 | Phase 12 | Complete |
| PGSQL-03 | Phase 12 | Complete |
| PGSQL-04 | Phase 12 | Complete |
| PGSQL-05 | Phase 12 | Complete |
| PGCOMPOSE-01 | Phase 12 | Complete |
| PGCOMPOSE-02 | Phase 12 | Complete |
| PGCOMPOSE-03 | Phase 12 | Complete |
| PGMIG-01 | Phase 13 | Complete |
| PGMIG-02 | Phase 13 | Complete |
| PGTEST-01 | Phase 13 | Complete |
| PGTEST-02 | Phase 13 | Complete |
| PGTEST-03 | Phase 13 | Complete |
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
