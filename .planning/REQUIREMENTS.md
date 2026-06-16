# Requirements: EDF Lab Educativo

**Defined:** 2026-06-16  
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v2.2 Requirements

Requirements for **Visual Regression**. Phases 34–37.

### Visual Snapshots (Playwright)

- [x] **QA-VIS-01**: Vanilla dashboard (`:5173`) has Playwright `toHaveScreenshot` specs for stable post-login UI states (gate hidden, users table visible) with baselines committed to the repo.
- [ ] **QA-VIS-02**: React (`:5174`) and Vue (`:5175`) have equivalent visual snapshot specs using the same viewport, auth flow, and comparable UI states as QA-VIS-01.
- [x] **QA-VIS-03**: Snapshot policy is documented and enforced: `snapshotPathTemplate`, `maxDiffPixelRatio` (or equivalent threshold), and a documented `--update-snapshots` workflow for intentional UI changes.

### CI Integration

- [ ] **QA-VIS-04**: A dedicated CI job runs visual regression on every PR (Chromium minimum); failure artifacts (diff images) are retained or documented for review.
- [ ] **QA-CI-06**: Visual job reuses the existing quad `webServer` pattern and does not break `test:e2e`, `test:e2e:ci`, or `test:e2e:pg`.

### Learning Documentation

- [ ] **DOCS-04**: `docs/10-tests.md` documents visual regression setup, baseline updates, flake troubleshooting, and relationship to functional E2E.
- [ ] **DOCS-05**: Mission 18 guides running visual tests locally, reviewing a failed screenshot diff, and updating baselines deliberately.
- [ ] **DOCS-06**: At least two real v2.2 friction entries in `NOTEBOOK.md` (font/OS rendering, dynamic data masking, or CI snapshot drift).

## Future Requirements (post-v2.2)

### Auth Advanced

- **AUTH-ADV-01**: OAuth / social login providers
- **AUTH-ADV-02**: Refresh tokens and token rotation
- **AUTH-ADV-03**: Password change API for operator accounts

### Production Deploy

- **PROD-01**: Let's Encrypt / cert-manager automation scripts
- **PROD-02**: nginx reverse proxy routing `/api` in Compose stack
- **PROD-03**: Kubernetes secrets and deployment manifests

### Quality (deferred)

- **QA-VIS-05**: Visual regression on Firefox/WebKit in CI (beyond Chromium baseline job)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Percy / Chromatic / external visual SaaS | Playwright native keeps lab local and transparent |
| Full-page pixel diff of every CRUD step | Focus on stable dashboard states; CRUD covered by functional E2E |
| Visual regression without login gate | Didactic path requires same auth surface as E2E |
| Dynamic user rows in snapshot without masking | Flake risk; mask or seed fixed fixture data |
| OAuth / refresh tokens | Deferred to auth milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| QA-VIS-01 | Phase 34 | Complete |
| QA-VIS-03 | Phase 34 | Complete |
| QA-VIS-02 | Phase 35 | Pending |
| QA-VIS-04 | Phase 36 | Pending |
| QA-CI-06 | Phase 36 | Pending |
| DOCS-04 | Phase 37 | Pending |
| DOCS-05 | Phase 37 | Pending |
| DOCS-06 | Phase 37 | Pending |

**Coverage:**
- v2.2 requirements: 8 total
- Mapped to phases: 8/8 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-16 — v2.2 Visual Regression*
