---
phase: 27-e2e-multi-dashboard
plan: 01
subsystem: e2e
tags: [playwright, react, vue, multi-dashboard]

provides:
  - Playwright projects for vanilla, React, Vue
  - Shared auth-smoke-flow helper
  - Quad webServer (API + 3 frontends)

key-files:
  created:
    - e2e/helpers/auth-smoke-flow.js
    - e2e/tests/auth-smoke.react.spec.js
    - e2e/tests/auth-smoke.vue.spec.js
  modified:
    - e2e/playwright.config.js
    - e2e/tests/auth-smoke.vanilla.spec.js

requirements-completed: [QA-E2E-03, QA-E2E-04]

completed: 2026-06-15
one_liner: "React :5174 and Vue :5175 smoke auth specs share selectors with vanilla via auth-smoke-flow helper."
---

# Phase 27 Plan 01 Summary

**Multi-dashboard Playwright smoke specs.**

## Accomplishments

- Refactored `playwright.config.js` to four global `webServer` entries + three projects (`vanilla`, `react`, `vue`).
- Added `e2e/helpers/auth-smoke-flow.js` with shared selectors (`#login-email`, Spanish roles).
- Added `auth-smoke.react.spec.js` and `auth-smoke.vue.spec.js`; vanilla spec uses same helper.

## Verification

- `npm run test:e2e` — 3/3 passed

## Self-Check: PASSED
