# Requirements: EDF Lab Educativo

**Defined:** 2026-06-02
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.6 Requirements

Requirements for **Framework Auth & CI**. Phases 22–25.

### Framework Authentication (React)

- [x] **FRWK-AUTH-01**: React dashboard shows login form when unauthenticated; hides CRUD until session exists.
- [x] **FRWK-AUTH-02**: React `fetchJson` (or equivalent) sends `credentials: 'include'` on all API calls.
- [x] **FRWK-AUTH-03**: React dashboard has logout control that calls `POST /auth/logout` and returns to login state.
- [x] **FRWK-AUTH-04**: React handles 401 with Spanish guidance consistent with vanilla dashboard.

### Framework Authentication (Vue)

- [x] **FRWK-AUTH-05**: Vue dashboard has login/logout parity with React (gate, credentials, 401 UX).
- [x] **FRWK-AUTH-06**: Vue `fetchJson` uses `credentials: 'include'` on all API calls.

### CI & API Hardening

- [x] **CI-01**: GitHub Actions workflow runs `npm run test:sqlite` (or documented test script) on push to `main`.
- [x] **CI-02**: Workflow documents how to add Postgres job as optional/advanced step in README or doc.
- [x] **RATE-01**: `POST /auth/login` is rate-limited (e.g. express-rate-limit) with JSON 429 response.
- [x] **RATE-02**: Rate limit configuration is env-driven and documented in `api/.env.example` comments.

### Learning Documentation

- [x] **DOCS-01**: `docs/16-frameworks.md` (or new section) compares auth flow across vanilla, React, and Vue.
- [x] **DOCS-02**: Mission 15 guides login on React or Vue, protected CRUD, logout, and DevTools cookie inspection.
- [x] **DOCS-03**: `docs/00-indice.md` and framework READMEs updated; CI badge or link in root README.
- [x] **DOCS-04**: Real framework-auth and CI errors recorded in `NOTEBOOK.md`.

## v2 Requirements

Deferred to future milestones. Tracked but not in v1.6 roadmap.

### Auth Advanced

- **AUTH-ADV-01**: OAuth / social login providers
- **AUTH-ADV-02**: Refresh tokens and token rotation
- **AUTH-ADV-03**: Password change API for operator accounts

### Production Deploy

- **PROD-01**: Let's Encrypt / cert-manager automation scripts
- **PROD-02**: nginx reverse proxy routing `/api` in Compose stack
- **PROD-03**: Kubernetes secrets and deployment manifests

### Quality

- **QA-01**: E2E browser tests (Playwright/Cypress) across three dashboards
- **QA-02**: Postgres CI job required on every PR (not optional)

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / social login | Email/password + JWT cookie path is the teaching baseline; defer to v2 |
| Refresh tokens | Session simplicity for beginners; document as v2 topic |
| Let's Encrypt automation | Complex ops; doc 18 already teaches TLS pattern manually |
| nginx `/api` proxy in Compose | Advanced reto; CORS + separate ports already work for lab |
| New API endpoints beyond rate limit | v1.6 extends frontends and ops, not API surface |
| Pinia/Vuex or React Context for auth | Keep auth state minimal and visible in components |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FRWK-AUTH-01 … FRWK-AUTH-04 | Phase 22 | Complete |
| FRWK-AUTH-05 … FRWK-AUTH-06 | Phase 23 | Complete |
| CI-01 … CI-02, RATE-01 … RATE-02 | Phase 24 | Complete |
| DOCS-01 … DOCS-04 | Phase 25 | Complete |

**Coverage:**
- v1.6 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-02*
*Last updated: 2026-06-02 after Phase 25 complete*
