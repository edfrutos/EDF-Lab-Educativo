# Phase 35 Research: Visual multi-dashboard

**Researched:** 2026-06-16  
**Status:** Complete

## Extension from phase 34

- Reuse `visual-flow.js` unchanged — requires `#dashboard-panel`, `#login-gate`, `#health-timestamp` in React/Vue (currently missing).
- Spec pattern: mirror `visual.vanilla.spec.js` with framework-specific describe title and Playwright project `baseURL`.
- Each spec file gets its own baseline PNG under `e2e/__snapshots__/visual.{react,vue}.spec.js/`.

## DOM parity (phase 31 precedent)

CRUD alignment added `#login-email`, `#users-table-body` to React/Vue without layout changes. Phase 35 adds three visual IDs:

| ID | React | Vue |
|----|-------|-----|
| `#login-gate` | `LoginGate.jsx` root `<section>` | `LoginGate.vue` root `<section>` |
| `#dashboard-panel` | Authenticated `<main>` in `App.jsx` | Authenticated `<main>` in `App.vue` |
| `#health-timestamp` | `<strong>` in `HealthCard.jsx` | `<strong>` in `HealthCard.vue` |

React/Vue unmount login gate when authenticated — Playwright treats detached `#login-gate` as hidden (`toBeHidden()` compatible).

## Playwright projects

Mirror `vanilla-chromium-visual`:

```javascript
{ name: 'react-chromium-visual', testMatch: /visual\.react\.spec\.js/, baseURL: 'http://localhost:5174', viewport: 1280×720 }
{ name: 'vue-chromium-visual', testMatch: /visual\.vue\.spec\.js/, baseURL: 'http://localhost:5175', viewport: 1280×720 }
```

`test:visual` → `--project=vanilla-chromium-visual --project=react-chromium-visual --project=vue-chromium-visual`

## Validation Architecture

- `npm run test:visual` → 3 passed
- `npm run test:e2e` → 6 passed (regression)
- `node --check` on new specs
