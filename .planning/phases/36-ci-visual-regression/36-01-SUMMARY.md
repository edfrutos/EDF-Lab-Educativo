---
phase: 36-ci-visual-regression
plan: 01
subsystem: ci
tags: [github-actions, playwright, visual-regression, chromium]
requires:
  - phase: 35-visual-multi-dashboard
    provides: suite visual estable en 3 dashboards
provides:
  - Job CI `visual-regression` dedicado
  - Script raíz `test:visual:ci`
affects: [phase-37, docs]
tech-stack:
  added: []
  patterns: [job aditivo sin romper contratos E2E existentes]
key-files:
  modified: [.github/workflows/ci.yml, package.json]
key-decisions:
  - "Visual CI queda en Chromium-only en fase 36."
  - "El job usa comando canónico `npm run test:visual:ci`."
patterns-established:
  - "CI visual aislado de test:e2e y e2e-postgres"
requirements-completed: [QA-VIS-04, QA-CI-06]
duration: 20min
completed: 2026-06-17
---

# Phase 36: CI visual regression — Plan 01 Summary

**Se añadió la base de integración visual en CI con un job dedicado y un script específico para ejecución reproducible en GitHub Actions.**

## Accomplishments
- Se creó el script `test:visual:ci` en `package.json` con los tres proyectos visuales Chromium.
- Se añadió el job `visual-regression` en `.github/workflows/ci.yml`.
- El nuevo job replica el patrón de instalación Playwright usado en CI (`npm ci` raíz/subproyectos + `playwright install --with-deps chromium`).
- Se mantuvieron intactos los jobs y scripts funcionales (`test:e2e*`).

## Verification
- `node -e` check script `test:visual:ci`
- `node -e` check presencia `visual-regression` y `npm run test:visual:ci` en CI
- `CI=true npm run test:visual:ci` → 3 passed

## Deviations from Plan

None - plan executed exactly as written.
