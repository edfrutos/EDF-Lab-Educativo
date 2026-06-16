---
phase: 35-visual-multi-dashboard
plan: 01
subsystem: testing
tags: [playwright, visual-regression, react, vue, snapshots]
requires:
  - phase: 34-fundaci-n-visual-vanilla
    provides: visual-flow.js y spec visual.vanilla
provides:
  - IDs visuales mínimos en React y Vue (#dashboard-panel, #login-gate, #health-timestamp)
  - Specs visual.react y visual.vue reutilizando helper compartido
affects: [phase-36, docs]
tech-stack:
  added: []
  patterns: [paridad de selectores entre frameworks, specs delgados sobre visual-flow]
key-files:
  created: [e2e/tests/visual.react.spec.js, e2e/tests/visual.vue.spec.js]
  modified:
    - dashboard-react/src/App.jsx
    - dashboard-react/src/components/LoginGate.jsx
    - dashboard-react/src/components/HealthCard.jsx
    - dashboard-vue/src/App.vue
    - dashboard-vue/src/components/LoginGate.vue
    - dashboard-vue/src/components/HealthCard.vue
key-decisions:
  - "IDs mínimos en React/Vue sin modificar visual-flow.js (D-01–D-03)."
  - "Specs espejan visual.vanilla.spec.js con describe/test en español."
patterns-established:
  - "Multi-framework visual parity: mismos selectores que vanilla en cada dashboard"
requirements-completed: [QA-VIS-02]
duration: 15min
completed: 2026-06-16
---

# Phase 35: Visual multi-dashboard — Plan 01 Summary

**React y Vue exponen los selectores que `visual-flow` espera y tienen specs de snapshot equivalentes al vanilla, sin duplicar lógica de preparación.**

## Accomplishments
- Se añadieron `id="login-gate"`, `id="health-timestamp"` y `id="dashboard-panel"` en componentes React y Vue.
- Se crearon `e2e/tests/visual.react.spec.js` y `e2e/tests/visual.vue.spec.js` importando `prepareVisualState` y `getVisualScreenshotOptions`.
- Cada spec captura `dashboard-post-login.png` sobre `#dashboard-panel` tras login estable.

## Verification
- `node --check e2e/tests/visual.react.spec.js`
- `node --check e2e/tests/visual.vue.spec.js`

## Deviations from Plan

None - plan executed exactly as written.
