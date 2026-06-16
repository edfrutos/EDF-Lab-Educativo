# Phase 34: Fundación visual vanilla - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 34-Fundación visual vanilla
**Areas discussed:** Qué capturar, Estabilidad de datos, Granularidad del snapshot, Estructura de config

---

## Qué capturar

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard post-login | Gate oculto, tabla visible, mismo estado que auth-smoke | ✓ |
| Pantalla de login | Gate visible antes de autenticar | |
| Ambos estados | Login gate + dashboard (2 snapshots) | |

| Option | Description | Selected |
|--------|-------------|----------|
| Solo zona principal | Excluir header con timestamp/health si fluctúa | ✓ |
| Página completa | Incluye header, footer y toda la vista | |
| Solo sección usuarios | Formulario + tabla CRUD | |

| Option | Description | Selected |
|--------|-------------|----------|
| Reutilizar auth-smoke-flow | Login UI, sin duplicar selectores | ✓ |
| Login mínimo inline | Solo fill + click en visual-flow | |
| Posponer storageState | Evaluar en fase 36 | |

| Option | Description | Selected |
|--------|-------------|----------|
| 1 snapshot principal | Suficiente para validar la fundación | ✓ |
| 2 snapshots | Login + dashboard | |
| 3 snapshots | Login + dashboard + formulario CRUD abierto | |

**User's choice:** Post-login dashboard, main content region, reuse auth patterns, one primary snapshot.
**Notes:** Aligns visual baseline with existing smoke auth stable state.

---

## Estabilidad de datos

| Option | Description | Selected |
|--------|-------------|----------|
| Enmascarar zonas dinámicas | Health timestamp, contadores, filas variables | ✓ |
| Confiar en seed fijo | e2e.users.db sin mask | |
| Seed fijo + mask | Máxima estabilidad | |

| Option | Description | Selected |
|--------|-------------|----------|
| Enmascarar tbody tabla | Evita flakes por filas CRUD de otras suites | ✓ |
| No enmascarar | Confiar en seed + John Doe | |
| Excluir tabla | Solo layout estático | |

| Option | Description | Selected |
|--------|-------------|----------|
| Desactivar animaciones | CSS o equivalente en spec | ✓ |
| Solo networkidle | Sin tocar CSS | |
| Ambos | Animations + carga completa | |

| Option | Description | Selected |
|--------|-------------|----------|
| maxDiffPixelRatio: 0.01 | Tolerancia mínima anti-aliasing | ✓ |
| maxDiffPixelRatio: 0 | Cero tolerancia | |
| maxDiffPixelRatio: 0.05 | Más tolerante | |

**User's choice:** Mask dynamic zones + table body, disable animations, threshold 0.01.

---

## Granularidad del snapshot

| Option | Description | Selected |
|--------|-------------|----------|
| Locator zona principal | main o #dashboard-panel | ✓ |
| Locator sección usuarios | Card formulario+tabla | |
| Full page viewport fijo | 1280×720 página completa | |

| Option | Description | Selected |
|--------|-------------|----------|
| 1280×720 | Alineado con Desktop Chrome | ✓ |
| 1440×900 | Pantalla más grande | |
| Heredar proyecto | Sin override | |

| Option | Description | Selected |
|--------|-------------|----------|
| e2e/__snapshots__/visual.vanilla.spec.js/ | Junto a tests | ✓ |
| e2e/baselines/vanilla/ | Carpeta dedicada | |
| Ruta default Playwright | Sin template custom | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nombre por estado | dashboard-post-login.png | ✓ |
| Naming automático Playwright | Default filenames | |
| Sufijo plataforma explícito | -chromium-darwin | |

**User's choice:** `#dashboard-panel` locator, 1280×720, `e2e/__snapshots__/`, state-based naming.

---

## Estructura de config

| Option | Description | Selected |
|--------|-------------|----------|
| Extender playwright.config.js | Proyecto vanilla-chromium-visual | ✓ |
| Config dedicada visual.js | Separación total | |
| Base compartida + dos configs | Over-engineering | |

| Option | Description | Selected |
|--------|-------------|----------|
| npm run test:visual | Solo vanilla Chromium | ✓ |
| test:visual + test:visual:update | Dos scripts | |
| Sin script npm | Solo npx documentado | |

| Option | Description | Selected |
|--------|-------------|----------|
| Reutilizar quad webServer | API + 3 dashboards | ✓ |
| Solo API + vanilla | Más rápido | |
| Quad completo test:e2e | Igual que e2e | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nuevo visual-flow.js | prepareVisualState + masks | ✓ |
| Extender auth-smoke-flow | Mezcla responsabilidades | |
| Todo inline en spec | Sin helper | |

**User's choice:** Extend main config, `test:visual`, quad webServer, new `visual-flow.js` helper.

---

## Claude's Discretion

- CSS approach for animation disable.
- Additional masks if verification reveals new dynamic fields.
- Exact `snapshotPathTemplate` string.

## Deferred Ideas

- Login gate snapshot (future phase if needed).
- `storageState` shortcut (phase 36).
- Dedicated `test:visual:update` script (optional in 34-02).
- Minimal dual webServer (rejected for consistency).
