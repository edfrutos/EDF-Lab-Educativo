# Phase 4: Learning Material Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 04-learning-material-hardening
**Areas discussed:** Glosario: alcance y formato, Doc de tests en docs/, Sincronización del índice y misiones, NOTEBOOK.md: qué documentar de Fases 1-3

---

## Glosario: alcance y formato

| Option | Description | Selected |
|--------|-------------|----------|
| Backend + HTTP + API | Express, servidor, endpoint, puerto, request/response, códigos HTTP, JSON, REST, CRUD | ✓ |
| Frontend + browser | fetch(), DOM, CORS, origen, cabeceras, promesas, async/await | ✓ |
| Persistencia + tests | memoria vs disco, archivo de datos, fixtures, test suite, Arrange-Act-Assert | ✓ |
| Herramientas del entorno | Node.js, npm, nodemon, curl, puerto, variable de entorno | ✓ |

**User's choice:** Todos los bloques — cobertura completa.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Definición breve + 1 ejemplo ejecutable | 2-4 líneas + bloque de código corto | ✓ |
| Solo definición (1-2 líneas) | Rápido de leer, sin ejemplo | |
| Entrada larga con contexto y referencias | Tipo Wikipedia | |

**User's choice:** Definición breve + 1 ejemplo ejecutable.
**Notes:** El formato con ejemplo evita que el alumno tenga que buscar en otro lado cómo se usa el concepto.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nuevo docs/09-glosario.md | Archivo propio, referenciado desde índice | ✓ |
| Sección al final de docs/00-indice.md | Todo en un sitio | |
| docs/00-glosario.md (antes del índice) | Primera lectura | |

**User's choice:** Nuevo docs/09-glosario.md.

---

## Doc de tests en docs/

| Option | Description | Selected |
|--------|-------------|----------|
| Nuevo docs/10-tests.md | Capítulo independiente | ✓ |
| Sección en docs/03-api-express.md | Ligado a la API | |
| Solo README.md de api/ (ya actualizado) | Mínima intervención | |

**User's choice:** Nuevo docs/10-tests.md.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Cómo ejecutar y leer el output | npm test, interpretar pass/fail | ✓ |
| Por qué existen los tests (concepto) | Qué problema resuelven | ✓ |
| Cómo está estructurado index.test.js | AAA, describe/it, beforeEach/afterEach | ✓ |
| Cómo añadir un test nuevo | Guía breve extensible | ✓ |

**User's choice:** Los 4 bloques completos.

---

## Sincronización del índice y misiones

| Option | Description | Selected |
|--------|-------------|----------|
| Renumerar misiones de Fase 2 en adelante | 05-restart → 06, 06-corrupcion → 07 | ✓ |
| Dejar nombres de archivo tal cual, corregir solo títulos | Evita renombrar | |
| Solo actualizar el índice sin renombrar | Mínima intervención | |

**User's choice:** Renumerar. Orden limpio: CRUD (01-05), Persistencia (06-07).

---

| Option | Description | Selected |
|--------|-------------|----------|
| Añadir 08-memoria-vs-persistencia.md al índice | El doc existe pero no está indexado | ✓ |
| Añadir 09-glosario.md al índice | El glosario nuevo necesita entrada | ✓ |
| Añadir 10-tests.md al índice | El doc de tests también necesita entrada | ✓ |
| Revisar que todos los paths sean correctos | Verificación completa | ✓ |

**User's choice:** Los 4 cambios completos.

---

## NOTEBOOK.md: qué documentar de Fases 1-3

| Option | Description | Selected |
|--------|-------------|----------|
| El porqué del loadUsers() en beforeEach | Bug real de Fase 3 | ✓ |
| La decisión de require.main en index.js | Decisión arquitectural no obvia | ✓ |
| Observación de Fase 2: datos en memoria vs reinicio | Momento pedagógico de la persistencia | ✓ |
| Nada nuevo — lo que ya está es suficiente | | |

**User's choice:** Las 3 entradas nuevas.

---

| Option | Description | Selected |
|--------|-------------|----------|
| NOTEBOOK = errores reales + decisiones no obvias; docs/ = conceptos generales | Criterio diferenciador | ✓ |
| NOTEBOOK = solo bugs | Más estricto | |
| Claude lo decide según el contexto | Sin regla rígida | |

**User's choice:** Regla clara: NOTEBOOK = bugs reales + decisiones que sorprenden.

---

## Claude's Discretion

- Número y selección exacta de términos dentro de los 4 bloques del glosario
- Longitud exacta de ejemplos ejecutables en el glosario
- Orden interno de entradas dentro de cada bloque
- Estructura detallada de las entradas nuevas de NOTEBOOK (siguiendo el patrón existente)

## Deferred Ideas

- Misión nueva donde el alumno escribe su propio test
- Actualización del root README.md (posiblemente en 04-02 de auditoría, si entra en scope)
