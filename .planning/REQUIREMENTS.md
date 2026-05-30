# Requirements: EDF Lab Educativo

**Defined:** 2026-05-30
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.1 Requirements

Requirements for the SQLite Persistence milestone. Each maps to roadmap phases (starting at Phase 6).

### SQLite Persistence

- [ ] **SQLITE-01**: API stores users in a SQLite database file instead of `data/users.json` as the primary store.
- [ ] **SQLITE-02**: API uses `node:sqlite` (Node 22 built-in) with zero new npm dependencies for database access.
- [ ] **SQLITE-03**: Explicit SQL schema defines a `users` table with `id`, `name`, and `email` columns.
- [ ] **SQLITE-04**: All existing CRUD endpoints (`GET/POST/PUT/DELETE /users`) behave identically from the dashboard's perspective.
- [ ] **SQLITE-05**: Database file path is configurable via environment variable (similar to `DATA_FILE` pattern).

### Migration

- [ ] **MIG-01**: Learner can migrate existing seed data from `users.json` into SQLite on first startup or via a documented script.
- [ ] **MIG-02**: Documentation explains when JSON file persistence is enough vs when SQLite is appropriate.
- [ ] **MIG-03**: `users.json` is retained as seed/migration source, not as the runtime store.

### API Tests

- [ ] **TEST-01**: All 12 existing API tests pass against the SQLite-backed store.
- [ ] **TEST-02**: Tests use an isolated SQLite database file per test run (no cross-test contamination).
- [ ] **TEST-03**: Tests cover edge cases: empty database, duplicate email validation, invalid ID handling.

### Learning Documentation

- [ ] **DOCS-01**: New doc explains SQLite concepts (schema, queries, `.db` file) with executable examples.
- [ ] **DOCS-02**: New mission guides learners through inspecting the database, running migration, and verifying persistence across restarts.
- [ ] **DOCS-03**: Doc section compares `node:sqlite` vs `better-sqlite3` with trade-offs (deps, sync/async, production use).
- [ ] **DOCS-04**: `docs/00-indice.md` updated with new doc and mission entries.
- [ ] **DOCS-05**: Relevant real errors during SQLite integration recorded in `NOTEBOOK.md`.

## v1.2 Requirements

Deferred to future release. Tracked but not in the current roadmap.

### Infrastructure

- **INFRA-01**: Docker Compose orchestrates API + dashboard containers.
- **INFRA-02**: SQLite volume mount documented for Docker persistence.

### Frameworks

- **FRWK-01**: Introduce a frontend framework comparison after SQLite milestone.
- **FRWK-02**: Compare framework-based state and forms against vanilla implementation.

### Production

- **PROD-01**: Authentication when a learning phase explicitly teaches auth.
- **PROD-02**: PostgreSQL as next step after SQLite relational concepts are solid.

## Out of Scope

Explicitly excluded from v1.1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Implementing `better-sqlite3` in production code | v1.1 uses `node:sqlite`; comparison is documentary only |
| PostgreSQL | SQLite teaches relational persistence first |
| Dashboard changes | API contract unchanged; frontend keeps working as-is |
| ORM (Sequelize, Prisma, Drizzle) | Raw SQL teaches the database layer transparently |
| Authentication | Not needed for the beginner data-flow lab |
| Docker Compose | Deferred to v1.2 after SQLite layer is stable |
| Frontend frameworks | Vanilla flow must remain inspectable through SQLite milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| *(populated by roadmapper)* | | |

**Coverage:**
- v1.1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 ⚠️

---
*Requirements defined: 2026-05-30*
*Last updated: 2026-05-30 after v1.1 milestone definition*
