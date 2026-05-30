# Roadmap: EDF Lab Educativo

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- 🚧 **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)

## Phases

<details>
<summary>✅ v1.0 Educational Lab MVP (Phases 1–5) — SHIPPED 2026-05-30</summary>

- [x] **Phase 1: Dashboard CRUD Flow** — Make create, edit, and delete visible from the browser (3/3 plans) — completed 2026-05-26
- [x] **Phase 2: File Persistence** — Teach memory vs persistence with `data/users.json` (3/3 plans) — completed 2026-05-28
- [x] **Phase 3: API Tests and Quality Fixes** — Automated API confidence and low-risk debt (3/3 plans) — completed 2026-05-28
- [x] **Phase 4: Learning Material Hardening** — Glossary and aligned docs/missions (2/2 plans) — completed 2026-05-28
- [x] **Phase 5: Advanced Contracts and Containers** — OpenAPI and Docker as advanced topics (2/2 plans) — completed 2026-05-29

</details>

### ✅ v1.1 SQLite Persistence (Phases 6–8) — SHIPPED 2026-05-30

**Milestone Goal:** Teach the evolution from JSON file persistence to SQLite, keeping the backend → JSON → dashboard flow intact and observable.

- [x] **Phase 6: SQLite Persistence Layer** — Replace `users.json` runtime store with `node:sqlite` and explicit SQL schema
- [x] **Phase 7: Migration & Test Confidence** — JSON→SQLite migration path and SQLite-backed test suite
- [x] **Phase 8: Database Learning Material** — Docs, mission, driver comparison, and NOTEBOOK entries for SQLite

## Phase Details

### Phase 6: SQLite Persistence Layer

**Goal**: API stores users in SQLite while dashboard CRUD continues to work unchanged from the learner's perspective.
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: SQLITE-01, SQLITE-02, SQLITE-03, SQLITE-04, SQLITE-05
**Success Criteria** (what must be TRUE):

  1. Learner starts the API and user data persists in a `.db` file instead of `users.json` as the runtime store.
  2. Learner can create, edit, and delete users from the dashboard with identical JSON responses and HTTP status codes as before.
  3. Learner can read an explicit SQL schema defining a `users` table with `id`, `name`, and `email` columns.
  4. Learner can point the API to a custom database file path via an environment variable.
  5. Learner confirms database access uses `node:sqlite` with zero new npm dependencies.

**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — schema.sql + db.js (initDb, CRUD helpers, seed-on-empty)
- [x] 06-02-PLAN.md — index.js refactor: routes delegate to db.js, preserve HTTP contract
- [x] 06-03-PLAN.md — tests, Docker/gitignore, end-to-end verification gate

### Phase 7: Migration & Test Confidence

**Goal**: Learners can migrate seed data from JSON to SQLite and trust the automated test suite against the database layer.
**Depends on**: Phase 6
**Requirements**: MIG-01, MIG-02, MIG-03, TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):

  1. Learner runs first startup or a documented migration script and seed users from `users.json` appear in SQLite.
  2. Learner reads documentation explaining when JSON file persistence is enough vs when SQLite is appropriate.
  3. Learner runs `npm test` from `api/` and all 12 existing API tests pass against the SQLite-backed store.
  4. Learner sees tests use an isolated SQLite database per run with no cross-test contamination.
  5. Learner finds tests covering empty database, duplicate email validation, and invalid ID handling; `users.json` remains as seed source only.

**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md — schema UNIQUE + db.js JSON migration + initDb({ skipSeed })
- [x] 07-02-PLAN.md — DuplicateEmailError, 409 routes, OpenAPI update
- [x] 07-03-PLAN.md — expanded tests, docs/10-tests.md, api/README.md, UAT gate

### Phase 8: Database Learning Material

**Goal**: Learners have guided documentation and missions to understand SQLite concepts in this lab.
**Depends on**: Phase 7
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Success Criteria** (what must be TRUE):

  1. Learner reads a new doc explaining SQLite concepts (schema, queries, `.db` file) with executable localhost examples.
  2. Learner completes a mission that walks through inspecting the database, running migration, and verifying persistence across API restarts.
  3. Learner can compare `node:sqlite` vs `better-sqlite3` trade-offs (dependencies, sync/async, production use) from a doc section.
  4. Learner finds the new doc and mission entries listed in `docs/00-indice.md`.
  5. Real errors encountered during SQLite integration are recorded in `NOTEBOOK.md` for future learners.

**Plans**: 2 plans

Plans:
- [x] 08-01-PLAN.md — docs/13-sqlite.md, update doc 08, indice, README, glosario
- [x] 08-02-PLAN.md — mission 10, mission 06 notice, NOTEBOOK entries

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Dashboard CRUD Flow | v1.0 | 3/3 | Complete | 2026-05-26 |
| 2. File Persistence | v1.0 | 3/3 | Complete | 2026-05-28 |
| 3. API Tests and Quality Fixes | v1.0 | 3/3 | Complete | 2026-05-28 |
| 4. Learning Material Hardening | v1.0 | 2/2 | Complete | 2026-05-28 |
| 5. Advanced Contracts and Containers | v1.0 | 2/2 | Complete | 2026-05-29 |
| 6. SQLite Persistence Layer | v1.1 | 3/3 | Complete | 2026-05-30 |
| 7. Migration & Test Confidence | v1.1 | 3/3 | Complete | 2026-05-30 |
| 8. Database Learning Material | v1.1 | 2/2 | Complete | 2026-05-30 |

**Execution order:** Phases execute in numeric order: 1 → 2 → … → 6 → 7 → 8

Full v1.0 phase details archived in `.planning/milestones/v1.0-ROADMAP.md`.
