# Roadmap: EDF Lab Educativo

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker Compose** — Phases 9–11 (shipped 2026-05-31, audited 2026-05-31)
- 🚧 **v1.3 PostgreSQL Persistence** — Phases 12–14 (planning)

## Phases

<details>
<summary>✅ v1.0 Educational Lab MVP (Phases 1–5) — SHIPPED 2026-05-30</summary>

- [x] **Phase 1: Dashboard CRUD Flow** — Make create, edit, and delete visible from the browser (3/3 plans) — completed 2026-05-26
- [x] **Phase 2: File Persistence** — Teach memory vs persistence with `data/users.json` (3/3 plans) — completed 2026-05-28
- [x] **Phase 3: API Tests and Quality Fixes** — Automated API confidence and low-risk debt (3/3 plans) — completed 2026-05-28
- [x] **Phase 4: Learning Material Hardening** — Glossary and aligned docs/missions (2/2 plans) — completed 2026-05-28
- [x] **Phase 5: Advanced Contracts and Containers** — OpenAPI and Docker as advanced topics (2/2 plans) — completed 2026-05-29

</details>

<details>
<summary>✅ v1.1 SQLite Persistence (Phases 6–8) — SHIPPED 2026-05-30</summary>

- [x] **Phase 6: SQLite Persistence Layer** — Replace `users.json` runtime store with `node:sqlite` and explicit SQL schema (3/3 plans) — completed 2026-05-30
- [x] **Phase 7: Migration & Test Confidence** — JSON→SQLite migration path and SQLite-backed test suite (3/3 plans) — completed 2026-05-30
- [x] **Phase 8: Database Learning Material** — Docs, mission, driver comparison, and NOTEBOOK entries for SQLite (2/2 plans) — completed 2026-05-30

</details>

<details>
<summary>✅ v1.2 Docker Compose (Phases 9–11) — SHIPPED 2026-05-31</summary>

- [x] **Phase 9: Compose Stack Foundation** — `docker-compose.yml`, dashboard Dockerfile, nginx static serve, end-to-end CRUD (3/3 plans)
- [x] **Phase 10: SQLite Volume & Scripts** — Bind mount for `users.db`, compose helper scripts (2/2 plans)
- [x] **Phase 11: Compose Learning Material** — Doc 14, Mission 11, doc 12/index/README, NOTEBOOK (2/2 plans)

</details>

### 🚧 v1.3 PostgreSQL Persistence (Phases 12–14)

**Milestone Goal:** Teach the evolution from SQLite to PostgreSQL as a client-server database while keeping the backend → JSON → dashboard flow intact.

- [x] **Phase 12: PostgreSQL Persistence Layer** — `pg` client, schema, dual SQLite/Postgres adapter, Compose postgres service (completed 2026-05-31)
- [ ] **Phase 13: Migration & Test Confidence** — Seed into Postgres, test suite against PostgreSQL, SQLite vs PG docs note
- [ ] **Phase 14: PostgreSQL Learning Material** — Doc 15, Mission 12, index/README, NOTEBOOK

## Phase Details

### Phase 12: PostgreSQL Persistence Layer

**Goal**: API persists users in PostgreSQL when configured; Compose stack includes Postgres with persistent volume; SQLite remains host-dev default.
**Depends on**: Phase 11 (v1.2 complete)
**Requirements**: PGSQL-01, PGSQL-02, PGSQL-03, PGSQL-04, PGSQL-05, PGCOMPOSE-01, PGCOMPOSE-02, PGCOMPOSE-03
**Success Criteria** (what must be TRUE):

  1. Learner sets `DATABASE_URL` and API stores users in PostgreSQL instead of SQLite.
  2. Learner runs `npm run compose:up` and stack includes API, dashboard, and Postgres services.
  3. Learner creates, edits, and deletes users from the dashboard with identical JSON responses as SQLite mode.
  4. Learner can read PostgreSQL schema SQL defining `users` with same columns/constraints as SQLite.
  5. Learner runs `npm start` without `DATABASE_URL` and SQLite path still works unchanged.

**Plans**: 3 plans in 2 waves

**Wave 1** *(no dependencies)*
- [x] 12-01: Extract db-sqlite.js + pg dependency (PGSQL-05)

**Wave 2** *(blocked on Wave 1 / 12-02 chain)*
- [x] 12-02: schema.pg.sql + db-pg.js + router (PGSQL-01–04)
- [x] 12-03: Compose postgres service + E2E verification (PGCOMPOSE-01–03)

**Cross-cutting constraints:**
- SQLite remains default without DATABASE_URL (PGSQL-05)
- No JSON seed for Postgres in Phase 12 (D-16 → Phase 13)
- Same HTTP/JSON contract for dashboard (PGSQL-04)

### Phase 13: Migration & Test Confidence

**Goal**: Learners can seed an empty Postgres database and trust the automated test suite against PostgreSQL.
**Depends on**: Phase 12
**Requirements**: PGMIG-01, PGMIG-02, PGTEST-01, PGTEST-02, PGTEST-03
**Success Criteria** (what must be TRUE):

  1. Learner starts API against empty Postgres and seed users appear (migration log or documented script).
  2. Learner reads documentation explaining SQLite vs PostgreSQL trade-offs for this lab.
  3. Learner runs `npm test` from `api/` and all 16 tests pass against PostgreSQL.
  4. Duplicate email returns 409 against Postgres (same as SQLite).
  5. Test run does not contaminate production/dev Postgres data (isolated test DB).

**Plans**: 3 plans in 2 waves

**Wave 1** *(no dependencies)*
- [ ] 13-01: Shared `seed.js` + Postgres populateIfEmpty with setval (PGMIG-01)

**Wave 2** *(depends on 13-01; 13-03 after 13-02)*
- [ ] 13-02: `edf_lab_test`, `index.pg.test.js`, dual `npm test` (PGTEST-01–03)
- [ ] 13-03: «Hacia PostgreSQL» in `docs/13-sqlite.md` (PGMIG-02)

**Cross-cutting constraints:**
- Tests never touch Compose `edf_lab` database — only `edf_lab_test`
- `index.test.js` unchanged behavior for SQLite (PGTEST dual run adds Postgres file)
- No `docs/00-indice.md` or Mission 12 in Phase 13

### Phase 14: PostgreSQL Learning Material

**Goal**: Learners have guided documentation and missions to understand PostgreSQL in this lab.
**Depends on**: Phase 13
**Requirements**: PGDOCS-01, PGDOCS-02, PGDOCS-03, PGDOCS-04, PGDOCS-05
**Success Criteria** (what must be TRUE):

  1. Learner reads a new doc explaining Postgres connection, schema, and queries with executable examples.
  2. Learner completes a mission walking through Compose + Postgres, CRUD, restart, and persistence check.
  3. Learner finds SQLite doc updated with evolution pointer to PostgreSQL.
  4. Learner finds new doc and mission in `docs/00-indice.md` and README Postgres instructions.
  5. Real errors during Postgres integration are recorded in `NOTEBOOK.md`.

**Plans**: 2 plans (TBD via `/gsd-plan-phase 14`)

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
| 9. Compose Stack Foundation | v1.2 | 3/3 | Complete | 2026-05-31 |
| 10. SQLite Volume & Scripts | v1.2 | 2/2 | Complete | 2026-05-31 |
| 11. Compose Learning Material | v1.2 | 2/2 | Complete | 2026-05-31 |
| 12. PostgreSQL Persistence Layer | v1.3 | 3/3 | Complete    | 2026-05-31 |
| 13. Migration & Test Confidence | v1.3 | 0/3 | Planned | — |
| 14. PostgreSQL Learning Material | v1.3 | 0/2 | Not started | — |

**Execution order:** Phases execute in numeric order: 12 → 13 → 14

Archived milestone details:

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.1-ROADMAP.md`
- `.planning/milestones/v1.2-ROADMAP.md`
