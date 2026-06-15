# Phase 26: Fundación E2E Playwright (vanilla) — Context

**Created:** 2026-06-14  
**Status:** Locked for planning

## Objetivo

El operador ejecuta `npm run test:e2e` desde la raíz y Playwright levanta API `:3100` + dashboard vanilla `:5173` sin tmux manual. Un smoke Chromium recorre gate → login → tabla con datos → logout → gate, con autenticación real (sin `AUTH_DISABLED`).

## Alcance (in)

- Playwright en raíz: `e2e/` + `@playwright/test` devDependency en `package.json` raíz
- Config `e2e/playwright.config.js` con **dos** `webServer` (API + `python3 -m http.server 5173`)
- Smoke `e2e/tests/auth-smoke.vanilla.spec.js` (selectores `getByRole` / `getByLabel`)
- Scripts raíz: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `playwright:install`
- `.gitignore` de artefactos Playwright; BD E2E aislada `api/data/e2e.users.db`
- Entorno seguro E2E: `ADMIN_*` / `E2E_OPERATOR_*`, `LOGIN_RATE_LIMIT_MAX` elevado, sin `AUTH_DISABLED`
- Sección E2E mínima en `docs/10-tests.md` (QA-E2E-05)
- Job CI interino `e2e-smoke` vanilla (QA-CI-04); suite triple dashboard → fase 27

## Fuera de alcance (deferred)

- Smoke React `:5174` y Vue `:5175` → fase 27 (QA-E2E-03, QA-E2E-04, QA-CI-02)
- Job `test-postgres` obligatorio en PR → fase 28
- Matriz CI completa + Mission 16 + NOTEBOOK v2.0 → fase 29
- `storageState` / bypass de login UI
- Cambios obligatorios en `api/index.js` o `dashboard/app.js`

## Decisiones bloqueadas

| ID | Decisión |
|----|----------|
| D-01 | Playwright en raíz `e2e/`, no `e2e/package.json` aislado |
| D-02 | Config CommonJS `e2e/playwright.config.js` |
| D-03 | `webServer`: 2 entradas (API + vanilla python :5173) |
| D-04 | SQLite E2E: `DB_FILE=data/e2e.users.db`; sin `DATABASE_URL` |
| D-05 | Auth E2E: login UI; **sin** `AUTH_DISABLED`; **sin** `storageState` default |
| D-06 | Credenciales: `E2E_OPERATOR_EMAIL`/`PASSWORD` en spec; mismos valores en `ADMIN_*` del webServer |
| D-07 | Rate limit E2E: `LOGIN_RATE_LIMIT_MAX=1000` (o env override) |
| D-08 | Specs en `e2e/tests/`; Chromium only |
| D-09 | Job `e2e-smoke` vanilla en fase 26 (interino antes de triple dashboard en 27) |

## Requisitos

QA-E2E-01, QA-E2E-02, QA-E2E-05, QA-CI-04

## Referencias

- `.planning/phases/26-fundaci-n-e2e-playwright-vanilla/RESEARCH.md`
- `.planning/phases/26-fundaci-n-e2e-playwright-vanilla/PATTERNS.md`
- `dashboard/index.html`, `dashboard/app.js`, `api/test-auth-helpers.js`
