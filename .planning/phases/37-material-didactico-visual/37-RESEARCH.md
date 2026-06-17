# Phase 37: Material didáctico visual - Research

**Date:** 2026-06-17  
**Scope:** Planificar entregables didácticos de v2.2 (misión, docs, notebook) sobre la base técnica ya validada en fases 34–36.

## Findings

1. El repositorio sigue una plantilla clara para misiones (`objetivo`, `requisitos`, `pasos`, `resultado esperado`, `reto extra`, `enlaces`) visible en misiones 16 y 17.
2. `docs/10-tests.md` ya contiene base sólida de regresión visual local y CI (fase 35/36), por lo que en fase 37 conviene ampliar sin duplicar contenido.
3. `docs/00-indice.md` y `README.md` tienen rutas avanzadas por milestone (v2.0/v2.1) pero aún no una ruta explícita para v2.2 Visual Regression.
4. `NOTEBOOK.md` tiene patrón estable de fricciones reales (síntoma, causa, solución, aprendizaje), ideal para cumplir `DOCS-06`.
5. Fricciones reales verificables de v2.2 disponibles:
   - Playwright sin Chromium en sandbox efímero (`Executable doesn't exist`).
   - Necesidad de máscaras/threshold para evitar flakes visuales.
   - Diagnóstico vía artefactos del job `visual-regression` en PR.

## Risks

- **Riesgo de duplicación documental:** repetir información entre misión y doc.
  - Mitigación: misión centrada en práctica, docs como referencia conceptual.
- **Riesgo de drift técnico:** documentar comandos distintos a los reales.
  - Mitigación: referenciar directamente `package.json`, `ci.yml`, `docs/10-tests.md`.
- **Riesgo de fricciones “inventadas”:** incumplir principio didáctico del proyecto.
  - Mitigación: usar solo incidentes ya observados en fases 34–36.

## Recommended execution split

- **Plan 37-01 (wave 1):** crear `missions/18-visual-regression-playwright.md`, ampliar `docs/10-tests.md`, actualizar rutas en `docs/00-indice.md` y `README.md`.
- **Plan 37-02 (wave 2):** añadir sección v2.2 en `NOTEBOOK.md` con 2+ fricciones reales y cerrar trazabilidad del milestone.

## Verification baseline for phase 37

- `DOCS-05`: existencia y calidad de Mission 18.
- `DOCS-04`: cobertura de setup/update/flake en `docs/10-tests.md`.
- `DOCS-06`: sección NOTEBOOK v2.2 con 2+ casos reales y aprendizaje.

---

*Research completed for planning phase 37.*
