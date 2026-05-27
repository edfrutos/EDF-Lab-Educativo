---
phase: 02-file-persistence
plan: "03"
subsystem: docs
tags: [documentation, missions, persistence, memory-vs-disk, educational]
dependency_graph:
  requires: [02-02]
  provides: [PERS-04, PERS-05]
  affects: [docs/08-memoria-vs-persistencia.md, missions/05-restart-y-persistencia.md, missions/06-corrupcion-y-restauracion.md]
tech_stack:
  added: []
  patterns: [conceptual-doc-with-diagrams, executable-mission-format]
key_files:
  created:
    - docs/08-memoria-vs-persistencia.md
    - missions/05-restart-y-persistencia.md
    - missions/06-corrupcion-y-restauracion.md
  modified: []
decisions:
  - "Mensajes [warn] e [info] de la misión 06 copiados literalmente de api/index.js para garantizar coherencia con el código"
  - "Formato de misiones replica exactamente missions/04-romper-y-arreglar-cors.md (H1 → H2 Objetivo → H2 Pasos → H2 Resultado esperado → H2 Reto extra)"
  - "El doc conceptual omite frontmatter YAML, siguiendo la convención de docs/03-api-express.md"
metrics:
  duration: "~5 minutos"
  completed: "2026-05-27T19:57:00Z"
  tasks_completed: 2
  files_modified: 3
---

# Phase 02 Plan 03: Documentación conceptual y misiones de persistencia

Tres archivos de contenido educativo creados: un documento conceptual con diagramas antes/después y dos misiones ejecutables para observar la persistencia en acción.

## Objective

Crear la documentación conceptual y las dos misiones ejecutables que hacen visible y enseñable el cambio de persistencia implementado en los planes 01 y 02.

## Tasks Completed

### Tarea 1: Crear docs/08-memoria-vs-persistencia.md

**Archivo creado:** `docs/08-memoria-vs-persistencia.md`

**Contenido:**
- Diagrama textual del flujo de arranque antes (array en RAM, sin archivo) y después (loadUsers() → archivo → listeners)
- Sección `api/data/users.json` con ejemplo JSON real y explicación de `nextId`
- Tabla de comparación directa (4 filas: crear/reiniciar, abrir archivo, consola al arrancar, archivo corrupto)
- Tres ejemplos ejecutables: ver archivo mientras API corre, comprobar persistencia tras restart, observar recuperación ante corrupción
- Referencias explícitas a Misión 05 y Misión 06
- Sin frontmatter YAML, siguiendo formato `docs/03-api-express.md`

**Commit:** `7a6d05f`

### Tarea 2: Crear missions/05-restart-y-persistencia.md y missions/06-corrupcion-y-restauracion.md

**Archivos creados:**
- `missions/05-restart-y-persistencia.md` — 6 pasos ejecutables con curl + restart
- `missions/06-corrupcion-y-restauracion.md` — 5 pasos ejecutables con corrupción de archivo + restart

**Formato replicado:** idéntico a `missions/04-romper-y-arreglar-cors.md` (H1 título → H2 Objetivo → H2 Pasos → H2 Resultado esperado → H2 Reto extra).

**Mensajes de consola verificados:** los textos citados en misión 06 son idénticos a los de `api/index.js`:
- `[warn] data/users.json corrupto — restaurando semilla` (línea 71 de index.js)
- `[info] data/users.json no encontrado — creando con semilla` (línea 74 de index.js)

**Commit:** `d58a685`

## Verification Results

| Check | Result |
|-------|--------|
| `docs/08-memoria-vs-persistencia.md` existe | PASS |
| Contiene `## Antes: estado en memoria` | PASS |
| Contiene `## Después: estado en disco` | PASS |
| Contiene `## Comparación directa` | PASS |
| Contiene `## Ejemplos ejecutables` | PASS |
| Contiene `Misión 05` | PASS |
| Contiene `Misión 06` | PASS |
| Contiene `api/data/users.json` (ruta completa) | PASS |
| Contiene `PORT=3100` | PASS |
| Contiene `nextId` con explicación | PASS |
| NO tiene frontmatter YAML | PASS |
| `missions/05` — 4 H2 requeridos | PASS |
| `missions/05` — `PORT=3100 npm start` | PASS |
| `missions/05` — `api/data/users.json` | PASS |
| `missions/06` — 4 H2 requeridos | PASS |
| `missions/06` — mensaje `[warn]` exacto | PASS |
| `missions/06` — mensaje `[info]` exacto (reto extra) | PASS |
| Mensajes misión 06 = mensajes index.js | PASS |
| Ningún archivo empieza con `---` | PASS |

## Deviations from Plan

Ninguna. El plan se ejecutó exactamente como estaba escrito.

## Commits

| Hash | Descripción | Tarea |
|------|-------------|-------|
| `7a6d05f` | docs(02-03): add memoria vs persistencia conceptual doc | Tarea 1 |
| `d58a685` | docs(02-03): add missions 05 and 06 for persistence exercises | Tarea 2 |

## Known Stubs

Ninguno. Los tres archivos son documentación estática completa; no hay datos dinámicos ni referencias vacías.

## Threat Surface Scan

Sin superficie nueva. Los tres archivos son markdown estático sin endpoints, rutas de archivo ni operaciones de E/S. Los comandos destructivos de misión 06 (`echo >`, `rm`) son intencionados como ejercicio de aprendizaje y operan sobre un archivo de datos de demo en el entorno local del alumno.

## Self-Check: PASSED
