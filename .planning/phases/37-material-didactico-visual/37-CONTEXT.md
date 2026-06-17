# Phase 37: Material didáctico visual - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir la puerta de regresión visual (fases 34–36) en material didáctico accionable para alumnado: misión práctica, ampliación documental y registro de fricciones reales en NOTEBOOK. No se amplía cobertura técnica de tests en esta fase; se empaqueta y enseña lo ya implementado.

</domain>

<decisions>
## Implementation Decisions

### Objetivos didácticos mínimos
- **D-01:** Crear **Mission 18** enfocada en visual regression end-to-end (ejecución, fallo intencional, lectura de diff, baseline update).
- **D-02:** Mission 18 debe mantener la plantilla didáctica del repo: **objetivo, pasos, resultado esperado, reto extra**.
- **D-03:** Ampliar `docs/10-tests.md` solo en su bloque visual para cubrir setup, update y troubleshooting visual (local + CI).
- **D-04:** Actualizar rutas de aprendizaje en `docs/00-indice.md` y `README.md` para que v2.2 quede navegable desde entrada principal.

### NOTEBOOK y aprendizaje de errores reales
- **D-05:** Añadir sección **v2.2 Visual Regression** en `NOTEBOOK.md` con **al menos 2 fricciones reales** ocurridas en fases 34–36.
- **D-06:** Las fricciones deben documentar: síntoma, causa, solución, aprendizaje (patrón consistente con entradas previas).
- **D-07:** Incluir explícitamente el patrón de entorno observado: instalación de Chromium en entorno efímero/sandbox para Playwright.

### Alcance y no-objetivos
- **D-08:** No tocar contratos funcionales de CI/E2E ni estructura de tests visuales existentes; fase 37 es documentación + misión.
- **D-09:** Mantener compatibilidad con tres dashboards (`:5173`, `:5174`, `:5175`) y job `visual-regression` como referencia canónica.
- **D-10:** Mantener foco educativo: claridad y reproducibilidad por encima de cobertura técnica adicional.

### Claude's Discretion
- Nivel de detalle de Mission 18 (mínimo viable vs guía extensa) siempre que sea ejecutable.
- Ubicación exacta de nuevos bloques en README/índice mientras la ruta v2.2 quede visible.
- Selección de las 2+ fricciones más didácticas entre los incidentes reales de fase 34–36.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and requirements
- `.planning/ROADMAP.md` — Phase 37 goal, planes 37-01/37-02, criterios de éxito
- `.planning/REQUIREMENTS.md` — `DOCS-04`, `DOCS-05`, `DOCS-06`
- `.planning/phases/36-ci-visual-regression/36-VERIFICATION.md` — baseline técnica validada de CI visual

### Fuentes funcionales para material didáctico
- `docs/10-tests.md` — estado actual de visual local + visual CI
- `.github/workflows/ci.yml` — job `visual-regression`
- `package.json` — `test:visual`, `test:visual:ci`
- `e2e/tests/visual.vanilla.spec.js`
- `e2e/tests/visual.react.spec.js`
- `e2e/tests/visual.vue.spec.js`
- `e2e/helpers/visual-flow.js`

### Navegación y aprendizaje
- `docs/00-indice.md`
- `README.md`
- `NOTEBOOK.md`
- `missions/16-smoke-e2e-playwright.md`
- `missions/17-crud-e2e-playwright.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable didactic assets
- Ya existe sección visual en `docs/10-tests.md` con flujo local y CI base.
- Las suites visuales y CI están verificadas en fase 36, por lo que la misión puede centrarse en uso y diagnóstico.
- Misiones 16/17 ya establecen el tono pedagógico para Playwright y debugging.

### Gap to close
- No existe `missions/18-...` para visual regression.
- `NOTEBOOK.md` aún no tiene sección explícita de fricciones v2.2 visuales.
- Rutas principales (`README.md`, `docs/00-indice.md`) no exponen todavía una “ruta v2.2 visual regression” consolidada.

### Integration points
- Nuevas piezas documentales deben referenciar comandos reales (`test:visual`, `test:visual:ci`) y evitar drift con CI/workflow.
- El material de fase 37 debe apuntar a artefactos que ya existen (snapshots, reportes, workflow).

</code_context>

<specifics>
## Specific Ideas

- Misión 18 con ejercicio guiado de “romper y arreglar baseline”: cambio visual mínimo en dashboard + update intencional de snapshot.
- Entradas NOTEBOOK candidatas:
  - Playwright en sandbox sin Chromium (`Executable doesn't exist`).
  - Diferencias visuales por datos dinámicos (máscaras/threshold).
  - Revisión de artefactos en PR cuando falla `visual-regression`.

</specifics>

<deferred>
## Deferred Ideas

- Visual regression multi-browser en CI (QA-VIS-05) fuera de v2.2.
- Automatización de aprobación de baselines por etiquetas PR.
- Material audiovisual o demo grabada de revisión de snapshot diffs.

</deferred>

---

*Phase: 37-Material didáctico visual*
*Context gathered: 2026-06-17*
