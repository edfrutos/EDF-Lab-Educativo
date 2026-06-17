# Phase 36: CI visual regression - Research

**Date:** 2026-06-17  
**Scope:** Definir un plan ejecutable para integrar regresión visual en CI sin romper los gates funcionales existentes.

## Findings

1. La CI actual ya tiene un patrón estable para jobs Playwright multi-dashboard en `.github/workflows/ci.yml` (`e2e-smoke` y `e2e-postgres`), incluyendo:
   - `actions/setup-node@v4` con cache de lockfiles múltiples.
   - `npm ci` en raíz y subproyectos (`api`, `dashboard-react`, `dashboard-vue`).
   - Instalación explícita de navegadores Playwright.
2. La suite visual local ya está consolidada (`npm run test:visual`) con tres proyectos Chromium y baselines commiteadas.
3. Aún no existe script dedicado para CI visual (`test:visual:ci`) ni upload de artefactos de mismatch.
4. `test:e2e`, `test:e2e:ci` y `test:e2e:pg` están en uso activo y no deben alterarse en fase 36.

## Risks

- **Drift de CI setup:** duplicar pasos con diferencias sutiles puede generar flakes.
  - Mitigación: clonar patrón de instalación de `e2e-smoke`.
- **Diagnóstico insuficiente en PR:** fallo de snapshot sin artefactos dificulta revisión.
  - Mitigación: subir `test-results`/`playwright-report` al menos en fallo.
- **Acoplamiento accidental con E2E funcional:** modificar scripts/proyectos existentes.
  - Mitigación: agregar job y script nuevos, sin editar contratos actuales.

## Recommended execution split

- **Plan 36-01 (wave 1):** wiring de CI (`visual-regression`) + script `test:visual:ci` + smoke local de sintaxis/ejecución.
- **Plan 36-02 (wave 2):** artefactos de diff, documentación del flujo PR baseline update, verificación de no regresión en contratos CI existentes.

## Verification baseline for phase 36

- `npm run test:visual` (3 passed) confirmado en verificación de fase 35.
- `npm run test:e2e` (6 passed) confirmado en verificación de fase 35.

---

*Research completed for planning phase 36.*
