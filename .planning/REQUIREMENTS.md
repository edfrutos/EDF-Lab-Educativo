# Requirements: EDF Lab Educativo

**Defined:** 2026-06-15  
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v2.1 Requirements

Requirements for **Advanced E2E**. Phases 30–33.

### CRUD E2E (Playwright)

- [ ] **QA-ADV-01**: Shared `crud-flow` helper (unique email per run, create → edit name/email → delete) and vanilla CRUD E2E spec after UI login (`:5173`).
- [ ] **QA-ADV-02**: React (`:5174`) and Vue (`:5175`) CRUD E2E specs using the same helper and assertions as QA-ADV-01.

### Postgres & Multi-browser E2E

- [ ] **QA-ADV-03**: Playwright `webServer` can start the API with `DATABASE_URL` against an isolated Postgres test DB; auth smoke (and CRUD smoke if PG-stable) passes without SQLite `DB_FILE`.
- [ ] **QA-ADV-04**: CI E2E job runs Chromium and Firefox; WebKit runs locally or via documented optional CI step (no silent skip without doc).
- [ ] **QA-CI-05**: Postgres E2E uses a dedicated test database name (e.g. `edf_lab_e2e`), never the dev `edf_lab` volume.

### Learning Documentation

- [ ] **DOCS-01**: `docs/10-tests.md` documents CRUD E2E flow, Postgres E2E env, and multi-browser matrix (local vs CI).
- [ ] **DOCS-02**: Mission 17 guides running CRUD E2E locally and debugging a failing create/edit/delete step (trace + Network).
- [ ] **DOCS-03**: At least two real v2.1 friction entries in `NOTEBOOK.md` (CRUD E2E, Postgres E2E, or multi-browser).

## Future Requirements (post-v2.1)

### Quality

- **QA-VIS-01**: Visual regression / screenshot diff (deferred from v2.0 QA-ADV-02 label)

### Auth Advanced

- **AUTH-ADV-01**: OAuth / social login providers
- **AUTH-ADV-02**: Refresh tokens and token rotation
- **AUTH-ADV-03**: Password change API for operator accounts

### Production Deploy

- **PROD-01**: Let's Encrypt / cert-manager automation scripts
- **PROD-02**: nginx reverse proxy routing `/api` in Compose stack
- **PROD-03**: Kubernetes secrets and deployment manifests

## Out of Scope

| Feature | Reason |
|---------|--------|
| Visual regression in v2.1 | Baseline storage + flake policy need separate milestone (QA-VIS-01) |
| Cypress | Playwright remains the single automation stack |
| CRUD E2E without UI login | Didactic path requires visible auth + credentialed fetch |
| E2E against production Compose stack | Host `webServer` + CI service keeps lab transparent |
| OAuth / refresh tokens | Deferred to auth milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QA-ADV-01 | Phase 30 | Pending |
| QA-ADV-02 | Phase 31 | Pending |
| QA-ADV-03 | Phase 32 | Pending |
| QA-CI-05 | Phase 32 | Pending |
| QA-ADV-04 | Phase 33 | Pending |
| DOCS-01 | Phase 33 | Pending |
| DOCS-02 | Phase 33 | Pending |
| DOCS-03 | Phase 33 | Pending |

**Coverage:**
- v2.1 requirements: 8 total
- Mapped to phases: 8/8 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-15 — v2.1 Advanced E2E*
