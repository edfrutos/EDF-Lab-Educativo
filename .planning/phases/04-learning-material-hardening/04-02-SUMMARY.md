---
phase: 04-learning-material-hardening
plan: "02"
subsystem: docs
tags: [documentation, missions, notebook, educational-content, tests]
dependency_graph:
  requires: [04-01]
  provides: [docs/10-tests.md, missions/06-restart-y-persistencia.md, missions/07-corrupcion-y-restauracion.md]
  affects: [docs/00-indice.md, docs/08-memoria-vs-persistencia.md, NOTEBOOK.md]
tech_stack:
  added: []
  patterns: [markdown-doc-no-frontmatter, cross-reference-links, AAA-test-pattern, notebook-variant-b]
key_files:
  created:
    - docs/10-tests.md
    - missions/06-restart-y-persistencia.md
    - missions/07-corrupcion-y-restauracion.md
  modified:
    - docs/00-indice.md
    - docs/08-memoria-vs-persistencia.md
    - NOTEBOOK.md
decisions:
  - "Used git mv for mission renames so git tracks them as renames (not delete+add)"
  - "NOTEBOOK entries follow Variante B for the two technical fixes and Variante A for the pedagogical observation"
  - "docs/10-tests.md uses exactly 4 h2 sections as required by D-05; code excerpts copied verbatim from api/index.test.js"
  - "D-09 contributor criterion added at end of NOTEBOOK after the three new entries"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-05-28"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 3
---

# Phase 04 Plan 02: Learning Material Synchronization Summary

Renamed missions 05→06 and 06→07 with updated titles, created docs/10-tests.md with 4 content blocks and real code excerpts, updated docs/00-indice.md with all 10 documents in both sections, and appended 3 NOTEBOOK entries plus the D-09 contributor criterion.

## Artefactos creados

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `docs/10-tests.md` | 167 | Suite de tests: por qué existen, cómo ejecutar, estructura AAA, cómo añadir |
| `missions/06-restart-y-persistencia.md` | 45 | Renombrado desde 05; título actualizado a Misión 06 |
| `missions/07-corrupcion-y-restauracion.md` | 46 | Renombrado desde 06; título actualizado a Misión 07 |

## Artefactos modificados

| Archivo | Cambio |
|---------|--------|
| `docs/00-indice.md` | Añadidas entradas 8, 9 y 10 en "Orden recomendado" y en "Documentos" |
| `docs/08-memoria-vs-persistencia.md` | Referencias actualizadas: Misión 05→06 (línea 128) y Misión 06→07 (línea 141) |
| `NOTEBOOK.md` | Appended 3 entradas nuevas + sección "Criterio para nuevas entradas" (D-09) |

## Tarea 1: Misiones renumeradas

- `git mv missions/05-restart-y-persistencia.md missions/06-restart-y-persistencia.md` — git registra como rename
- `git mv missions/06-corrupcion-y-restauracion.md missions/07-corrupcion-y-restauracion.md` — ídem
- Títulos internos actualizados: línea 1 de cada archivo
- `docs/08-memoria-vs-persistencia.md`: dos sustituciones exactas, sin referencias antiguas residuales

Verificado: `grep "Misión 05.*Restart\|Misión 06.*Corrup" docs/08-memoria-vs-persistencia.md` — sin salida.

## Tarea 2: docs/10-tests.md

Los 4 bloques de D-05 están presentes:

| Bloque | Sección | Contenido notable |
|--------|---------|-------------------|
| 1 | Por qué existen los tests | Justificación conceptual para principiantes |
| 2 | Cómo ejecutar la suite | `npm test`, output representativo, lectura de ✔/✗, nota `--test-force-exit` |
| 3 | Cómo está estructurado index.test.js | 3 extractos reales (setup, beforeEach/afterEach, POST AAA) |
| 4 | Cómo añadir un test nuevo | Ejemplo GET / con patrón AAA completo |

Los 3 extractos de código se copiaron literalmente desde `api/index.test.js`, incluyendo todos los comentarios originales (`// CRÍTICO:`, `// Arrange:`, `// Necesario porque...`).

## Tarea 3: Índice y NOTEBOOK

**docs/00-indice.md:** Cada documento nuevo (08, 09, 10) tiene exactamente 2 entradas — una en "Orden recomendado de lectura" y otra en "Documentos". Total: 10 documentos listados, todos apuntan a archivos que existen en disco.

**NOTEBOOK.md:** 3 entradas nuevas añadidas al final:

| Entrada | Tipo | Identificador |
|---------|------|---------------|
| loadUsers() en beforeEach | Variante B — Fix técnico | `## Fase 3 — Fix: loadUsers() necesario en beforeEach` |
| Guard require.main | Variante B — Decisión | `## Fase 3 — Decisión: guard require.main === module` |
| Datos en memoria tras restart | Variante A — Observación | `## 2026-05-27 · Observación: los datos en memoria desaparecen` |

El criterio D-09 (`NOTEBOOK = errores reales + decisiones no obvias`) está documentado como sección final del NOTEBOOK.

## Verificación de aceptación

| Criterio | Resultado |
|----------|-----------|
| missions/06-restart-y-persistencia.md existe | OK |
| missions/07-corrupcion-y-restauracion.md existe | OK |
| missions/05-restart-y-persistencia.md NO existe | OK |
| `head -1 missions/06*` = `# Misión 06: restart y persistencia` | OK |
| `head -1 missions/07*` = `# Misión 07: corrupción y restauración` | OK |
| No quedan referencias a "Misión 05 Restart" ni "Misión 06 Corrup" en docs/08 | OK |
| docs/10-tests.md existe con `# Tests de la API` en línea 1 | OK |
| `grep -c "^## " docs/10-tests.md` = 4 | OK |
| docs/10-tests.md >= 60 líneas (167) | OK |
| Extractos reales copiados (beforeEach, DATA_FILE, Arrange) | OK |
| `--test-force-exit` documentado | OK |
| docs/00-indice.md tiene 2 entradas para 08, 09 y 10 | OK (6 total) |
| Todos los paths del índice apuntan a archivos reales | OK (10/10) |
| NOTEBOOK: entrada loadUsers fix | OK |
| NOTEBOOK: entrada require.main guard | OK |
| NOTEBOOK: entrada datos en memoria desaparecen | OK |
| NOTEBOOK: D-09 criterio documentado | OK |
| Sin rutas absolutas `/Users/` en NOTEBOOK nuevas entradas | OK |

## Commits

| Tarea | Commit | Descripción |
|-------|--------|-------------|
| Tarea 1 | `3d57703` | feat(04-02): renumber missions 05→06 and 06→07, update cross-references |
| Tarea 2 | `99b37a6` | feat(04-02): create docs/10-tests.md with 4 content blocks |
| Tarea 3 | `c510065` | feat(04-02): update docs/00-indice.md with docs 08-10, append 3 NOTEBOOK entries |

## Deviations from Plan

None — plan executed exactly as written. `git mv` was used as recommended by the threat model (T-04-02-01) to ensure git tracks the operations as renames rather than delete+add.

## Known Stubs

None — all files contain complete, working content. docs/10-tests.md uses real code excerpts from api/index.test.js. All cross-references point to existing files.

## Threat Flags

No new security surface introduced. All files are static Markdown documentation. Verified: no absolute paths (`/Users/`) in NOTEBOOK new entries, no credentials or tokens anywhere, all example data uses fictional addresses (john@example.com, jane@example.com, prueba@example.com).

## Self-Check: PASSED

- `docs/10-tests.md` exists: FOUND
- `missions/06-restart-y-persistencia.md` exists: FOUND
- `missions/07-corrupcion-y-restauracion.md` exists: FOUND
- Commit `3d57703` exists: FOUND
- Commit `99b37a6` exists: FOUND
- Commit `c510065` exists: FOUND
- All 10 docs in index exist on disk: VERIFIED
- No old mission numbering references in docs/08: VERIFIED
