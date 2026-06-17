# Phase 41-01 Summary

## Objective
Integrar OAuth mock en el dashboard vanilla como ruta auth visible y ejecutable, preservando el contrato backend de fase 40 y el flujo clásico existente.

## Changes made

- `dashboard/index.html`
  - Gate dual: formulario login clásico + botón **Continuar con OAuth mock** + hints didácticos
- `dashboard/app.js`
  - `handleOAuthMockClick`: `fetchJson('/auth/oauth/start?provider=mock')` → `fetchJson(start.authUrl)` → `showDashboardPanel()` + `loadDashboardData()`
  - Handoff con `credentials: 'include'` sin `window.location` (evita quedar en página JSON del API)
- `dashboard/styles.css`
  - Estilos `.oauth-divider`, `.oauth-mock-button`, `.oauth-hint`
- `e2e/helpers/auth-smoke-flow.js`
  - Nueva función `runOAuthMockSmokeFlow` exportada junto a `runAuthSmokeFlow`
- `e2e/tests/auth-smoke.vanilla.spec.js`
  - Segundo test: `gate → oauth mock → tabla → logout → gate`

## Verification

- `node --check dashboard/app.js` ✅
- `cd api && npm run test:sqlite` ✅ (36 tests)
- `npx playwright test --config=e2e/playwright.config.js --project=vanilla-chromium e2e/tests/auth-smoke.vanilla.spec.js` ✅ (2 passed)

## Result

Wave 1 completada. OAuth mock accesible desde UI vanilla con continuidad auth y sin regresión del flujo clásico.
