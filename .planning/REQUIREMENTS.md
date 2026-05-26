# Requirements: EDF Lab Educativo

**Defined:** 2026-05-26
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1 Requirements

Requirements for the current educational evolution. Each requirement maps to a roadmap phase.

### Dashboard CRUD

- [x] **DASH-01**: Learner can create a user from the dashboard using the existing API.
- [x] **DASH-02**: Learner can edit an existing user from the dashboard.
- [x] **DASH-03**: Learner can delete a user from the dashboard with visible confirmation or feedback.
- [x] **DASH-04**: Dashboard shows loading, success, and error states for CRUD operations.
- [ ] **DASH-05**: Dashboard documentation and missions explain the browser-to-API mutation flow.

### Persistence

- [ ] **PERS-01**: API stores users in `data/users.json` instead of only process memory.
- [ ] **PERS-02**: API creates or initializes persistence data safely when the data file is missing.
- [ ] **PERS-03**: Learner can observe that users survive an API restart.
- [ ] **PERS-04**: Documentation explains memory vs file persistence with executable examples.
- [ ] **PERS-05**: Simple backup behavior exists or is explicitly taught as a mission.

### API Tests

- [ ] **TEST-01**: API test command runs successfully from `api/`.
- [ ] **TEST-02**: Tests cover `GET /health` and `GET /users`.
- [ ] **TEST-03**: Tests cover `POST /users`, `PUT /users/:id`, and `DELETE /users/:id`.
- [ ] **TEST-04**: Tests cover validation failures for invalid IDs and invalid user payloads.
- [ ] **TEST-05**: Documentation explains how to run and interpret the API tests.

### Learning Documentation

- [ ] **DOCS-01**: A beginner-friendly glossary defines core concepts used by the lab.
- [ ] **DOCS-02**: Existing docs remain synchronized with actual paths, ports, endpoints, and commands.
- [ ] **DOCS-03**: Every new learner-facing concept includes an executable example.
- [ ] **DOCS-04**: Every new mission includes objective, steps, expected result, and extra challenge.
- [ ] **DOCS-05**: Relevant real errors and fixes are recorded in `NOTEBOOK.md`.

### Quality Foundations

- [ ] **QUAL-01**: API package metadata reflects the educational lab instead of generic test-project values.
- [ ] **QUAL-02**: Development script with Nodemon exists if retained as a dependency.
- [ ] **QUAL-03**: User ID parsing rejects partial numeric strings such as `1abc`.
- [x] **QUAL-04**: Stale project paths in dashboard help text are corrected.
- [ ] **QUAL-05**: Validation commands are documented and runnable.

### Advanced Learning

- [ ] **ADV-01**: OpenAPI/Swagger documents the API contract when the API surface is stable enough.
- [ ] **ADV-02**: Docker setup teaches containerized local execution without replacing the simpler startup path.
- [ ] **ADV-03**: Advanced database work is deferred until file persistence has been taught.

## v2 Requirements

Deferred to future release. Tracked but not in the current roadmap.

### Frameworks

- **FRWK-01**: Introduce a frontend framework only after vanilla data flow is understood.
- **FRWK-02**: Compare framework-based state and forms against the existing vanilla implementation.

### Production Hardening

- **PROD-01**: Add authentication only if a later learning phase explicitly teaches auth.
- **PROD-02**: Add deployment guidance only after local learning workflows are stable.
- **PROD-03**: Add SQLite or PostgreSQL after file persistence and backups are understood.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Production authentication in v1 | Not needed for the beginner API/data-flow lab. |
| Frontend framework in near-term phases | Vanilla HTML/CSS/JS keeps the data flow inspectable for beginners. |
| Database-first persistence | File persistence teaches the simpler memory vs persistence concept first. |
| Deployment-first workflow | The project is currently a local educational lab. |
| Dependencies without clear teaching value | Project rules require educational value for new dependencies. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 1 | Complete |
| DASH-02 | Phase 1 | Complete |
| DASH-03 | Phase 1 | Complete |
| DASH-04 | Phase 1 | Complete |
| DASH-05 | Phase 1 | Pending |
| PERS-01 | Phase 2 | Pending |
| PERS-02 | Phase 2 | Pending |
| PERS-03 | Phase 2 | Pending |
| PERS-04 | Phase 2 | Pending |
| PERS-05 | Phase 2 | Pending |
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |
| TEST-03 | Phase 3 | Pending |
| TEST-04 | Phase 3 | Pending |
| TEST-05 | Phase 3 | Pending |
| DOCS-01 | Phase 4 | Pending |
| DOCS-02 | Phase 4 | Pending |
| DOCS-03 | Phase 4 | Pending |
| DOCS-04 | Phase 4 | Pending |
| DOCS-05 | Phase 4 | Pending |
| QUAL-01 | Phase 3 | Pending |
| QUAL-02 | Phase 3 | Pending |
| QUAL-03 | Phase 3 | Pending |
| QUAL-04 | Phase 1 | Complete |
| QUAL-05 | Phase 3 | Pending |
| ADV-01 | Phase 5 | Pending |
| ADV-02 | Phase 5 | Pending |
| ADV-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-05-26*
*Last updated: 2026-05-26 after roadmap creation*
