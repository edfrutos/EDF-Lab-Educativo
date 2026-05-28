---
phase: 04-learning-material-hardening
plan: "01"
subsystem: docs
tags: [glossary, documentation, educational-content]
dependency_graph:
  requires: []
  provides: [docs/09-glosario.md]
  affects: [docs/00-indice.md]
tech_stack:
  added: []
  patterns: [markdown-doc-no-frontmatter, cross-reference-links, executable-examples]
key_files:
  created:
    - docs/09-glosario.md
  modified: []
decisions:
  - "24 entries selected (plan minimum 20): all terms from the 4 suggested blocks included"
  - "Internal ordering: conceptual dependency order within each block (e.g., servidor before endpoint, fetch() before DOM)"
  - "CRUD entry uses a table for the 4 HTTP verb mappings — more scannable than prose for beginners"
  - "código HTTP entry uses a table for the 5 common status codes — clearer than inline list"
  - "---  horizontal rules added between entries within Backend/HTTP/API for visual breathing room given the density of that section"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-05-28"
  tasks_completed: 1
  tasks_total: 1
  files_created: 1
  files_modified: 0
---

# Phase 04 Plan 01: Glosario de términos del laboratorio Summary

Glosario Markdown nuevo con 24 entradas distribuidas en 4 bloques temáticos, cada una con definición breve, ejemplo ejecutable con `localhost:3100` y enlace cruzado al doc de contexto.

## Artefactos creados

| Archivo | Líneas | Entradas |
|---------|--------|---------|
| `docs/09-glosario.md` | 397 | 24 |

## Entradas por bloque

### Backend, HTTP y API (10 entradas)

`servidor`, `endpoint`, `puerto`, `request / response`, `código HTTP`, `JSON`, `CRUD`, `Express`, `CORS`, `módulo`

### Frontend y navegador (5 entradas)

`fetch()`, `DOM`, `origen`, `async / await`, `promesa`

### Persistencia y tests (5 entradas)

`memoria vs disco`, `fixture`, `suite de tests`, `Arrange-Act-Assert`, `beforeEach`

### Herramientas del entorno (4 entradas)

`Node.js`, `npm`, `nodemon`, `curl`

## Decisiones tomadas bajo "Claude's Discretion"

**Orden interno de entradas:** Se usó orden de dependencia conceptual dentro de cada bloque (por ejemplo: `servidor` → `endpoint` → `puerto` antes que `request/response`, que requiere entender los anteriores). No orden alfabético, ya que el bloque Backend tiene muchos términos y el orden didáctico facilita la lectura secuencial.

**Entradas con tabla en lugar de párrafo:** `código HTTP` y `CRUD` usan tablas Markdown porque presentan múltiples valores emparejados (código/significado, operación/verbo/endpoint). Para principiantes, la tabla es más escaneable que el texto corrido.

**Separadores `---` dentro de Backend/HTTP/API:** El bloque tiene 10 entradas, el más denso. Se añadieron separadores horizontales entre cada entrada para mejorar la legibilidad visual sin alterar la estructura jerárquica.

**Término `REST` omitido:** El plan lo listaba como sugerido pero no obligatorio. Se priorizaron los términos que aparecen literalmente en el código del laboratorio (Express, CORS, endpoint, módulo) sobre términos más teóricos como REST que no aparecen en los archivos fuente.

## Verificación de aceptación

| Criterio | Resultado |
|----------|-----------|
| `head -1 docs/09-glosario.md` = `# Glosario` | OK |
| 4 secciones `## ` con nombres exactos | OK (4/4) |
| `grep -c "^### "` >= 20 | OK (24) |
| `grep -c "localhost:3100"` > 0 | OK (12) |
| `grep -c "Ver más"` >= 4 | OK (24) |
| Enlace a `05-cors-explicado.md` | OK (2 ocurrencias: CORS y origen) |
| Enlace a `08-memoria-vs-persistencia.md` | OK (3 ocurrencias: memoria vs disco, fixture, beforeEach) |
| Sin frontmatter YAML | OK |
| Sin rutas `/Users/` hardcodeadas | OK |
| `wc -l` >= 80 | OK (397) |
| Todos los docs referenciados existen | OK (7/7) |

## Commits

| Tarea | Commit | Descripción |
|-------|--------|-------------|
| Tarea 1 | `00191ff` | feat(04-01): create docs/09-glosario.md with 4 thematic blocks |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 24 entries contain real definitions and executable examples using the lab API.

## Threat Flags

No new security surface introduced. The file is static Markdown documentation with no credentials, tokens, or absolute paths. Verified: all examples use `localhost:3100` and fictional data (`john@example.com`, `jane@example.com`). Cross-referenced doc targets all verified to exist.

## Self-Check: PASSED

- `docs/09-glosario.md` exists: FOUND
- Commit `00191ff` exists: FOUND
- 24 glossary entries confirmed
- All 7 cross-referenced docs exist
