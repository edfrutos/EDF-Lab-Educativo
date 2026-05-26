# Roadmap: EDF Lab Educativo

## Overview

This roadmap evolves the existing Express + static dashboard lab into a stronger beginner learning path. It keeps the current vanilla foundation, then adds browser-based CRUD, file persistence, tests, glossary/docs hardening, and finally advanced contract/container material without hiding the core backend -> JSON -> frontend flow.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Dashboard CRUD Flow** - Make create, edit, and delete visible from the browser.
- [ ] **Phase 2: File Persistence** - Teach memory vs persistence with `data/users.json`.
- [ ] **Phase 3: API Tests and Quality Fixes** - Add automated API confidence and resolve known low-risk debt.
- [ ] **Phase 4: Learning Material Hardening** - Add glossary and keep docs/missions aligned with the working app.
- [ ] **Phase 5: Advanced Contracts and Containers** - Add OpenAPI and Docker as advanced learning topics.

## Phase Details

### Phase 1: Dashboard CRUD Flow

**Goal**: Learners can use the dashboard to create, edit, and delete users while seeing loading, success, and error states.
**Mode:** mvp
**Depends on**: Existing API and dashboard
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, QUAL-04
**Success Criteria** (what must be TRUE):

  1. Learner can create a user from the dashboard and see the table update.
  2. Learner can edit an existing user from the dashboard and see the updated data.
  3. Learner can delete a user from the dashboard and receive clear feedback.
  4. Dashboard shows understandable loading and error states for mutation failures.
  5. Documentation or a mission explains the full browser -> API mutation flow.

**Plans**: 3 plans
Plans:
**Wave 1**

- [ ] 01-01: Correct stale dashboard help text and prepare UI structure for user mutations.

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-02: Implement create/edit/delete interactions in vanilla JavaScript.

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03: Document the dashboard CRUD flow and add or update the learner mission.

### Phase 2: File Persistence

**Goal**: Users survive API restarts through simple file persistence, and learners understand what changed.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PERS-01, PERS-02, PERS-03, PERS-04, PERS-05
**Success Criteria** (what must be TRUE):

  1. API reads users from `data/users.json`.
  2. API writes user mutations back to `data/users.json`.
  3. Learner can restart the API and observe that users remain.
  4. Documentation explains the difference between in-memory state and file persistence.
  5. Backup behavior is implemented or taught through a concrete mission.

**Plans**: 3 plans

Plans:

- [ ] 02-01: Introduce `data/users.json` and safe load/save helpers.
- [ ] 02-02: Wire CRUD routes to persistence while preserving current API responses.
- [ ] 02-03: Document memory vs persistence and add backup/restart exercises.

### Phase 3: API Tests and Quality Fixes

**Goal**: The lab has runnable API tests and resolves small issues that currently weaken learner confidence.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, QUAL-01, QUAL-02, QUAL-03, QUAL-05
**Success Criteria** (what must be TRUE):

  1. `npm test` from `api/` runs meaningful API checks successfully.
  2. Tests cover health, users listing, CRUD success cases, and validation failures.
  3. Package metadata and development scripts match the educational lab.
  4. Invalid IDs such as `1abc` are rejected consistently.
  5. Validation commands are documented for learners.

**Plans**: 3 plans

Plans:

- [ ] 03-01: Choose and add the smallest useful API test approach.
- [ ] 03-02: Cover existing and persistence-backed route behavior with tests.
- [ ] 03-03: Clean package metadata, dev script, ID validation, and validation docs.

### Phase 4: Learning Material Hardening

**Goal**: Beginner learning material is complete, synchronized, and easy to follow.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05
**Success Criteria** (what must be TRUE):

  1. A glossary defines the core backend, frontend, HTTP, JSON, CORS, persistence, and testing terms.
  2. Docs and missions match actual paths, ports, commands, endpoints, and UI behavior.
  3. New concepts include executable examples.
  4. Missions follow the required objective, steps, expected result, and extra challenge format.
  5. `NOTEBOOK.md` records relevant real errors and decisions from the new phases.

**Plans**: 2 plans

Plans:

- [ ] 04-01: Add the glossary and connect it to the documentation index.
- [ ] 04-02: Audit docs, missions, README, ROADMAP, and NOTEBOOK for synchronization.

### Phase 5: Advanced Contracts and Containers

**Goal**: Add advanced material for API contracts and local container execution while preserving the simple learning path.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: ADV-01, ADV-02, ADV-03
**Success Criteria** (what must be TRUE):

  1. OpenAPI/Swagger describes the current API contract.
  2. Docker setup can run the API locally without replacing the basic Node startup path.
  3. Documentation explains why these advanced tools exist and when beginners can ignore them.
  4. Database work remains deferred until file persistence is understood.

**Plans**: 2 plans

Plans:

- [ ] 05-01: Add OpenAPI/Swagger documentation for the Express API.
- [ ] 05-02: Add Docker-based local execution as an optional advanced path.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dashboard CRUD Flow | 0/3 | Not started | - |
| 2. File Persistence | 0/3 | Not started | - |
| 3. API Tests and Quality Fixes | 0/3 | Not started | - |
| 4. Learning Material Hardening | 0/2 | Not started | - |
| 5. Advanced Contracts and Containers | 0/2 | Not started | - |
