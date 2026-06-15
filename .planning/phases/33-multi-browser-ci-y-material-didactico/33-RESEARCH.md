# Research: Phase 33 — Multi-browser CI y material didáctico

**Date:** 2026-06-15  
**Phase:** 33-multi-browser-ci-y-material-didactico  
**Requirements:** QA-ADV-04, DOCS-01, DOCS-02, DOCS-03

## RESEARCH COMPLETE

## Objetivo técnico

Cerrar v2.1 Advanced E2E: CI ejecuta la suite E2E en **Chromium y Firefox**, WebKit queda documentado para local, y el alumno tiene Mission 17 + NOTEBOOK v2.1 + matriz de navegadores en `docs/10-tests.md`.

## Estado actual (post fase 32)

| Pieza | Comportamiento |
|-------|----------------|
| `e2e/playwright.config.js` | 3 proyectos (`vanilla`, `react`, `vue`), solo `Desktop Chrome` en `use` |
| `npm run test:e2e` | 6 tests (smoke + CRUD × 3 dashboards) |
| CI `e2e-smoke` | `playwright install --with-deps chromium` |
| CI `e2e-postgres` | Chromium only (aceptable — QA-ADV-04 apunta a `e2e-smoke`) |
| Mission 16 | Smoke v2.0 (3 tests obsoleto en texto; actualizar referencias en 33-02) |
| NOTEBOOK | Sección v2.0; sin v2.1 |

## Opciones multi-browser

### A — Proyectos `{dashboard}-{browser}` en config (recomendado)

Duplicar los 3 proyectos actuales en 6: `vanilla-chromium`, `vanilla-firefox`, etc. Mismo `testMatch` y `baseURL`.

**Scripts:**
- `test:e2e` — solo `*-chromium` (6 tests, flujo local rápido sin regresión de coste)
- `test:e2e:ci` — chromium + firefox (12 tests) para job `e2e-smoke`
- `playwright:install:ci` — `chromium firefox`

**Pros:** Explícito, didáctico, sin matrix GHA. **Contras:** Config algo más larga.

### B — Matrix GHA `browser: [chromium, firefox]`

Dos runners, cada uno 6 tests.

**Pros:** Wall-clock menor. **Contras:** Doble install Playwright, más complejo para alumnos.

**Decisión:** Opción A — un job `e2e-smoke` con 12 tests; alineado con patrón actual (un job E2E, `workers: 1` en CI).

## WebKit (QA-ADV-04)

No en CI obligatorio. Añadir **un** proyecto opcional `vanilla-webkit` (smoke + CRUD vanilla) **solo documentado** — el alumno ejecuta:

```bash
npx playwright install webkit
npx playwright test --config=e2e/playwright.config.js --project=vanilla-webkit
```

No incluir webkit en `test:e2e:ci` ni en `playwright:install:ci`.

## Cambios CI

```yaml
# e2e-smoke
- run: npx playwright install --with-deps chromium firefox
- run: npm run test:e2e:ci
```

`e2e-postgres` **sin cambios** (Chromium) — Postgres ya tiene job propio; firefox en PG es post-v2.1.

## Mission 17 (DOCS-02)

Plantilla: `missions/16-smoke-e2e-playwright.md`. Enfoque:

- `npm run test:e2e` (6 tests CRUD+smoke Chromium)
- Depurar fallo en paso create/edit/delete con `--trace on` o UI mode
- Network tab + trace viewer Playwright
- Reto: `test:e2e:pg` o Firefox local

## NOTEBOOK v2.1 (DOCS-03)

Sección nueva con ≥2 entradas de fricción real v2.1, candidatas:

1. **API stale al cambiar SQLite ↔ Postgres** — `reuseExistingServer: true` local reutiliza API en `:3100` con backend incorrecto.
2. **CRUD en Postgres sin `test:db:prepare`** — `edf_lab_e2e` no existe.
3. **Firefox en macOS** — primera ejecución requiere `playwright install firefox`.

El ejecutor documenta las que reproduzca o conoce del desarrollo de fases 30–32.

## DOCS-01 — Matriz navegadores

Tabla en `docs/10-tests.md`:

| Contexto | Chromium | Firefox | WebKit |
|----------|----------|---------|--------|
| Local `test:e2e` | ✓ 6 tests | — | — |
| Local opt-in | — | `test:e2e:firefox` o proyecto | `vanilla-webkit` |
| CI `e2e-smoke` | ✓ | ✓ | doc only |
| CI `e2e-postgres` | ✓ | — | — |

## Archivos previstos

| Archivo | Cambio |
|---------|--------|
| `e2e/playwright.config.js` | Proyectos multi-browser + helper factory |
| `e2e/playwright.config.pg.js` | Mantener chromium-only (o importar factory sin firefox) |
| `package.json` | `test:e2e:ci`, `test:e2e:firefox`, `playwright:install:ci` |
| `.github/workflows/ci.yml` | e2e-smoke → install firefox + test:e2e:ci |
| `missions/17-crud-e2e-playwright.md` | Nueva misión |
| `docs/10-tests.md` | Matriz navegadores |
| `docs/00-indice.md` | Enlace Mission 17 |
| `NOTEBOOK.md` | Sección Advanced E2E (v2.1) |
| `README.md` | Mención multi-browser CI |

## Referencias

- `.planning/phases/32-e2e-contra-api-postgres/32-VERIFICATION.md`
- `e2e/playwright.config.js`
- Playwright docs: [projects](https://playwright.dev/docs/test-projects), [browsers](https://playwright.dev/docs/browsers)
