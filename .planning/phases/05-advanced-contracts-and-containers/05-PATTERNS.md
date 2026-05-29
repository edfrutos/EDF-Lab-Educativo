# Phase 5: Advanced Contracts and Containers - Pattern Map

**Mapped:** 2026-05-29
**Files analyzed:** 9 (7 nuevos + 2 modificados)
**Analogs found:** 7 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `api/openapi.yaml` | config/spec | request-response (documentation) | `api/index.js` (endpoints reales) | data-source — la spec describe los contratos de `index.js` |
| `api/Dockerfile` | config/infra | batch (build → run) | ninguno — primer Dockerfile del proyecto | no analog |
| `api/.dockerignore` | config/infra | — | ninguno | no analog |
| `api/package.json` (modificar) | config | — | `api/package.json` actual (líneas 6-10) | exact — ampliar sección `scripts` |
| `docs/11-openapi.md` | doc conceptual | — | `docs/08-memoria-vs-persistencia.md` | role-match (doc conceptual con diagramas ASCII + ejemplos ejecutables) |
| `docs/12-docker.md` | doc conceptual | — | `docs/08-memoria-vs-persistencia.md` | role-match (mismo patrón estructural) |
| `missions/08-explorar-openapi.md` | mission | — | `missions/06-restart-y-persistencia.md` | exact (misión multi-paso con reto extra) |
| `missions/09-arrancar-con-docker.md` | mission | — | `missions/06-restart-y-persistencia.md` | exact (misión multi-paso con reto extra) |
| `docs/00-indice.md` (modificar) | index | — | `docs/00-indice.md` actual (líneas 1-50) | exact — añadir 4 entradas siguiendo patrón existente |

---

## Pattern Assignments

### `api/openapi.yaml` (spec, request-response)

**Analog:** `api/index.js` — fuente de verdad de todos los contratos

La spec no copia código de `index.js`, pero DEBE derivar cada endpoint, código de respuesta y
mensaje de error directamente de él. Los patrones clave a reflejar son:

**Endpoints a cubrir** (`api/index.js` líneas 92-241):
```
GET /          → líneas 92-108  → responde { message, version, endpoints[] }
GET /health    → líneas 221-226 → responde { status: "healthy", timestamp: ISO8601 }
GET /users     → líneas 110-112 → responde array de User ordenado por name
POST /users    → líneas 130-156 → 201 User | 400 error | 500 error
GET /users/:id → líneas 114-128 → 200 User | 400 error | 404 error
PUT /users/:id → líneas 158-193 → 200 User | 400 error | 404 error | 500 error
DELETE /users/:id → líneas 195-219 → 200 {message,user} | 400 error | 404 error | 500 error
GET /about     → líneas 228-235 → responde { name, description, frontend, backend }
GET /time      → líneas 237-241 → responde { now: ISO8601 }
```

**Mensajes de error reales** (copiar literalmente en los `example` de la spec):

`api/index.js` línea 118:
```javascript
{ error: 'El parámetro ":id" debe ser un número entero.' }
```

`api/index.js` línea 124:
```javascript
{ error: 'Usuario no encontrado.' }
```

`api/index.js` línea 49:
```javascript
{ error: 'El campo "name" es obligatorio y debe ser texto.' }
```

`api/index.js` línea 53:
```javascript
{ error: 'El campo "email" es obligatorio y debe ser texto.' }
```

`api/index.js` línea 152:
```javascript
{ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' }
```

`api/index.js` línea 218:
```javascript
{ message: 'Usuario eliminado correctamente.', user: deletedUser }
```

**Schema User** (derivar de `api/index.js` líneas 12-18 y 137-141):
```javascript
// Campos reales del objeto User en memoria:
{ id: Number (entero positivo), name: String (trim), email: String (trim) }
// Seed data:
{ id: 1, name: 'John Doe', email: 'john@example.com' }
{ id: 2, name: 'Jane Smith', email: 'jane@example.com' }
```

**Schema UserInput** (derivar de `validateUserPayload`, líneas 45-57):
```javascript
// Solo name y email son aceptados en el body de POST/PUT
// Ambos son required: strings no vacíos
```

**Patrón PORT** (`api/index.js` línea 21):
```javascript
const PORT = process.env.PORT || 3000;
// ATENCIÓN: el puerto por defecto es 3000, no 3100.
// El servidor de desarrollo se arranca con PORT=3100 npm start.
// La spec debe declarar server url http://localhost:3100 (valor habitual del lab).
```

---

### `api/Dockerfile` (config/infra, batch)

**Analog:** ninguno en el proyecto — primer Dockerfile.

**Patrón canónico** (extraído de RESEARCH.md, fuente: nodejs/docker-node BestPractices):
```dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

# Copiar manifiestos primero — aprovecha caché de capas Docker
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente DESPUÉS de instalar deps (preserva caché)
COPY . .

EXPOSE 3100

# ENV PORT evita el pitfall 5 (PORT=3000 por defecto en index.js)
ENV PORT=3100

# USER node DESPUÉS de todos los COPY (pitfall 4)
USER node

# CMD directo a node, no npm start (señales SIGTERM)
CMD ["node", "index.js"]
```

**Pitfalls críticos a evitar** (de RESEARCH.md):
- NO `CMD ["npm", "start"]` — npm intercepta SIGTERM
- NO `RUN npm install` — usar `npm ci` para reproducibilidad
- NO `USER node` antes de los `COPY` — permisos de lectura rotos
- NO omitir `ENV PORT=3100` — index.js usa `|| 3000` por defecto

---

### `api/.dockerignore` (config/infra)

**Analog:** ninguno — primer .dockerignore del proyecto.

**Patrón** (extraído de RESEARCH.md + decisiones CONTEXT.md):
```
node_modules
.git
*.test.js
data/users.json
```

Nota sobre `data/users.json`: excluirlo hace que el contenedor arranque desde `SEED_DATA`
(líneas 12-18 de `index.js`). Esto es correcto pedagógicamente — el alumno observa que el
contenedor es efímero. El pitfall 1 de RESEARCH.md documenta por qué incluirlo confunde.

---

### `api/package.json` — sección `scripts` (modificar)

**Analog:** `api/package.json` líneas 6-10 — patrón kebab-case existente.

**Estado actual** (`api/package.json` líneas 6-10):
```json
"scripts": {
  "start": "node index.js",
  "dev":   "nodemon index.js",
  "test":  "node --test index.test.js --test-force-exit"
}
```

**Patrón a seguir** — añadir a continuación de `"test"`, misma alineación con espacios:
```json
"scripts": {
  "start":        "node index.js",
  "dev":          "nodemon index.js",
  "test":         "node --test index.test.js --test-force-exit",
  "docker:build": "docker build -t edf-lab-api .",
  "docker:start": "docker run --rm -p 3100:3100 --name edf-lab-api edf-lab-api"
}
```

Observaciones:
- El nombre del package ya es `"edf-lab-api"` (`api/package.json` línea 2) — usar como nombre de imagen y contenedor mantiene consistencia.
- `--rm` elimina el contenedor al pararlo — comportamiento efímero correcto para el lab.
- `-p 3100:3100` es obligatorio — el pitfall 2 de RESEARCH.md documenta qué pasa sin este flag.
- No añadir `docker:stop` como script separado — `docker stop edf-lab-api` es trivial y se puede documentar en el doc sin script dedicado.

---

### `docs/11-openapi.md` (doc conceptual)

**Analog:** `docs/08-memoria-vs-persistencia.md` — match exacto de estructura y estilo.

**Patrón de estructura** (extraído de `docs/08-memoria-vs-persistencia.md`):

```markdown
# [Título del concepto]

[Párrafo introductorio: 2-3 frases que anclan el concepto en lo que el alumno ya sabe]

---

## [Sección conceptual 1 — el "antes" o el "qué"]

[Diagrama ASCII o bloque de texto plano mostrando el concepto visualmente]

---

## [Sección conceptual 2 — el "después" o el "cómo"]

[Diagrama ASCII más detallado si procede]

### [Subsección con ejemplo]

[Bloque de código ejecutable]

---

## Comparación directa

| Situación | [Sin X] | [Con X] |
|-----------|---------|---------|
| ...       | ...     | ...     |

---

## Ejemplos ejecutables

### [Caso 1]

```bash
# Comandos reales con comentarios explicativos
```

---

## Resumen

[2-3 frases de cierre. Mención a qué viene después si el alumno quiere profundizar.]
```

**Convenciones clave del analog:**
- Sin frontmatter YAML (Markdown puro — `docs/08-memoria-vs-persistencia.md` línea 1 empieza con `#`)
- Diagramas ASCII con `─`, `│`, `▼`, `├──`, `└──` (ver líneas 13-29 y 37-65 del analog)
- Bloques de código ejecutables para todos los ejemplos (no pseudocódigo)
- Mensajes de consola en bloques `bash` o `txt` literales tal como aparecen en el terminal
- Tablas de comparación para contrastar "antes" y "después" (líneas 87-94 del analog)
- Referencia a misiones relacionadas al final de secciones relevantes (línea 128: "Sigue los pasos detallados en la **Misión 06**")

**Contenido específico para `docs/11-openapi.md`:**
- Abrir con: "Ya conoces los endpoints de esta API. Este documento muestra cómo se describe ese contrato de forma formal."
- Secciones: ¿Qué es OpenAPI? / Estructura del YAML (`info`, `paths`, `components`) / Cómo leer un path (`parameters`, `responses`, `$ref`) / Por qué existe un contrato formal / Cómo usar Swagger Editor online
- Diagrama ASCII del flujo: `api/openapi.yaml → Swagger Editor → UI interactiva`
- Referencia a misión 08 al final

---

### `docs/12-docker.md` (doc conceptual)

**Analog:** `docs/08-memoria-vs-persistencia.md` — mismo patrón estructural.

**Convenciones:** idénticas a `docs/11-openapi.md` (ver sección anterior).

**Contenido específico para `docs/12-docker.md`:**
- Abrir con el framing de coexistencia (CONTEXT.md D-08): "¿Ya sabes arrancar la API con `npm start`? Bien. Este documento te enseña otra forma — con Docker. La primera forma sigue funcionando igual."
- Secciones: ¿Qué es un contenedor? / ¿Qué es una imagen? / Diferencia imagen vs contenedor / El flujo `build → run → logs → stop` / Comandos con `npm run docker:build` y `npm run docker:start`
- Diagrama ASCII del port mapping (de RESEARCH.md):
  ```
  [Tu Mac - Puerto 3100]
          |
          |  -p 3100:3100
          |
  [Contenedor Docker]
          |
     api/index.js
     (Node.js 22)
  ```
- Explicar por qué `data/users.json` no persiste entre reinicios del contenedor (concepto de efimeralidad)
- Referencia a misión 09 al final

---

### `missions/08-explorar-openapi.md` (mission)

**Analog:** `missions/06-restart-y-persistencia.md` — match exacto de formato (4 secciones H2, pasos numerados con bloques de código inline).

**Patrón de estructura** (extraído de `missions/06-restart-y-persistencia.md`):

```markdown
# Misión NN: [nombre en minúsculas]

## Objetivo

[1-2 frases: qué hace el alumno y qué aprende con ello]

## Pasos

1. [Paso con descripción breve]
   ```bash
   [comando ejecutable]
   ```

2. [Siguiente paso]
   ```bash
   [comando]
   ```

[...3-6 pasos total, completables en 10-15 minutos]

## Resultado esperado

[Descripción en prosa + bloque JSON o txt mostrando el output esperado]

## Reto extra

[1-2 frases introductorias]
```bash
[comando del reto]
```
[Pregunta abierta o variación para el alumno más avanzado]
```

**Convenciones clave del analog:**
- Título en minúsculas después de `Misión NN:` (ver `missions/06-restart-y-persistencia.md` línea 1)
- Pasos numerados con descripción en prosa + bloque de código indentado (no solo código seco)
- `## Resultado esperado` siempre incluye el output literal esperado (JSON o texto de consola)
- `## Reto extra` siempre termina con una pregunta que invita a reflexión (ver `missions/07` líneas 38-45)
- Rutas de archivo relativas al directorio raíz del proyecto (no absolutas)

**Contenido específico para `missions/08-explorar-openapi.md`:**
- Objetivo: abrir `api/openapi.yaml` en VS Code y en Swagger Editor online, identificar un endpoint conocido
- Pasos: abrir el archivo en editor → pegar en editor.swagger.io → localizar `GET /users` en la UI → identificar `parameters` y `responses` de `GET /users/:id`
- Resultado esperado: el alumno ve la UI de Swagger con los 9 endpoints listados
- Reto extra: localizar el mensaje de error exacto de `POST /users` con `name` vacío en la spec, comprobar que coincide con lo que devuelve la API real con `curl`

---

### `missions/09-arrancar-con-docker.md` (mission)

**Analog:** `missions/06-restart-y-persistencia.md` — mismo patrón exacto.

**Convenciones:** idénticas a `missions/08-explorar-openapi.md` (ver sección anterior).

**Contenido específico para `missions/09-arrancar-con-docker.md`:**
- Objetivo: construir la imagen y arrancar la API en un contenedor, verificar que responde igual que con `npm start`
- Pasos: `npm run docker:build` → observar el build → `npm run docker:start` → `curl http://localhost:3100/health` → `docker logs edf-lab-api` → `docker stop edf-lab-api`
- Resultado esperado: `GET /health` devuelve `{ "status": "healthy", ... }` igual que en modo `npm start`
- Reto extra: arrancar con `-p 3200:3100` y explicar por qué el dashboard (que apunta a 3100) no conecta — enseña port mapping activo. Pregunta: "¿Qué cambiarías en `app.js` del dashboard para que funcionara con el puerto 3200?"

---

### `docs/00-indice.md` (modificar)

**Analog:** `docs/00-indice.md` actual — patrón de entrada exacto.

**Patrón de entrada existente** (`docs/00-indice.md` líneas 17-19):
```markdown
10. [`10-tests.md`](./10-tests.md) para entender la suite de tests de la API.
```

Y en la sección `## Documentos` (líneas 48-50):
```markdown
10. [`10-tests.md`](./10-tests.md)  
    Explica la suite de tests de la API: cómo ejecutarla, leer el output y añadir un test nuevo.
```

**Patrón a aplicar** — añadir 4 entradas siguiendo el mismo formato, con etiqueta `(avanzado, opcional)`:

En `## Orden recomendado de lectura`, añadir después de la línea 18:
```markdown
11. [`11-openapi.md`](./11-openapi.md) para entender el contrato formal de la API. *(avanzado, opcional)*
12. [`12-docker.md`](./12-docker.md) para arrancar la API en un contenedor Docker. *(avanzado, opcional)*
```

En `## Documentos`, añadir después de la línea 50:
```markdown
11. [`11-openapi.md`](./11-openapi.md) *(avanzado, opcional)*  
    Explica qué es OpenAPI, cómo leer el YAML de la spec y por qué los equipos usan contratos formales.

12. [`12-docker.md`](./12-docker.md) *(avanzado, opcional)*  
    Explica qué es Docker, qué es una imagen y cómo arrancar la API en un contenedor local.
```

Para las misiones (no hay sección de misiones en `00-indice.md` actualmente — crear sección nueva al final):
```markdown
## Misiones avanzadas *(opcionales)*

- [`missions/08-explorar-openapi.md`](../missions/08-explorar-openapi.md) — Explora la spec OpenAPI en VS Code y Swagger Editor online. *(avanzado, opcional)*
- [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md) — Construye la imagen Docker y arranca la API en un contenedor. *(avanzado, opcional)*
```

---

## Shared Patterns

### Patrón de mensajes de error en español
**Source:** `api/index.js` líneas 118, 124, 49, 53, 152, 189, 215, 218
**Aplicar a:** `api/openapi.yaml` — todos los campos `example` de respuestas 400, 404, 500

Los mensajes de error de la API están en español y deben copiarse LITERALMENTE en los ejemplos
de la spec. Nunca traducir, parafrasear ni inventar variantes.

```javascript
// Los 5 mensajes de error distintos:
{ error: 'El parámetro ":id" debe ser un número entero.' }          // línea 118
{ error: 'Usuario no encontrado.' }                                   // línea 124
{ error: 'El campo "name" es obligatorio y debe ser texto.' }        // línea 49
{ error: 'El campo "email" es obligatorio y debe ser texto.' }       // línea 53
{ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' } // línea 152
```

### Patrón de doc conceptual con ejemplos ejecutables
**Source:** `docs/08-memoria-vs-persistencia.md` (doc más completo y reciente)
**Aplicar a:** `docs/11-openapi.md`, `docs/12-docker.md`

Reglas:
- Sin frontmatter YAML. Primer carácter del archivo es `#`.
- Diagramas ASCII para visualizar conceptos (no imágenes ni Mermaid).
- Todos los ejemplos son ejecutables con `curl` o `bash` — nunca pseudocódigo.
- Tabla de comparación `| Situación | Sin X | Con X |` cuando proceda.
- Referencia a misiones relacionadas con texto `**Misión NN: nombre**`.

### Patrón de misión con reto reflexivo
**Source:** `missions/06-restart-y-persistencia.md` y `missions/07-corrupcion-y-restauracion.md`
**Aplicar a:** `missions/08-explorar-openapi.md`, `missions/09-arrancar-con-docker.md`

El `## Reto extra` de las misiones recientes (07) termina con una pregunta abierta que invita
al alumno a razonar, no solo a ejecutar (`missions/07-corrupcion-y-restauracion.md` líneas 42-45):
```markdown
¿Qué diferencia ves entre el aviso `[warn]` y el aviso `[info]`?
¿Por qué son mensajes distintos si el resultado es el mismo?
```
Las misiones 08 y 09 deben seguir este patrón más maduro (pregunta reflexiva), no el formato
simple de misión 01 (solo comando alternativo).

### Patrón de scripts npm con alineación de espacios
**Source:** `api/package.json` líneas 6-10
**Aplicar a:** `api/package.json` (modificación de sección `scripts`)

Los scripts existentes usan espacios para alinear los valores verticalmente:
```json
"start": "node index.js",
"dev":   "nodemon index.js",
"test":  "node --test index.test.js --test-force-exit"
```
Mantener la misma alineación al añadir `docker:build` y `docker:start`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `api/Dockerfile` | config/infra | batch | No existe ningún Dockerfile en el proyecto. Usar patrón de RESEARCH.md (nodejs/docker-node BestPractices). |
| `api/.dockerignore` | config/infra | — | No existe ningún .dockerignore. Patrón trivial — lista de exclusiones estándar de RESEARCH.md. |

---

## Metadata

**Analog search scope:** `api/`, `docs/`, `missions/`
**Files scanned:** 14 (api/index.js, api/package.json, docs/00-indice.md, docs/08-memoria-vs-persistencia.md, docs/10-tests.md, missions/01-arrancar-api.md, missions/06-restart-y-persistencia.md, missions/07-corrupcion-y-restauracion.md + 6 adicionales listados)
**Pattern extraction date:** 2026-05-29
