---
phase: 05-advanced-contracts-and-containers
plan: "01"
subsystem: api-documentation
tags: [openapi, swagger, yaml, docs, missions, contracts]
dependency_graph:
  requires: []
  provides:
    - api/openapi.yaml
    - docs/11-openapi.md
    - missions/08-explorar-openapi.md
  affects:
    - docs/00-indice.md
tech_stack:
  added: []
  patterns:
    - OpenAPI 3.0.3 YAML manual (no codegen, no new npm dependencies)
    - ASCII diagram pattern from docs/08-memoria-vs-persistencia.md
    - 4-section mission format from missions/06-restart-y-persistencia.md
key_files:
  created:
    - api/openapi.yaml
    - docs/11-openapi.md
    - missions/08-explorar-openapi.md
  modified:
    - docs/00-indice.md
decisions:
  - D-01 applied — YAML manual, zero new dependencies
  - D-03 applied — spec co-located at api/openapi.yaml
  - D-10 applied — index entries tagged (avanzado, opcional)
  - D-11 applied — missions 08/09 tagged (avanzado, opcional)
  - Server URL set to localhost:3100 (lab default), not 3000 (index.js default)
metrics:
  duration: "~20 minutes"
  completed: "2026-05-29"
  tasks: 2
  files: 4
---

# Phase 05 Plan 01: OpenAPI Spec and Educational Material Summary

**One-liner:** OpenAPI 3.0.3 manual spec covering 9 endpoints with literal error messages, plus conceptual doc and guided mission using Swagger Editor online.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Crear api/openapi.yaml con los 9 endpoints completos | 9fb400a | api/openapi.yaml (336 lines) |
| 2 | Crear docs/11-openapi.md, missions/08-explorar-openapi.md y actualizar docs/00-indice.md | dc7dc9f | docs/11-openapi.md, missions/08-explorar-openapi.md, docs/00-indice.md |

---

## Acceptance Criteria Status

### Tarea 1 — api/openapi.yaml

| Criterio | Estado |
|----------|--------|
| `openapi: "3.0.3"` presente | PASS |
| `url: http://localhost:3100` (no 3000) | PASS |
| 9 paths cubiertos (/, /health, /users, /users/{id}, /about, /time) | PASS |
| Schemas User, UserInput, Error definidos | PASS |
| `El parámetro ":id" debe ser un número entero.` literal | PASS (3 apariciones) |
| `Usuario no encontrado.` literal | PASS (4 apariciones) |
| `El campo "name" es obligatorio y debe ser texto.` literal | PASS (2 apariciones) |
| `$ref: "#/components/schemas/User"` presente | PASS (10+ apariciones) |
| 9+ `summary:` (una por operación) | PASS (14 apariciones, incluye subsecciones) |
| Sin caracteres tab | PASS |
| 150+ líneas | PASS (336 líneas) |

### Tarea 2 — Material educativo

| Criterio | Estado |
|----------|--------|
| docs/11-openapi.md existe y tiene 80+ líneas | PASS (155 líneas) |
| docs/11-openapi.md empieza con `# OpenAPI` sin frontmatter | PASS |
| docs/11-openapi.md contiene `editor.swagger.io` | PASS |
| docs/11-openapi.md referencia `Misión 08` | PASS |
| docs/11-openapi.md tiene diagrama ASCII con `paths` y `components` | PASS |
| docs/11-openapi.md tiene tabla `| Situación |` | PASS |
| missions/08-explorar-openapi.md tiene 4 secciones H2 | PASS (Objetivo, Pasos, Resultado esperado, Reto extra) |
| missions/08-explorar-openapi.md contiene `editor.swagger.io` | PASS |
| missions/08-explorar-openapi.md contiene `curl http://localhost:3100/users/abc` | PASS |
| Reto extra termina con pregunta reflexiva (`?`) | PASS (2 preguntas) |
| docs/00-indice.md contiene `11-openapi.md` con `(avanzado, opcional)` | PASS |
| docs/00-indice.md contiene `12-docker.md` con `(avanzado, opcional)` | PASS |
| docs/00-indice.md contiene `missions/08-explorar-openapi.md` | PASS |
| docs/00-indice.md contiene `missions/09-arrancar-con-docker.md` | PASS |
| docs/00-indice.md contiene `## Misiones avanzadas` | PASS |
| Count `(avanzado, opcional)` >= 6 | PASS (6 apariciones) |

---

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-01 | YAML manual, sin dependencias npm nuevas | El alumno aprende a leer un contrato como documento, no a auto-generarlo |
| D-03 | api/openapi.yaml co-ubicado con el backend | Estándar habitual en proyectos Express |
| server-url | localhost:3100 en lugar del default 3000 | El lab siempre arranca con PORT=3100; la spec debe reflejar el uso real, no el default del código |
| D-10/D-11 | Entradas y misiones avanzadas con etiqueta `(avanzado, opcional)` | El alumno principiante puede omitirlas conscientemente; no se crea índice separado |

---

## Deviations from Plan

None — plan executed exactly as written. The spec covers all 9 endpoints (including /about and /time as recommended by RESEARCH.md open question 2). Error messages are copied literally from api/index.js. The index update follows the exact pattern specified in 05-PATTERNS.md.

---

## Known Stubs

None. The spec is a documentation file — all fields contain real values derived from api/index.js. No placeholder content.

---

## Threat Flags

None. This plan creates only documentation files (api/openapi.yaml, docs/11-openapi.md, missions/08-explorar-openapi.md) and updates docs/00-indice.md. No new network endpoints, auth paths, or file access patterns were introduced.

T-05-01-02 (Tampering — spec vs code divergence) is mitigated: all error messages verified against api/index.js lines 49, 53, 118, 124, 152, 218.

---

## Self-Check: PASSED

- api/openapi.yaml exists: FOUND
- docs/11-openapi.md exists: FOUND
- missions/08-explorar-openapi.md exists: FOUND
- docs/00-indice.md updated: FOUND
- Commit 9fb400a exists: FOUND
- Commit dc7dc9f exists: FOUND
