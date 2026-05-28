# Phase 4: Learning Material Hardening - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase completa, sincroniza y depura el material de aprendizaje para que un alumno principiante pueda seguir el laboratorio de principio a fin sin referencias rotas, numeración confusa, ni conceptos sin definir.

En scope:
- Glosario nuevo `docs/09-glosario.md` con los 4 bloques terminológicos del laboratorio.
- Doc de tests nuevo `docs/10-tests.md` que explica la suite construida en Fase 3.
- Actualización completa de `docs/00-indice.md` para incluir todos los docs nuevos y verificar paths.
- Renumeración de misiones en `missions/` para resolver el conflicto de `05-*` duplicado.
- Tres entradas nuevas en `NOTEBOOK.md` que documentan decisiones y bugs no triviales de Fases 2-3.

Fuera de scope:
- Nuevas misiones de cero (solo sincronización y renumeración del material existente).
- Cambios en código (`api/`, `dashboard/`) — solo material educativo.
- Doc de OpenAPI/Docker — Fase 5.
- Reescritura de docs conceptuales ya existentes — solo auditoría de sincronización.

</domain>

<decisions>
## Implementation Decisions

### Glosario (DOCS-01)

- **D-01:** Alcance del glosario: 4 bloques — Backend + HTTP + API (Express, servidor, endpoint, puerto, request/response, códigos HTTP, JSON, REST, CRUD), Frontend + browser (fetch(), DOM, CORS, origen, cabeceras, promesas, async/await), Persistencia + tests (memoria vs disco, archivo de datos, fixtures, test suite, Arrange-Act-Assert), Herramientas del entorno (Node.js, npm, nodemon, curl, puerto, variable de entorno).
- **D-02:** Formato de cada entrada: definición breve (2-4 líneas) + 1 ejemplo ejecutable (bloque de código o comando corto). Escaneable y útil sin ser un tutorial completo.
- **D-03:** Ubicación: archivo nuevo `docs/09-glosario.md`. Referenciado desde `docs/00-indice.md` como último capítulo del orden de lectura recomendado.

### Doc de tests (DOCS-02, DOCS-03)

- **D-04:** Ubicación: archivo nuevo `docs/10-tests.md`, capítulo independiente. Se referencia desde `docs/00-indice.md` después del glosario.
- **D-05:** Contenido del doc de tests: los 4 bloques completos —
  1. Por qué existen los tests (concepto: qué problema resuelven para principiantes).
  2. Cómo ejecutar y leer el output (`npm test`, interpretar pass/fail, `--test-force-exit`).
  3. Cómo está estructurado `api/index.test.js` (patrón Arrange-Act-Assert, `describe`/`it`, `beforeEach`/`afterEach`).
  4. Cómo añadir un test nuevo (guía breve con ejemplo para que el alumno pueda extender la suite).

### Sincronización de índice y misiones (DOCS-02, DOCS-04)

- **D-06:** Renumeración de misiones: `missions/05-restart-y-persistencia.md` → `06-restart-y-persistencia.md`; `missions/06-corrupcion-y-restauracion.md` → `07-corrupcion-y-restauracion.md`. Orden limpio: CRUD (01-05), Persistencia (06-07), Tests (08 futuro). Los títulos internos (`# Misión 05:`) se actualizan al número nuevo.
- **D-07:** Auditoría de `docs/00-indice.md`:
  - Añadir `08-memoria-vs-persistencia.md` al orden de lectura recomendado (entre `07-retos.md` y el glosario).
  - Añadir `09-glosario.md` al orden de lectura recomendado.
  - Añadir `10-tests.md` al orden de lectura recomendado.
  - Verificar que todos los paths mencionados en el índice apuntan a archivos que existen con el nombre correcto.

### NOTEBOOK.md (DOCS-05)

- **D-08:** Añadir 3 entradas nuevas al NOTEBOOK:
  1. **`loadUsers()` en `beforeEach`**: el bug de Fase 3 donde `users[]` estaba vacío porque `require.main` previene `startServer()` al importar el módulo para tests — y cómo se resolvió exportando `loadUsers`.
  2. **La decisión de `require.main` en `index.js`**: por qué existe el guard `if (require.main === module)` y cuál es la diferencia entre ejecutar un módulo directamente vs importarlo.
  3. **Observación de Fase 2 — datos en memoria vs reinicio**: el experimento que motivó la persistencia (arrancar API, crear usuario, reiniciar, ver que desaparece). El momento "aha" pedagógico.
- **D-09:** Criterio documentado para futuras entradas en NOTEBOOK: NOTEBOOK = errores reales + decisiones no obvias (si sorprende o fue un bug, va aquí). docs/ = conceptos enseñables desde cero (explicaciones generales sin necesidad de historia).

### Claude's Discretion

- Número exacto de términos en el glosario: Claude elige los más relevantes dentro de los 4 bloques, priorizando los que aparecen en el laboratorio.
- Longitud exacta de los ejemplos ejecutables: se ajustan a que sean útiles sin extenderse más de 3-5 líneas de código.
- Orden interno de las entradas del glosario: alfabético dentro de cada bloque, o por orden de aparición en el laboratorio — Claude elige la más didáctica.
- Contenido exacto de las entradas nuevas de NOTEBOOK: Claude construye las entradas con el patrón existente (contexto, decisión/error, aprendizaje).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Direction
- `.planning/PROJECT.md` — Valor central, audiencia (principiantes), restricciones (claridad didáctica, ejemplos ejecutables).
- `.planning/REQUIREMENTS.md` — Requisitos DOCS-01..05 que esta fase debe satisfacer.
- `.planning/ROADMAP.md` — Goal y success criteria de Phase 4; planes 04-01 y 04-02.

### Material Educativo Existente (leer antes de tocar)
- `docs/00-indice.md` — Índice y orden de lectura actual. Se actualiza en esta fase.
- `docs/08-memoria-vs-persistencia.md` — Doc de Fase 2 aún no indexado; necesita entrada en 00-indice.md.
- `missions/05-mejorar-dashboard.md` — Misión de Fase 1; conserva numeración 05.
- `missions/05-restart-y-persistencia.md` — Colisiona con anterior; se renombra a 06.
- `missions/06-corrupcion-y-restauracion.md` — Se renombra a 07.
- `NOTEBOOK.md` — Destino de las 3 entradas nuevas. Leer el formato existente antes de añadir.

### Fases Anteriores (contexto para entradas de NOTEBOOK)
- `.planning/phases/02-file-persistence/02-CONTEXT.md` — Contexto de la arquitectura de persistencia.
- `.planning/phases/03-api-tests-and-quality-fixes/03-CONTEXT.md` — Contexto del require.main guard, DATA_FILE y loadUsers.
- `api/index.test.js` — Suite completa; docs/10-tests.md la explica.
- `api/index.js` — Contiene require.main guard y loadUsers exportado; referencia para entradas NOTEBOOK.

### Convenciones y Misión Format
- `.planning/codebase/CONVENTIONS.md` — Estilo de código y patrones.
- `missions/01-arrancar-api.md` — Referencia del formato de misión: objetivo, pasos, resultado esperado, reto extra.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/00-indice.md` — Plantilla de entrada en uso (numeración, descripción, enlace). Seguir el mismo patrón para las entradas nuevas.
- `missions/01-arrancar-api.md` — Formato canónico de misión: `## Objetivo`, `## Pasos`, `## Resultado esperado`, `## Reto extra (opcional)`.
- `NOTEBOOK.md` — Entradas existentes tienen estructura: fecha + título, `### Contexto`, `### Decisión/Error`, `### Aprendizaje`.

### Established Patterns
- Los docs en `docs/` usan bloques de código ejecutables para todos los ejemplos — el glosario debe seguir este patrón.
- Mensajes de error en español en la API (`{ "error": "..." }`) — si el glosario menciona códigos HTTP, los ejemplos deben usar la API del lab.
- Los docs no tienen frontmatter YAML — solo Markdown puro con `# Título` como primer elemento.

### Integration Points
- `docs/00-indice.md`: añadir 3 entradas nuevas (08, 09, 10) en la sección "Orden recomendado" y en la lista "Documentos".
- `missions/`: renombrar 2 archivos y actualizar los títulos internos `# Misión 0X:`.
- `NOTEBOOK.md`: añadir 3 secciones nuevas siguiendo el formato existente.

</code_context>

<specifics>
## Specific Ideas

- El glosario debe enlazar de vuelta a los docs donde cada término aparece en contexto. Por ejemplo: "CORS → ver `docs/05-cors-explicado.md`".
- La entrada de `require.main` en NOTEBOOK puede incluir el snippet de código antes/después, igual que la entrada de `parseUserId`. Ese patrón visual funciona bien para principiantes.
- `docs/10-tests.md` puede referenciar `api/index.test.js` con bloques de código reales (extractos del archivo), no código inventado.

</specifics>

<deferred>
## Deferred Ideas

- Misión de tests nueva (el alumno escribe su propio test) — interesante pero requiere más trabajo de scaffolding que la Fase 4 tiene presupuesto. Deferred a Fase 5 o posterior.
- Actualizar root `README.md` para reflejar el nombre y estado actual del lab ("Express API Demo Learning Lab" es el título obsoleto) — posiblemente abordable dentro del plan 04-02 de auditoría, pero si el planner lo considera fuera de scope, puede diferirse.

</deferred>

---

*Phase: 04-learning-material-hardening*
*Context gathered: 2026-05-28*
