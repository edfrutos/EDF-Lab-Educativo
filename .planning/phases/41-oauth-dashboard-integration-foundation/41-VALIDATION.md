---
phase: 41
slug: oauth-dashboard-integration-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-17
---

# Phase 41 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test + supertest + Playwright |
| **Config file** | `api/index.test.js`, `api/test-auth-helpers.js`, `playwright.config.js` |
| **Quick run command** | `cd api && npm run test:sqlite -- --test-name-pattern=\"Autenticación API\"` |
| **Full suite command** | `cd api && npm run test:sqlite` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --check dashboard/app.js && node --check api/auth.js`
- **After every plan wave:** Run `cd api && npm run test:sqlite`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 41-01-01 | 01 | 1 | AUTH-ADV-01 | T-41-01 | OAuth start only via backend state contract | integration | `cd api && npm run test:sqlite -- --test-name-pattern=\"oauth\"` | ✅ | ⬜ pending |
| 41-01-02 | 01 | 1 | AUTH-ADV-01 | T-41-02 | Login clásico no regresa con CTA OAuth | e2e/manual | `cd api && npm run test:sqlite -- --test-name-pattern=\"Autenticación API\"` | ✅ | ⬜ pending |
| 41-02-01 | 02 | 2 | AUTH-ADV-01 | T-41-03 | Docs/missions aligned with visible OAuth flow | source | `node --check dashboard/app.js && rg \"oauth\" docs/17-autenticacion.md missions/14-auth-vanilla-login-crud.md missions/15-framework-auth-login-crud.md NOTEBOOK.md` | ✅ | ⬜ pending |
| 41-02-02 | 02 | 2 | AUTH-ADV-01 | T-41-04 | Didactic friction captured without contract drift | source | `rg \"fase 41|OAuth\" NOTEBOOK.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OAuth handoff UX clarity from login gate | AUTH-ADV-01 | Visual didactic quality is subjective | Run dashboard, trigger OAuth mock from gate, confirm expected user guidance and successful return to protected data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
