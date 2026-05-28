# Phase 3: API Tests and Quality Fixes - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase añade tests automáticos a la API Express y resuelve deuda técnica de baja complejidad que actualmente debilita la confianza del alumno.

En scope:
- Suite de tests con `node:test` (runner nativo Node 22) + `supertest` cubriendo health, users listing, CRUD, y validación.
- Aislamiento de tests de persistencia mediante archivo de fixtures separado (`api/data/users.test.json`) y variable de entorno `DATA_FILE`.
- Fix de `parseUserId()`: rechazar strings como `1abc` consistentemente.
- Limpieza de metadata en `api/package.json` (QUAL-01).
- Script `dev` con nodemon (QUAL-02).
- Documentación de comandos de validación en `api/README.md` (QUAL-05).

Fuera de scope:
- Tests de dashboard/frontend — valor educativo no justificado aún.
- Mocking de `fs/promises` — el aislamiento se hace con archivo de fixtures real.
- Verificación de archivo en disco desde los tests — solo comportamiento HTTP.
- Nuevas dependencias más allá de `supertest`.

</domain>

<decisions>
## Implementation Decisions

### Framework y runner de tests

- **D-01:** Framework: `node:test` (runner nativo de Node 22, sin instalar runner externo) + `supertest` (1 dependencia nueva de desarrollo justificada: enseña el patrón estándar de tests HTTP para APIs Express). La combinación es la más didáctica: cero magia de framework, sintaxis `request(app).get('/health').expect(200)` muy legible para principiantes.
- **D-02:** Estructura de archivos: `api/index.test.js` — fichero único junto al código que testea. El alumno ve de un vistazo qué fichero testea a cuál. Patrón habitual en proyectos Express sencillos.
- **D-03:** Estilo de tests: Arrange-Act-Assert con comentarios explicativos (`// Arrange`, `// Act`, `// Assert`). Hace explícita la estructura para el alumno que lee el test por primera vez.

### Aislamiento de persistencia

- **D-04:** Los tests usan un archivo de fixtures separado `api/data/users.test.json` como fuente de datos. La ruta del archivo de datos se configura con la variable de entorno `DATA_FILE`. En `beforeEach`, el test copia la semilla al archivo de test. En `afterEach`, lo limpia. El archivo real `api/data/users.json` nunca se toca durante los tests.
- **D-05:** Los tests solo comprueban comportamiento HTTP: códigos de estado y JSON bodies. No leen el archivo en disco para verificar que se escribió. Más rápidos y menos frágiles. El alumno puede abrir el archivo manualmente para ver el resultado si le interesa.

### Fix de parseUserId

- **D-06:** Fix: reemplazar `Number.parseInt(value, 10)` por `Number(value)` con comprobación `Number.isInteger(id) && id > 0`. `Number('1abc')` devuelve `NaN`; `Number.parseInt('1abc', 10)` devuelve `1`. El fix lleva un comentario inline explicando la diferencia, y la decisión se registra en `NOTEBOOK.md` como error real resuelto en Fase 3.
- **D-07:** Tests de validación de IDs: los 3 casos clave — `GET /users/1abc` → 400, `GET /users/0` → 400, `GET /users/abc` → 400. Mínimo necesario para documentar que el fix funciona y enseñar los tres tipos de ID inválido.

### Calidad (QUAL-01, QUAL-02, QUAL-05)

- **D-08:** Metadata de `api/package.json`: `name: 'edf-lab-api'`, descripción educativa (`'API REST educativa para EDF Lab — enseña Express, JSON y CRUD a principiantes'`), author del propietario del proyecto. El campo `keywords` también se actualiza para reflejar el carácter educativo.
- **D-09:** Script nodemon: añadir `"dev": "nodemon index.js"` a `scripts` en `api/package.json`. Nodemon ya está instalado en `devDependencies`. Enseña la diferencia entre `npm start` (arranque estático) y `npm run dev` (hot-reload durante desarrollo).
- **D-10:** Comandos de validación documentados en `api/README.md` en una sección dedicada `## Comprobaciones y tests`, con `node --check index.js`, `npm audit --audit-level=high`, `npm test`, y `npm run dev`.

### Claude's Discretion

- Organización interna de `api/index.test.js` (orden de suites, agrupación de casos): Claude elige la estructura más didáctica.
- Mensaje de error HTTP 400 para IDs inválidos: mantener el patrón existente en español.
- Contenido exacto de la semilla en `api/data/users.test.json`: puede ser la misma semilla que `users.json` o un subconjunto más pequeño.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Direction
- `.planning/PROJECT.md` — Valor central, audiencia (principiantes), restricciones (sin dependencias innecesarias, claridad didáctica).
- `.planning/REQUIREMENTS.md` — Requisitos TEST-01..05 y QUAL-01..03, QUAL-05 que esta fase debe satisfacer.
- `.planning/ROADMAP.md` — Goal, success criteria y plan split de Phase 3.

### Codebase Actual
- `api/index.js` — Entrypoint completo: `parseUserId()` a corregir, `module.exports = app` ya presente (Supertest-compatible), todos los route handlers.
- `api/package.json` — Scripts actuales, dependencies, devDependencies. `supertest` se añade aquí como devDependency.
- `.planning/codebase/TESTING.md` — Estado actual de tests (ninguno), patrones sugeridos, ubicación prevista.
- `.planning/codebase/CONCERNS.md` — Deuda técnica a resolver en esta fase: metadata, nodemon, parseUserId.
- `.planning/codebase/CONVENTIONS.md` — Naming, estilo de código, patrones de error.

### Contexto de Fase Anterior
- `.planning/phases/02-file-persistence/02-CONTEXT.md` — Explica el patrón DATA_FILE / `loadUsers()` / `saveUsers()`. Los tests deben respetar esa arquitectura para aislar persistencia.

### Learning Material
- `NOTEBOOK.md` — Destino obligatorio para el fix de `parseUserId` y decisiones de testing.
- `api/README.md` — Donde se documenta la sección de comprobaciones y tests (QUAL-05).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `module.exports = app` al final de `api/index.js` (antes de `startServer()`): ya está, Supertest puede importarlo directamente.
- `parseUserId()`: función a corregir. Líneas 32-35. Cambio mínimo.
- `validateUserPayload()`: sin cambios, pero sus casos de error deben estar cubiertos por tests.
- `findUserIndexById()`: sin cambios.

### Established Patterns
- Mensajes de error en español: `{ "error": "..." }`. Los tests deben `expect` estos mensajes.
- Guard clauses con return temprano en route handlers: tests pueden confiar en que el flujo de error es consistente.
- `async/await` en todo: tests con `supertest` también son async, se integra de forma natural.
- Variable de entorno para ruta del archivo de datos: habrá que añadir soporte en `api/index.js` para `process.env.DATA_FILE || 'data/users.json'`.

### Integration Points
- `api/index.js` línea donde se define la ruta del archivo de datos (`'data/users.json'` hardcoded): cambiar a `process.env.DATA_FILE || 'data/users.json'` para habilitar el aislamiento de tests.
- `api/package.json` scripts: añadir `test` real y `dev`.
- `api/data/`: crear `users.test.json` como fixture de tests (no se incluye en `.gitignore`; puede incluirse como seed de test).

</code_context>

<specifics>
## Specific Ideas

- El comentario en el fix de `parseUserId` debe explicar en 1-2 líneas la diferencia entre `Number.parseInt('1abc', 10)` → `1` y `Number('1abc')` → `NaN`. Es la pieza educativa más valiosa de este fix.
- La sección de tests en `api/README.md` debe explicar qué se comprueba con cada comando, no solo listarlo, para que el alumno entienda la diferencia entre `node --check` (sintaxis), `npm audit` (seguridad) y `npm test` (comportamiento).
- El archivo `api/data/users.test.json` puede incluirse en git como fixture — igual que `users.json` se incluye como seed.

</specifics>

<deferred>
## Deferred Ideas

- Módulo separado `api/persistence.js`: mencionado en Fase 2 como deferred. Sigue deferred — la Fase 3 no toca la arquitectura del archivo.
- Coverage de código con `--experimental-coverage` de Node: interesante, pero añade complejidad al output de tests. Deferred a fases posteriores.
- Tests del dashboard (Playwright, Puppeteer): fuera de scope para este lab en la fase actual.
- Mock de `fs/promises` con `node:test` mock API: técnicamente posible pero más complejo que el enfoque de archivo de fixtures. Deferred.

</deferred>

---

*Phase: 03-api-tests-and-quality-fixes*
*Context gathered: 2026-05-28*
