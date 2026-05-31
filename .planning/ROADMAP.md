# Roadmap: EDF Lab Educativo

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- 🚧 **v1.2 Docker Compose** — Phases 9–11 (planning)

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

### 🚧 v1.2 Docker Compose (Phases 9–11)

**Milestone Goal:** Teach multi-container orchestration with Docker Compose while persisting SQLite data across container restarts.

- [x] **Phase 9: Compose Stack Foundation** — `docker-compose.yml`, dashboard Dockerfile, nginx static serve, end-to-end CRUD
- [ ] **Phase 10: SQLite Volume & Scripts** — Named/bind volume for `users.db`, compose helper scripts, persistence verification
- [ ] **Phase 11: Compose Learning Material** — Doc 14, Mission 11, update doc 12, index/README, NOTEBOOK

## Phase Details

### Phase 9: Compose Stack Foundation

**Goal**: Learner starts API and dashboard together with Docker Compose and performs full CRUD from the browser.
**Depends on**: Phase 8 (v1.1 complete)
**Requirements**: COMPOSE-01, COMPOSE-02, COMPOSE-03, COMPOSE-04, COMPOSE-05
**Success Criteria** (what must be TRUE):

  1. Learner runs `docker compose up` from the project root and both services start without manual port juggling.
  2. Learner opens `http://localhost:5173` and sees the dashboard connected to the containerized API at `:3100`.
  3. Learner creates, edits, and deletes a user from the dashboard with the same feedback patterns as the host dev path.
  4. Learner can identify which Dockerfile builds each service and how nginx serves static dashboard files.
  5. Learner still finds `npm start` + `python3 -m http.server` documented as the primary development workflow.

**Plans**: 3 plans

Plans:
- [x] 09-01-PLAN.md — dashboard/Dockerfile + dashboard/nginx.conf (nginx:alpine, port 5173)
- [x] 09-02-PLAN.md — docker-compose.yml at root, api/.dockerignore seed fix, README optional pointer
- [x] 09-03-PLAN.md — E2E UAT: CRUD, ephemeral restart, 09-UAT.md

### Phase 10: SQLite Volume & Scripts

**Goal**: Learners understand container persistence via volumes and can restart the stack without losing SQLite data.
**Depends on**: Phase 9
**Requirements**: VOL-01, VOL-02, VOL-03
**Success Criteria** (what must be TRUE):

  1. Learner creates users via Compose, runs `docker compose down` then `up`, and finds the same users in the dashboard.
  2. Learner can locate the mounted volume or bind path for `api/data/users.db` in `docker-compose.yml`.
  3. Learner uses root-level helper scripts to start and stop the stack without memorizing Compose flags.
  4. Learner reads documentation contrasting ephemeral single-container Docker (Mission 09) with volume-backed Compose.
  5. Learner confirms migration from JSON seed still works on a fresh volume (cold start scenario).

**Plans**: 2 plans (TBD via `/gsd-plan-phase 10`)

### Phase 11: Compose Learning Material

**Goal**: Learners have guided documentation and missions to understand Docker Compose in this lab.
**Depends on**: Phase 10
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Success Criteria** (what must be TRUE):

  1. Learner reads a new doc explaining Compose services, networks, and volumes with executable examples for this repo.
  2. Learner completes a mission walking through compose up, CRUD verification, restart, and persistence check.
  3. Learner finds `docs/12-docker.md` aligned with SQLite (not JSON-only ephemeral narrative).
  4. Learner finds new doc and mission entries in `docs/00-indice.md` and README compose instructions.
  5. Real errors encountered during Compose integration are recorded in `NOTEBOOK.md`.

**Plans**: 2 plans (TBD via `/gsd-plan-phase 11`)

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
| 10. SQLite Volume & Scripts | v1.2 | 0/2 | Not started | — |
| 11. Compose Learning Material | v1.2 | 0/2 | Not started | — |

**Execution order:** Phases execute in numeric order: 9 → 10 → 11

Archived milestone details:

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.1-ROADMAP.md`
