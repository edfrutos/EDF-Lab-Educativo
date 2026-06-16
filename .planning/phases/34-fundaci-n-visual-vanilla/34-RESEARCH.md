# Phase 34 Research: Fundación visual vanilla

**Researched:** 2026-06-16  
**Status:** Complete

## Playwright visual regression (native)

- **`expect(locator).toHaveScreenshot(name, options)`** — compara contra baseline en disco; opciones clave: `maxDiffPixelRatio`, `mask` (array de locators enmascarados en rojo), `animations: 'disabled'` (Playwright 1.40+).
- **`snapshotPathTemplate`** en `defineConfig` — controla ruta de baselines; patrón didáctico: `{testDir}/__snapshots__/{testFilePath}/{arg}{ext}`.
- **Actualizar baselines:** `npx playwright test --update-snapshots` o flag en config `updateSnapshots: 'missing'` solo para primer run.
- **Viewport fijo:** `page.setViewportSize({ width: 1280, height: 720 })` en `beforeEach` del spec o en `use.viewport` del proyecto visual.

## Anti-flake (educational lab)

| Fuente de flake | Mitigación elegida (CONTEXT D-05–D-07) |
|-----------------|----------------------------------------|
| `#health-timestamp` cambia cada refresh | `mask` en locator |
| Filas CRUD de otras suites E2E | `mask` en `#users-table-body` |
| Animaciones CSS | `animations: 'disabled'` + opcional `addStyleTag` |
| Diferencias OS/font rendering | `maxDiffPixelRatio: 0.01`; CI Chromium Linux puede requerir baseline generada en CI (fase 36) |

## Integración con harness existente

- Reutilizar **quad `webServer`** de `e2e/playwright.config.js` — no crear config separada (D-13).
- Nuevo proyecto **`vanilla-chromium-visual`** con `testMatch: /visual\.vanilla\.spec\.js/` — separado de `vanilla-chromium` funcional para no mezclar suites en `test:e2e`.
- Helper **`visual-flow.js`** prepara estado (login sin logout) y devuelve opciones de screenshot; spec aplica `toHaveScreenshot`.

## Referencias

- [Playwright screenshots](https://playwright.dev/docs/test-snapshots)
- `e2e/helpers/auth-smoke-flow.js` — selectores login
- `dashboard/index.html` — `#dashboard-panel`, `#health-timestamp`, `#users-table-body`

## Validation Architecture

No automated API tests in this phase — verification via `npm run test:visual` and `node --check`.
