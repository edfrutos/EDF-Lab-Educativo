# Roadmap: EDF Lab Educativo

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker Compose** — Phases 9–11 (shipped 2026-05-31, audited 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- 🚧 **v1.4 Frontend Framework Comparison** — Phases 15–17 (planning)

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

<details>
<summary>✅ v1.3 PostgreSQL Persistence (Phases 12–14) — SHIPPED 2026-06-01</summary>

- [x] **Phase 12: PostgreSQL Persistence Layer** — `pg` client, schema, dual adapter, Compose postgres service (3/3 plans) — completed 2026-05-31
- [x] **Phase 13: Migration & Test Confidence** — Shared seed, dual test matrix, SQLite vs PG docs (3/3 plans) — completed 2026-06-01
- [x] **Phase 14: PostgreSQL Learning Material** — Doc 15, Mission 12, index/README, NOTEBOOK (2/2 plans) — completed 2026-06-01

</details>

### 🚧 v1.4 Frontend Framework Comparison (Phases 15–17)

**Milestone Goal:** Learners compare vanilla `fetch()` + DOM with React and Vue implementations of the same API contract.

- [x] **Phase 15: React Dashboard Parity** — Vite + React app with full CRUD and CORS/ports (FRWK-01–03, 06–08)
- [x] **Phase 16: Vue Dashboard Parity** — Vite + Vue 3 app with same parity (FRWK-04–05)
- [ ] **Phase 17: Framework Learning Material** — Comparison doc, mission, index/README, NOTEBOOK, UAT checklist (FRWK-09–13)

## Phase Details

### Phase 15: React Dashboard Parity

**Goal:** A React dashboard reproduces vanilla CRUD and initial load against the existing API without backend changes.  
**Depends on:** Phase 14 (v1.3 complete)  
**Requirements:** FRWK-01, FRWK-02, FRWK-03, FRWK-06, FRWK-07, FRWK-08  
**Success Criteria** (what must be TRUE):

  1. Learner runs `dashboard-react` dev server and sees health, API info, and users list.
  2. Learner creates, edits, and deletes users; duplicate email returns visible error (409).
  3. Learner reads which port and env var configure the API URL.
  4. Vanilla dashboard on `:5173` still works with updated CORS if needed.

**Plans:** 3 plans in 2 waves

**Wave 1**
- [x] 15-01: Vite + React + Tailwind scaffold, `api.js`, initial load (FRWK-01, FRWK-02 partial, FRWK-08 partial)

**Wave 2** *(depends on 15-01; 15-03 after 15-02)*
- [x] 15-02: Components + full CRUD + 409 dual feedback (FRWK-02, FRWK-03, FRWK-06)
- [x] 15-03: UAT, CORS verify, README pointers (FRWK-07, FRWK-08)

### Phase 16: Vue Dashboard Parity

**Goal:** A Vue 3 dashboard matches React and vanilla feature parity.  
**Depends on:** Phase 15  
**Requirements:** FRWK-04, FRWK-05  
**Success Criteria** (what must be TRUE):

  1. Learner runs `dashboard-vue` on its documented port with full CRUD.
  2. Learner can contrast Vue reactivity/refs with React state and vanilla variables.

**Plans:** 3 plans in 2 waves

**Wave 1**
- [x] 16-01: Vite + Vue 3 + Tailwind scaffold, `api.js`, initial load (FRWK-04, FRWK-05 partial, FRWK-08 partial)

**Wave 2** *(depends on 16-01; 16-03 after 16-02)*
- [x] 16-02: SFC components + full CRUD + 409 dual feedback (FRWK-05)
- [x] 16-03: UAT, CORS verify, README + pedagogy pointer (FRWK-04/05 sign-off)

### Phase 17: Framework Learning Material

**Goal:** Guided comparison documentation and missions; vanilla remains primary path.  
**Depends on:** Phase 16  
**Requirements:** FRWK-09, FRWK-10, FRWK-11, FRWK-12, FRWK-13  
**Success Criteria** (what must be TRUE):

  1. Learner reads doc comparing state and forms across three dashboards.
  2. Learner completes mission with Network tab inspection on a framework app.
  3. Index and README mark frameworks as advanced optional.
  4. NOTEBOOK documents real CORS/port/env errors from framework setup.

**Plans:** 2 plans in 2 waves

**Wave 1**
- [ ] 17-01: `docs/16-frameworks.md` + Mission 13 (FRWK-09, FRWK-10)

**Wave 2** *(depends on 17-01)*
- [ ] 17-02: Index, README, NOTEBOOK, unified 17-UAT (FRWK-11, FRWK-12, FRWK-13)

**Cross-cutting constraints:**
- Do not remove or replace `dashboard/` vanilla app
- No Redux/Pinia/router libraries in v1.4
- `api/` changes limited to CORS origins if required

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
| 12. PostgreSQL Persistence Layer | v1.3 | 3/3 | Complete | 2026-05-31 |
| 13. Migration & Test Confidence | v1.3 | 3/3 | Complete | 2026-06-01 |
| 14. PostgreSQL Learning Material | v1.3 | 2/2 | Complete | 2026-06-01 |
| 15. React Dashboard Parity | v1.4 | 0/3 | Planned | — |
| 16. Vue Dashboard Parity | v1.4 | 0/? | Not started | — |
| 17. Framework Learning Material | v1.4 | 0/? | Not started | — |

**Execution order:** 15 → 16 → 17

Research: `.planning/research/SUMMARY.md`

Archived milestone details:

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.1-ROADMAP.md`
- `.planning/milestones/v1.2-ROADMAP.md`
- `.planning/milestones/v1.3-ROADMAP.md`
