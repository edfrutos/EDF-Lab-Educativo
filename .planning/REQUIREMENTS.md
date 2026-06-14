# Requirements: EDF Lab Educativo

**Defined:** 2026-06-14  
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v2.0 Requirements

Requirements for **Quality & CI**. Phases 26–29.

### E2E Smoke Auth (Playwright)

- [ ] **QA-E2E-01**: Playwright (`@playwright/test`) lives at repo root in `e2e/` with config that starts API `:3100` and dashboards as needed (no `AUTH_DISABLED` in E2E).
- [ ] **QA-E2E-02**: Vanilla smoke (`:5173`): login gate → valid operator login → users table shows data → logout → gate returns.
- [ ] **QA-E2E-03**: React smoke (`:5174`): same auth flow as QA-E2E-02.
- [ ] **QA-E2E-04**: Vue smoke (`:5175`): same auth flow as QA-E2E-02.
- [ ] **QA-E2E-05**: Root script (e.g. `npm run test:e2e`) runs the smoke suite locally; documented in `docs/10-tests.md`.

### CI (Postgres + E2E)

- [ ] **QA-CI-01**: GitHub Actions job runs `npm run test:pg` against `postgres:16` service on every pull request to `main`.
- [ ] **QA-CI-02**: GitHub Actions job runs Playwright smoke suite on every pull request (Chromium; API on isolated SQLite).
- [ ] **QA-CI-03**: Existing `test-sqlite` job remains; all three jobs (sqlite, postgres, e2e) are required for merge.
- [ ] **QA-CI-04**: CI sets safe test env for E2E (admin seed credentials, elevated `LOGIN_RATE_LIMIT_MAX` or equivalent to avoid 429 flakes).

### Learning Documentation

- [ ] **DOCS-01**: `docs/10-tests.md` documents local E2E setup, CI job matrix, and Postgres PR requirement.
- [ ] **DOCS-02**: Mission 16 guides running smoke E2E locally and reading a failing trace.
- [ ] **DOCS-03**: At least two real E2E or Postgres-CI friction entries in `NOTEBOOK.md` (v2.0 section).

## Future Requirements (post-v2.0)

### Auth Advanced

- **AUTH-ADV-01**: OAuth / social login providers
- **AUTH-ADV-02**: Refresh tokens and token rotation
- **AUTH-ADV-03**: Password change API for operator accounts

### Production Deploy

- **PROD-01**: Let's Encrypt / cert-manager automation scripts
- **PROD-02**: nginx reverse proxy routing `/api` in Compose stack
- **PROD-03**: Kubernetes secrets and deployment manifests

### Quality (deferred from v2.0 scope)

- **QA-ADV-01**: Full CRUD E2E across dashboards
- **QA-ADV-02**: Visual regression / screenshot diff
- **QA-ADV-03**: E2E against Postgres-backed API
- **QA-ADV-04**: Firefox/WebKit in CI matrix

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cypress | Playwright chosen for v2.0; one browser automation stack |
| Docker/Compose for E2E | Host `webServer` keeps lab transparent; Compose E2E is a future milestone |
| CRUD E2E in v2.0 | API tests + missions 14/15 cover CRUD; smoke auth is the teaching slice |
| `storageState` as default path | UI login must stay visible for didactic value |
| OAuth / refresh tokens | Deferred to post-v2.0 auth milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QA-E2E-01 | Phase 26 | Pending |
| QA-E2E-02 | Phase 26 | Pending |
| QA-E2E-05 | Phase 26 | Pending |
| QA-CI-04 | Phase 26 | Pending |
| QA-E2E-03 | Phase 27 | Pending |
| QA-E2E-04 | Phase 27 | Pending |
| QA-CI-02 | Phase 27 | Pending |
| QA-CI-01 | Phase 28 | Pending |
| QA-CI-03 | Phase 28 | Pending |
| DOCS-01 | Phase 29 | Pending |
| DOCS-02 | Phase 29 | Pending |
| DOCS-03 | Phase 29 | Pending |

**Coverage:**
- v2.0 requirements: 12 total
- Mapped to phases: 12/12 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-14 — v2.0 Quality & CI*
