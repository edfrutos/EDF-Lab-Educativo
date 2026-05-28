# Phase 3: API Tests and Quality Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 03-api-tests-and-quality-fixes
**Areas discussed:** Framework de tests, Aislamiento de persistencia, Fix de parseUserId + cobertura, Alcance de calidad (QUAL-01/02/05)

---

## Framework de tests

| Option | Description | Selected |
|--------|-------------|----------|
| node:test + supertest | node:test nativo Node 22 + supertest para llamadas HTTP. 1 dep justificada: enseña patrón estándar de tests de API Express. | ✓ |
| node:test puro (zero deps) | Solo el runner nativo con assert. Más verboso: hay que levantar el servidor manualmente con fetch(). | |
| Jest | Framework completo con describe/it/expect. 1 dep pesada pero familiar para quienes conocen tutoriales Node. | |

**User's choice:** node:test + supertest
**Notes:** Coherente con el principio de "sin deps innecesarias" al usar el runner nativo, pero justifica supertest como herramienta estándar con valor educativo claro.

---

### Estructura de archivos de test

| Option | Description | Selected |
|--------|-------------|----------|
| api/index.test.js | Fichero único junto al código. El alumno ve de un vistazo qué testea a qué. | ✓ |
| api/tests/api.test.js | Carpeta tests/ separada. Más ordenado si crece, enseña separación fuente/tests. | |

**User's choice:** api/index.test.js

---

### Estilo de tests

| Option | Description | Selected |
|--------|-------------|----------|
| Con comentarios AAA | // Arrange / // Act / // Assert explícito. Hace visible la estructura para principiantes. | ✓ |
| Código limpio sin comentarios | Más compacto, más cercano a proyectos reales. Menos andamiaje didáctico. | |

**User's choice:** Con comentarios AAA

---

## Aislamiento de persistencia

| Option | Description | Selected |
|--------|-------------|----------|
| Archivo de test separado con beforeEach/afterEach | api/data/users.test.json + env DATA_FILE. El archivo real nunca se toca. Enseña fixtures y env vars. | ✓ |
| Reset del archivo real entre tests | El beforeEach reescribe users.json con semilla. Simple, sin env vars. Modifica el archivo real. | |
| Solo tests HTTP, ignorar persistencia | Solo verificar códigos de estado y bodies. Evita el problema de aislamiento. | |

**User's choice:** Archivo de test separado con beforeEach/afterEach

---

### Profundidad de verificación

| Option | Description | Selected |
|--------|-------------|----------|
| Solo HTTP | Códigos de estado y JSON bodies. Rápidos, menos frágiles. El alumno lee el archivo manualmente. | ✓ |
| HTTP + verificación de archivo | Algunos tests leen el JSON en disco post-mutación. Más didáctico pero más lento y frágil. | |

**User's choice:** Solo HTTP

---

## Fix de parseUserId + cobertura

### Documentación del fix

| Option | Description | Selected |
|--------|-------------|----------|
| Comentario inline + NOTEBOOK.md | El fix lleva comentario explicando Number.parseInt vs Number(). Se registra en NOTEBOOK.md. | ✓ |
| Solo el fix, sin comentarios extra | Más conciso, el alumno investiga si quiere saber el porqué. | |

**User's choice:** Comentario inline + NOTEBOOK.md

---

### Casos límite de IDs

| Option | Description | Selected |
|--------|-------------|----------|
| Los 3 casos clave | '1abc' → 400, '0' → 400, 'abc' → 400. Mínimo necesario para documentar el fix y enseñar los tres tipos. | ✓ |
| Solo el caso del bug original | '1abc' → 400. Lo mínimo que demuestra que el bug está resuelto. | |
| Suite completa | '1abc', 'abc', '0', '-1', '999', vacío, decimal. Exhaustivo pero posiblemente excesivo. | |

**User's choice:** Los 3 casos clave

---

## Alcance de calidad (QUAL-01/02/05)

### Metadata package.json (QUAL-01)

| Option | Description | Selected |
|--------|-------------|----------|
| edf-lab-api con descripción educativa | name: 'edf-lab-api', descripción didáctica, author del propietario. | ✓ |
| educational-api-lab | Nombre más genérico. | |
| Claude elige | Lo que mejor encaje con README y repo. | |

**User's choice:** edf-lab-api con descripción educativa

---

### Script nodemon (QUAL-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, añadir script 'dev' | "dev": "nodemon index.js". Enseña hot-reload vs arranque estático. | ✓ |
| No, eliminar nodemon | Quitar de devDependencies. Reduce deps. El alumno puede añadirlo como ejercicio. | |

**User's choice:** Sí, con script 'dev'

---

### Documentación de validación (QUAL-05)

| Option | Description | Selected |
|--------|-------------|----------|
| En api/README.md | Sección 'Comprobaciones y tests' con todos los comandos. Donde el alumno ya busca. | ✓ |
| En CLAUDE.md del proyecto | Ya existe sección similar. Añadir npm test allí también. | |
| En ambos sitios | api/README.md para el alumno, CLAUDE.md para el agente/desarrollador. | |

**User's choice:** En api/README.md

---

## Claude's Discretion

- Organización interna de api/index.test.js (orden de suites, agrupación de casos)
- Mensaje exacto de error HTTP 400 para IDs inválidos (mantener patrón en español)
- Contenido exacto de api/data/users.test.json (misma semilla o subconjunto)

## Deferred Ideas

- Módulo separado api/persistence.js — deferred desde Fase 2, sigue deferred
- Coverage con --experimental-coverage — complejidad no justificada aún
- Tests de dashboard (Playwright) — fuera de scope
- Mock de fs/promises — más complejo que el enfoque de fixtures; deferred
