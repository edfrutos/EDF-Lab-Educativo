# Requirements: EDF Lab Educativo

**Defined:** 2026-05-30
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.2 Requirements

Requirements for the Docker Compose milestone. Each maps to roadmap phases (starting at Phase 9).

### Docker Compose Stack

- [x] **COMPOSE-01**: Learner can start API and dashboard together with a single `docker compose up` command from the project root.
- [x] **COMPOSE-02**: Dashboard is served from a container (nginx) on port 5173; API remains on port 3100.
- [x] **COMPOSE-03**: API service reuses the existing `api/Dockerfile`; dashboard has its own `dashboard/Dockerfile`.
- [x] **COMPOSE-04**: Dashboard CRUD works end-to-end against the containerized API (health, list, create, edit, delete).
- [x] **COMPOSE-05**: `npm start` + `python3 -m http.server` remain documented as the primary local development path.

### SQLite Volume Persistence

- [ ] **VOL-01**: Compose mounts a named or bind volume so `users.db` persists across `docker compose down` / `up` cycles.
- [ ] **VOL-02**: Documentation explains ephemeral single-container Docker (Mission 09) vs volume-backed Compose persistence.
- [ ] **VOL-03**: Root-level scripts (`compose:up`, `compose:down` or equivalent) wrap common Compose commands for beginners.

### Learning Documentation

- [ ] **DOCS-01**: New doc explains Docker Compose concepts (services, networks, volumes) with executable examples for this lab.
- [ ] **DOCS-02**: New mission guides learners through `compose up`, verifying CRUD, restarting stack, and confirming SQLite persistence.
- [ ] **DOCS-03**: `docs/12-docker.md` updated for SQLite context (no longer references JSON-only ephemeral data as primary store).
- [ ] **DOCS-04**: `docs/00-indice.md`, `README.md`, and `api/README.md` updated with Compose path and commands.
- [ ] **DOCS-05**: Relevant real errors during Compose integration recorded in `NOTEBOOK.md`.

## v1.3 Requirements

Deferred to future release. Tracked but not in the current roadmap.

### Frameworks

- **FRWK-01**: Introduce a frontend framework comparison after Compose milestone.
- **FRWK-02**: Compare framework-based state and forms against vanilla implementation.

### Production

- **PROD-01**: Authentication when a learning phase explicitly teaches auth.
- **PROD-02**: PostgreSQL as next step after SQLite relational concepts are solid.

## Out of Scope

Explicitly excluded from v1.2. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Replacing `npm start` as default dev path | Compose is advanced/optional; host dev stays primary |
| Frontend framework migration | Vanilla dashboard must remain inspectable through Compose milestone |
| PostgreSQL | SQLite + volumes teach persistence in containers first |
| Kubernetes / Swarm | Compose is the beginner orchestration step |
| Production TLS / reverse proxy | Local learning remains the target |
| Multi-stage dashboard build (Vite/webpack) | Static nginx serve keeps dashboard transparent |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMPOSE-01 | Phase 9 | Complete |
| COMPOSE-02 | Phase 9 | Complete |
| COMPOSE-03 | Phase 9 | Complete |
| COMPOSE-04 | Phase 9 | Complete |
| COMPOSE-05 | Phase 9 | Complete |
| VOL-01 | Phase 10 | Pending |
| VOL-02 | Phase 10 | Pending |
| VOL-03 | Phase 10 | Pending |
| DOCS-01 | Phase 11 | Pending |
| DOCS-02 | Phase 11 | Pending |
| DOCS-03 | Phase 11 | Pending |
| DOCS-04 | Phase 11 | Pending |
| DOCS-05 | Phase 11 | Pending |

**Coverage:**
- v1.2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-30*
*Last updated: 2026-05-30 after v1.2 roadmap creation*
