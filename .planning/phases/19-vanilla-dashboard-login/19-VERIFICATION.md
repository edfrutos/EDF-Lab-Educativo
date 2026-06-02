---
phase: 19-vanilla-dashboard-login
status: passed
verified: 2026-06-02
---

# Phase 19 Verification

**Score:** 12/12 must-haves verified (automated + API + UAT manual).

## Must-haves

| ID | Truth | Status | Evidence |
|----|-------|--------|----------|
| D-01 | Login gate until session | pass | `#login-gate` visible; `#dashboard-panel` hidden by default |
| D-02 | POST /auth/login with credentials | pass | `handleLoginSubmit` + `fetchJson` |
| D-04 | Logout clears session | pass | `handleLogoutClick` + curl logout → 401 on /users |
| D-00a/D-13 | credentials include on fetch | pass | `fetchJson` default |
| D-05–D-07 | health then /users bootstrap | pass | `bootstrapAuth` |
| D-09/D-00b | 403 inline on login form | pass | `showLoginError` for status 403 |
| D-10/D-11 | 401 → gate + inline message | pass | `handleAuthRequiredError` |
| D-12 | Network errors vs auth | pass | health fail uses error-box; login uses login-error |
| D-00c | Lab credentials hint | pass | index.html hint |
| D-16 | README Clientes frontend | pass | api/README.md subsection |
| Cookie in Network tab | pass | Verificado manualmente en DevTools durante UAT fase 19 |

## Automated checks

- `node --check dashboard/app.js` — OK
- curl: 401 `/users` without cookie; 403 bad login; 200 login + users; 401 after logout

## human_verification

Checklist manual completado en `.planning/phases/19-vanilla-dashboard-login/19-UAT.md`:
6/6 pruebas en estado `pass` (login gate, error 403 inline, login correcto, cookie en Network, logout y expiración de sesión).
