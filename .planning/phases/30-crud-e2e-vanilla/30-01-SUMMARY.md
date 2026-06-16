---
phase: 30-crud-e2e-vanilla
plan: 01
subsystem: testing
tags: [playwright, e2e, crud, vanilla]

requires:
  - phase: v2.0
    provides: quad webServer, auth-smoke-flow pattern, e2e.users.db
provides:
  - e2e/helpers/crud-flow.js (runCrudFlow, buildCrudTestUser)
  - e2e/tests/crud.vanilla.spec.js
affects: [31-crud-e2e-multi-dashboard]

tech-stack:
  added: []
  patterns: [shared CRUD helper, unique email per run, dialog.accept for confirm delete]

key-files:
  created:
    - e2e/helpers/crud-flow.js
    - e2e/tests/crud.vanilla.spec.js
  modified: []

key-decisions:
  - "Selectores por ID (#login-email, #user-email-input) para evitar strict mode"
  - "Sin logout al final del flujo CRUD — smoke auth lo cubre aparte"

patterns-established:
  - "buildCrudTestUser() con sufijo Date.now + random para emails @lab.local"
  - "page.once('dialog', accept) antes de click Eliminar"

requirements-completed: [QA-ADV-01]

duration: 15min
completed: 2026-06-15
---

# Phase 30 Plan 01 Summary

**Helper CRUD reutilizable y spec vanilla con ciclo login → create → edit → delete verificado por sintaxis.**

## Accomplishments

- `crud-flow.js` exporta `runCrudFlow` y `buildCrudTestUser` con JSDoc en español
- `crud.vanilla.spec.js` ejecuta el flujo completo tras `page.goto('/')`
- `node --check` pasa en helper y spec

## Files Created

- `e2e/helpers/crud-flow.js` — flujo CRUD compartido
- `e2e/tests/crud.vanilla.spec.js` — spec Playwright vanilla
