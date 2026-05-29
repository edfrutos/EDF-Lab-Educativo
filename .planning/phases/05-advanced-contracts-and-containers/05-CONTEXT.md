# Phase 5: Advanced Contracts and Containers - Context

**Gathered:** 2026-05-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase añade dos capas de material avanzado OPCIONALES sobre el lab existente:

1. **OpenAPI/Swagger** — Especificación formal del contrato de la API en `api/openapi.yaml`, escrita a mano, sin nuevas dependencias de producción.
2. **Docker** — Dockerfile para la API con imagen `node:22-alpine`, con scripts npm como alias. El alumno puede arrancar la API con Docker como alternativa al `npm start` habitual, sin reemplazarlo.

En scope:
- `api/openapi.yaml` — spec OpenAPI 3.x completa (todos los endpoints: GET /, GET /health, GET /users, POST /users, GET /users/:id, PUT /users/:id, DELETE /users/:id).
- `docs/11-openapi.md` — doc conceptual que explica qué es OpenAPI, cómo leer el YAML y por qué existe un contrato de API.
- `api/Dockerfile` + `api/.dockerignore` — imagen Alpine del API.
- Scripts `docker:build` y `docker:start` en `api/package.json`.
- `docs/12-docker.md` — doc conceptual que explica qué es Docker, por qué se usa y cómo arranca la API en un contenedor.
- `missions/08-explorar-openapi.md` — misión: explorar la spec con un editor y con Swagger Editor online.
- `missions/09-arrancar-con-docker.md` — misión: construir la imagen y arrancar la API con Docker.
- Entradas `(avanzado, opcional)` en `docs/00-indice.md` para los docs 11, 12 y las misiones 08, 09.

Fuera de scope:
- Swagger UI en Express (swagger-ui-express, swagger-jsdoc) — sin nuevas dependencias.
- Docker Compose — queda para una fase futura si hay demanda.
- Multi-contenedor (API + dashboard en Compose) — demasiado complejo para este nivel.
- Generación automática de la spec desde JSDoc — el alumno aprende a LEER y ESCRIBIR OpenAPI, no a auto-generarla.
- Base de datos en contenedor — ADV-03 confirma que la DB queda diferida.

</domain>

<decisions>
## Implementation Decisions

### OpenAPI — spec y tooling (ADV-01)

- **D-01:** Formato: YAML manual (`api/openapi.yaml`). Sin swagger-ui-express ni swagger-jsdoc. Cero dependencias nuevas. El alumno aprende a leer un contrato de API como un documento.
- **D-02:** Cobertura: todos los endpoints actuales — `GET /`, `GET /health`, `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`. La spec completa es más útil como referencia y enseña que un contrato cubre toda la API.
- **D-03:** Ubicación: `api/openapi.yaml`, co-ubicado con el código que describe. Estándar habitual en proyectos Express.
- **D-04:** Doc conceptual: `docs/11-openapi.md`. Explica qué es OpenAPI, cómo leer el YAML (campos clave: `info`, `paths`, `requestBody`, `responses`, `components/schemas`) y por qué los equipos usan specs en lugar de solo README.

### Docker — setup y framing (ADV-02)

- **D-05:** Alcance: `api/Dockerfile` + `api/.dockerignore`. Sin Docker Compose. El alumno ve que el mismo código Express funciona en un contenedor sin cambiar ni una línea de `index.js`.
- **D-06:** Imagen base: `node:22-alpine`. Imagen oficial ligera (~150MB vs ~900MB de la completa). El doc explica por qué Alpine es estándar y qué pierde en comodidad de depuración.
- **D-07:** Scripts en `api/package.json`: añadir `"docker:build"` y `"docker:start"`. Patrón consistente con `npm start` / `npm run dev`. El alumno usa `npm run docker:build` y `npm run docker:start` igual que el resto de scripts.
- **D-08:** Framing de coexistencia: `docs/12-docker.md` abre con un aviso explícito — "¿Ya sabes arrancar la API con `npm start`? Bien. Este documento te enseña otra forma — con Docker. La primera forma sigue funcionando igual."
- **D-09:** Doc conceptual: `docs/12-docker.md`. Cubre qué es un contenedor, qué es una imagen, diferencia entre imagen y contenedor, el flujo `build → run → logs → stop`.

### Material avanzado y visibilidad

- **D-10:** `docs/00-indice.md` marca las entradas 11 (openapi) y 12 (docker) con `(avanzado, opcional)` para que el alumno principiante pueda omitirlas conscientemente. No se crea sección separada — se mantiene el índice unificado.
- **D-11:** Las misiones 08 y 09 también se añaden al índice con la misma etiqueta `(avanzado, opcional)`.

### Misiones avanzadas (DOCS-04)

- **D-12:** Misión 08: `missions/08-explorar-openapi.md` — El alumno abre `api/openapi.yaml` en VS Code y en Swagger Editor online (`editor.swagger.io`), identifica un endpoint, entiende cómo los campos `summary`, `parameters` y `responses` corresponden a los comportamientos que ya conoce de la API. Formato estándar: objetivo, pasos, resultado esperado, reto extra.
- **D-13:** Misión 09: `missions/09-arrancar-con-docker.md` — El alumno ejecuta `npm run docker:build`, observa el proceso de build, luego `npm run docker:start`, comprueba `GET /health` con curl o el dashboard. Formato estándar: objetivo, pasos, resultado esperado, reto extra.

### Claude's Discretion

- Versión exacta de OpenAPI en la spec (3.0.x vs 3.1.0): Claude elige la más apropiada y documentada. Se recomienda 3.0.3 por compatibilidad amplia con herramientas online.
- Contenido exacto de los campos `info` (title, description, version) en el YAML.
- Orden y agrupación de paths en el YAML: por recurso (/ y /health primero, luego /users).
- Estructura exacta de las instrucciones `docker run` en el script `docker:start` (puerto, nombre del contenedor).
- Número de pasos en cada misión: Claude ajusta para que sean completables en 10-15 minutos.
- Contenido del `api/.dockerignore` (node_modules, data/users.json si corresponde, etc.).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Direction
- `.planning/PROJECT.md` — Valor central, audiencia principiantes, restricciones (dependencias solo si hay valor educativo claro, ejemplos ejecutables obligatorios).
- `.planning/REQUIREMENTS.md` — ADV-01 (OpenAPI), ADV-02 (Docker sin reemplazar startup básico), ADV-03 (DB diferida).
- `.planning/ROADMAP.md` — Goal, success criteria y planes 05-01, 05-02 de Phase 5.

### Material Educativo Existente (leer antes de tocar)
- `docs/00-indice.md` — Índice actual. Esta fase añade entradas 11, 12 y misiones 08, 09 con etiqueta `(avanzado, opcional)`.
- `missions/01-arrancar-api.md` — Formato canónico de misión: `## Objetivo`, `## Pasos`, `## Resultado esperado`, `## Reto extra (opcional)`.
- `NOTEBOOK.md` — Si la implementación produce bugs no obvios o decisiones técnicas interesantes, registrarlos aquí.

### Código Base de la API
- `api/index.js` — Entrypoint completo. La spec OpenAPI debe cubrir TODOS los endpoints definidos aquí. Dockerfile debe arrancar este archivo.
- `api/package.json` — Scripts existentes. Añadir `docker:build` y `docker:start` aquí.

### Fases Anteriores
- `.planning/phases/04-learning-material-hardening/04-CONTEXT.md` — Establece el patrón de docs (Markdown puro, sin frontmatter, ejemplos ejecutables) y la etiqueta de misiones.
- `.planning/phases/03-api-tests-and-quality-fixes/03-CONTEXT.md` — Establece restricción de dependencias (`supertest` fue la única excepción justificada).

### Convenciones
- `.planning/codebase/CONVENTIONS.md` — Naming, estilo de código, mensajes de error en español.
- `.planning/codebase/STACK.md` — Stack actual para entender qué introduce Docker en el contexto.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `api/index.js` — Todos los endpoints ya definidos y funcionando. La spec OpenAPI los describe tal como están; no hay que modificar el código para hacer la spec.
- `api/package.json` — Scripts existentes: `start`, `dev`, `test`. Los scripts `docker:build` y `docker:start` siguen el mismo patrón kebab-case.
- `docs/00-indice.md` — Plantilla de entrada: `- [Nº. Título](ruta.md) — descripción breve`. Seguir el mismo patrón para entradas 11 y 12.
- `missions/01-arrancar-api.md` — Formato canónico con 4 secciones H2.

### Established Patterns
- Docs en Markdown puro, sin frontmatter YAML.
- Mensajes de error de la API en español (`{ "error": "..." }`). La spec OpenAPI debe reflejar estos mensajes en los ejemplos de `responses`.
- Los docs existentes usan bloques de código ejecutables para todos los ejemplos — los docs de OpenAPI y Docker deben seguir este patrón.
- Dependencias solo si el valor educativo es claro. Aquí no se añaden dependencias de producción nuevas.

### Integration Points
- `docs/00-indice.md`: añadir 2 entradas de docs (11, 12) y 2 de misiones (08, 09), todas con `(avanzado, opcional)`.
- `api/package.json`: añadir 2 scripts (`docker:build`, `docker:start`) bajo los existentes.
- `api/`: añadir `Dockerfile` y `.dockerignore`.
- `missions/`: añadir `08-explorar-openapi.md` y `09-arrancar-con-docker.md`.
- `docs/`: añadir `11-openapi.md` y `12-docker.md`.

</code_context>

<specifics>
## Specific Ideas

- La spec OpenAPI puede incluir un campo `example` en cada response body para que el alumno vea exactamente qué JSON devuelve la API — muy didáctico comparado con solo los `$schema`.
- El doc `docs/12-docker.md` puede incluir un diagrama ASCII simple `[Host] --puerto 3100--> [Contenedor Docker] --> [api/index.js]` para visualizar el port mapping.
- La misión de Docker puede incluir como reto extra: "¿Qué ocurre si ejecutas el contenedor con `-p 3200:3100` y abres el dashboard que apunta a 3100? ¿Por qué no funciona?" — enseña port mapping de forma activa.
- `api/.dockerignore` debe excluir `node_modules/`, `data/users.json` (para que el contenedor arranque con datos limpios, o con los del COPY según se decida), y archivos de test.

</specifics>

<deferred>
## Deferred Ideas

- Docker Compose (API + dashboard en contenedores separados) — interesante para enseñar multi-servicio, deferred a una fase futura si hay demanda.
- Swagger UI interactiva en Express (`swagger-ui-express`) — añade valor visual pero introduce dependencias. Deferred: el alumno puede usar Swagger Editor online como alternativa sin deps.
- Generación automática de spec desde JSDoc — didácticamente interesante para proyectos más grandes, fuera de scope para este lab.
- Publicación de la imagen Docker en Docker Hub — deferred a fases de deployment.
- ADV-03 confirmado: base de datos (SQLite, PostgreSQL) diferida hasta que la persistencia con archivo esté bien entendida.

</deferred>

---

*Phase: 05-advanced-contracts-and-containers*
*Context gathered: 2026-05-29*
