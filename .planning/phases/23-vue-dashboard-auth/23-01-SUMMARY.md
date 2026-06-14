---
phase: 23-vue-dashboard-auth
plan: 01
subsystem: auth
tags: [vue, fetch, cookies, login-gate, emit]

provides:
  - login() and logout() in dashboard-vue api.js
  - LoginGate.vue Tailwind card form with emit login

key-files:
  created:
    - dashboard-vue/src/components/LoginGate.vue
  modified:
    - dashboard-vue/src/api.js

requirements-completed: [FRWK-AUTH-06]

completed: 2026-06-02
one_liner: "Vue api.js login/logout helpers and LoginGate SFC with emit-based form."
---

# Phase 23 Plan 01 Summary

**HTTP auth helpers and LoginGate component ready for App.vue wiring.**

## Accomplishments

- Exported `login()` and `logout()` using `fetchJson` with inherited `credentials: 'include'`.
- Created `LoginGate.vue` with email/password form, inline error prop, and lab credentials hint.
- Child → parent communication via `defineEmits(['login'])` (Vue idiom vs React callback).

## Verification

- Grep checks from plan — pass
- `npm run test:sqlite` — 23/23 pass (API unchanged)

## Self-Check: PASSED
