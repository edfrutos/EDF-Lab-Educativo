# Requirements: EDF Lab Educativo

**Defined:** 2026-06-01
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.4 Requirements

Requirements for the Frontend Framework Comparison milestone. Phases start at **15**.

### React Dashboard

- [ ] **FRWK-01**: `dashboard-react/` exists with Vite + React; learner runs dev server on a documented port (e.g. 5174).
- [ ] **FRWK-02**: React app loads `/health`, `/`, and `/users` on startup (equivalent to vanilla `loadDashboardData`).
- [ ] **FRWK-03**: React app supports create, edit, delete users with the same HTTP methods and JSON bodies as vanilla.

### Vue Dashboard

- [ ] **FRWK-04**: `dashboard-vue/` exists with Vite + Vue 3; learner runs dev server on a documented port (e.g. 5175).
- [ ] **FRWK-05**: Vue app achieves the same feature parity as FRWK-02 and FRWK-03.

### API Contract & Integration

- [ ] **FRWK-06**: No breaking changes to existing API JSON shapes or status codes for CRUD.
- [ ] **FRWK-07**: CORS allows framework dev origins; vanilla `:5173` still works.
- [ ] **FRWK-08**: `API_BASE_URL` (or `VITE_*` equivalent) is configurable and documented; default points to `http://localhost:3100`.

### Comparison & Learning

- [ ] **FRWK-09**: New doc explains vanilla vs React vs Vue for **state** and **forms** with excerpts from this repo.
- [ ] **FRWK-10**: New mission guides running API + at least one framework dashboard, CRUD, and browser Network inspection.
- [ ] **FRWK-11**: `docs/00-indice.md`, `README.md` list framework path as **advanced optional**; vanilla remains primary.
- [ ] **FRWK-12**: Real framework integration errors (CORS, ports, env) recorded in `NOTEBOOK.md`.

### Verification

- [ ] **FRWK-13**: Documented manual UAT checklist or smoke steps confirming parity across three dashboards against the same API.

## v1.5 Requirements

Deferred to future release.

### Production

- **PROD-01**: Authentication when a learning phase explicitly teaches auth.
- **PROD-02**: Production deployment hardening (TLS, secrets management).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Removing vanilla dashboard | Primary beginner path must stay inspectable |
| Redux, Pinia, React Query, etc. | Hides state/fetch learning objectives |
| Next.js / Nuxt / SSR | Adds routing/server complexity beyond milestone goal |
| Containerizing Vite dev in Compose | HMR complexity; host dev documented for v1.4 |
| Changing API or database for frameworks | Backend milestone already complete |
| Shared component library across React/Vue | Not educational value per se |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FRWK-01 | Phase 15 | Pending |
| FRWK-02 | Phase 15 | Pending |
| FRWK-03 | Phase 15 | Pending |
| FRWK-06 | Phase 15 | Pending |
| FRWK-07 | Phase 15 | Pending |
| FRWK-08 | Phase 15 | Pending |
| FRWK-04 | Phase 16 | Pending |
| FRWK-05 | Phase 16 | Pending |
| FRWK-09 | Phase 17 | Pending |
| FRWK-10 | Phase 17 | Pending |
| FRWK-11 | Phase 17 | Pending |
| FRWK-12 | Phase 17 | Pending |
| FRWK-13 | Phase 17 | Pending |

**Coverage:**
- v1.4 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-01*
*Last updated: 2026-06-01 after v1.4 milestone start*
