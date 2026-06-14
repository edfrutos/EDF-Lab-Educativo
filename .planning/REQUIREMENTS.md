# Requirements: EDF Lab Educativo

**Defined:** 2026-06-14  
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## Active Milestone

**None** — v1.6 shipped 2026-06-14 (tag `v1.6`).  
Start the next cycle with `/gsd-new-milestone`.

**Archive:** [`.planning/milestones/v1.6-REQUIREMENTS.md`](./milestones/v1.6-REQUIREMENTS.md)

## v2 Requirements (deferred)

Tracked for future milestones. Not in an active roadmap until `/gsd-new-milestone`.

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

## Out of Scope (v1.6 carry-forward)

| Feature | Reason |
|---------|--------|
| OAuth / social login | Email/password + JWT cookie is the teaching baseline |
| Refresh tokens | Session simplicity for beginners |
| Pinia/Vuex or React Context for auth | Keep auth state visible in components |

---
*Requirements archived: 2026-06-14 after v1.6 ship*
