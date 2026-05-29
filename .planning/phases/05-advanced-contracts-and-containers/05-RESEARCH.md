# Phase 5: Advanced Contracts and Containers - Research

**Researched:** 2026-05-29
**Domain:** OpenAPI 3.0.3 (YAML manual) + Docker (node:22-alpine) para API Express educativa
**Confidence:** HIGH

---

## Summary

Esta fase añade dos capas de material avanzado y opcional sobre el laboratorio educativo existente: una especificación OpenAPI 3.0.3 escrita a mano como documento YAML (`api/openapi.yaml`) y un Dockerfile con imagen Alpine que permite arrancar la API en un contenedor sin modificar ni una línea de `index.js`. Ambas capas son aditivas — no reemplazan el flujo básico `npm start`.

El dominio técnico está bien establecido y sin sorpresas. La especificación OpenAPI 3.0.3 es el estándar de facto para describir contratos de API HTTP, compatible con todas las herramientas online relevantes (Swagger Editor, Stoplight). Docker con `node:22-alpine` es el patrón estándar para contenedores Node.js ligeros (~150 MB vs ~1 GB de la imagen completa). El código existente en `api/index.js` ya está listo para ser descrito y contenedorizado sin cambios.

El único punto de atención pedagógico es el framing: los alumnos deben entender que estas herramientas son opcionales y que el objetivo es leer y comprender contratos y contenedores, no autoconfigurarlos.

**Recomendación principal:** Usar OpenAPI 3.0.3 (no 3.1.0) por compatibilidad máxima con Swagger Editor online. Usar `node:22-alpine` con usuario `node` (no root) y `CMD ["node", "index.js"]` directo (no `npm start`) para correcta gestión de señales.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### OpenAPI — spec y tooling (ADV-01)
- **D-01:** Formato: YAML manual (`api/openapi.yaml`). Sin swagger-ui-express ni swagger-jsdoc. Cero dependencias nuevas.
- **D-02:** Cobertura: todos los endpoints — `GET /`, `GET /health`, `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`.
- **D-03:** Ubicación: `api/openapi.yaml`, co-ubicado con el código que describe.
- **D-04:** Doc conceptual: `docs/11-openapi.md`.

#### Docker — setup y framing (ADV-02)
- **D-05:** Alcance: `api/Dockerfile` + `api/.dockerignore`. Sin Docker Compose.
- **D-06:** Imagen base: `node:22-alpine`.
- **D-07:** Scripts en `api/package.json`: añadir `"docker:build"` y `"docker:start"`.
- **D-08:** Framing de coexistencia en `docs/12-docker.md`: "¿Ya sabes arrancar la API con `npm start`? Bien. Este documento te enseña otra forma."
- **D-09:** Doc conceptual: `docs/12-docker.md`.

#### Material avanzado y visibilidad
- **D-10:** `docs/00-indice.md` marca entradas 11 y 12 con `(avanzado, opcional)`.
- **D-11:** Misiones 08 y 09 también con `(avanzado, opcional)`.

#### Misiones avanzadas (DOCS-04)
- **D-12:** `missions/08-explorar-openapi.md` — explorar spec en VS Code y Swagger Editor online.
- **D-13:** `missions/09-arrancar-con-docker.md` — `npm run docker:build`, `npm run docker:start`, verificar `/health`.

### Claude's Discretion
- Versión exacta de OpenAPI (3.0.3 recomendada por compatibilidad amplia).
- Contenido exacto de los campos `info` (title, description, version).
- Orden y agrupación de paths en el YAML.
- Estructura exacta del comando `docker run` en el script `docker:start`.
- Número de pasos en cada misión (completables en 10-15 minutos).
- Contenido del `api/.dockerignore`.

### Deferred Ideas (OUT OF SCOPE)
- Docker Compose (API + dashboard en contenedores separados).
- Swagger UI interactiva en Express (`swagger-ui-express`).
- Generación automática de spec desde JSDoc.
- Publicación de imagen en Docker Hub.
- ADV-03: base de datos (SQLite, PostgreSQL) diferida.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADV-01 | OpenAPI/Swagger documenta el contrato de la API cuando la superficie es estable. | La API tiene 9 endpoints bien definidos. Estructura OpenAPI 3.0.3 verificada contra spec oficial. |
| ADV-02 | Docker enseña ejecución containerizada local sin reemplazar el startup básico. | Dockerfile con `node:22-alpine` verificado. Scripts npm como alias. Coexistencia con `npm start` garantizada. |
| ADV-03 | El trabajo de base de datos avanzado queda diferido hasta que se entienda la persistencia de archivos. | Ningún elemento de esta fase introduce dependencias de DB. Confirmado fuera de scope. |
</phase_requirements>

---

## Architectural Responsibility Map

| Capacidad | Tier Principal | Tier Secundario | Justificación |
|-----------|----------------|-----------------|---------------|
| Especificación OpenAPI | Fichero estático (`api/openapi.yaml`) | — | Documento de contrato, no código ejecutable. Co-ubicado con el backend que describe. |
| Ejecución Docker | Infraestructura local (contenedor) | API Backend | El contenedor ejecuta `index.js`; la lógica de la API no cambia. |
| Scripts npm (`docker:build`, `docker:start`) | `api/package.json` | — | Alias de comandos Docker — mantiene la UX uniforme con `npm start`. |
| Documentación conceptual (`docs/11`, `docs/12`) | Contenido educativo estático | — | Markdown puro. No afecta a ningún tier de ejecución. |
| Misiones (`missions/08`, `missions/09`) | Contenido educativo estático | — | Guías de actividad para el alumno. Sin código ejecutable propio. |

---

## Standard Stack

### Core

| Herramienta | Versión | Propósito | Por qué es estándar |
|-------------|---------|-----------|----------------------|
| OpenAPI Specification | 3.0.3 | Descripción formal del contrato HTTP | Estándar de industria (OAI). Soportado por Swagger Editor, Stoplight, Redoc. 3.0.3 > 3.1.0 para herramientas online. [VERIFIED: spec.openapis.org] |
| node:22-alpine | 22.x (Alpine 3.x) | Imagen base Docker ligera | ~150 MB vs ~1 GB. Imagen oficial Node.js. Recomendada para producción y educación. [VERIFIED: hub.docker.com] |

### Sin dependencias nuevas de producción

Esta fase no añade ningún paquete a `dependencies` ni a `devDependencies` de `api/package.json`. [VERIFIED: decisión D-01 del CONTEXT.md]

Las dependencias actuales verificadas en el registro npm son:
- `express`: 5.2.1 (última) — el proyecto usa `^4.18.2` (stable LTS) [VERIFIED: npm registry]
- `cors`: 2.8.6 [VERIFIED: npm registry]
- `lodash`: 4.18.1 (última) — el proyecto usa `^4.17.21` [VERIFIED: npm registry]

### Herramientas online (sin instalación)

| Herramienta | URL | Uso en misión 08 |
|-------------|-----|-----------------|
| Swagger Editor | https://editor.swagger.io | Pegar/cargar `openapi.yaml`, ver UI interactiva |
| Swagger Editor Next | https://editor-next.swagger.io | Alternativa con soporte 3.1 |

---

## Architecture Patterns

### System Architecture Diagram

```
Alumno
  │
  ├─── Ruta básica (existente, sin cambios) ──────────────────────────────────┐
  │    npm start → node index.js → http://localhost:3100                      │
  │                                                                            │
  └─── Ruta avanzada (nueva, opcional) ───────────────────────────────────────┤
       npm run docker:build → docker build → imagen local                     │
       npm run docker:start → docker run -p 3100:3100 → http://localhost:3100 │
                                                                               ▼
                                                               api/index.js (sin cambios)
                                                               api/data/users.json

Documentación (lectura):
  api/openapi.yaml ──→ VS Code / Swagger Editor online (misión 08)
  docs/11-openapi.md  (conceptual)
  docs/12-docker.md   (conceptual)
  missions/08-explorar-openapi.md
  missions/09-arrancar-con-docker.md
```

### Estructura de ficheros nuevos

```
api/
├── index.js              (sin cambios)
├── package.json          (añadir scripts docker:build y docker:start)
├── openapi.yaml          (NUEVO — spec OpenAPI 3.0.3 completa)
├── Dockerfile            (NUEVO — node:22-alpine)
├── .dockerignore         (NUEVO)
└── data/
    └── users.json        (excluido del COPY en Dockerfile o incluido según decisión)

docs/
├── 00-indice.md          (añadir entradas 11 y 12 con etiqueta "(avanzado, opcional)")
├── 11-openapi.md         (NUEVO — doc conceptual OpenAPI)
└── 12-docker.md          (NUEVO — doc conceptual Docker)

missions/
├── 08-explorar-openapi.md   (NUEVO)
└── 09-arrancar-con-docker.md (NUEVO)
```

### Pattern 1: Estructura canónica OpenAPI 3.0.3

El fichero `api/openapi.yaml` debe tener esta estructura raíz:

```yaml
# Source: https://spec.openapis.org/oas/v3.0.3.html [VERIFIED]
openapi: "3.0.3"
info:
  title: EDF Lab API
  description: API REST educativa del laboratorio EDF — enseña Express, JSON y CRUD.
  version: "1.0.0"
servers:
  - url: http://localhost:3100
    description: Servidor de desarrollo local
paths:
  /:
    get: ...
  /health:
    get: ...
  /users:
    get: ...
    post: ...
  /users/{id}:
    get: ...
    put: ...
    delete: ...
  /about:
    get: ...
  /time:
    get: ...
components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          example: "john@example.com"
    UserInput:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          example: "Jane Smith"
        email:
          type: string
          example: "jane@example.com"
    Error:
      type: object
      properties:
        error:
          type: string
          example: "Usuario no encontrado."
```

### Pattern 2: Operación con path parameter (GET /users/{id})

```yaml
# Source: https://spec.openapis.org/oas/v3.0.3.html [VERIFIED]
/users/{id}:
  get:
    summary: Obtener un usuario por ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          example: 1
    responses:
      "200":
        description: Usuario encontrado
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/User"
      "400":
        description: ID inválido (no es un número entero positivo)
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: 'El parámetro ":id" debe ser un número entero.'
      "404":
        description: Usuario no encontrado
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: "Usuario no encontrado."
```

### Pattern 3: Operación con requestBody (POST /users)

```yaml
# Source: https://swagger.io/specification [VERIFIED]
/users:
  post:
    summary: Crear un nuevo usuario
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/UserInput"
          example:
            name: "Carlos López"
            email: "carlos@example.com"
    responses:
      "201":
        description: Usuario creado correctamente
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/User"
      "400":
        description: Payload inválido
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
```

### Pattern 4: Dockerfile canónico para node:22-alpine

```dockerfile
# Source: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md [CITED]
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar manifiestos primero (optimiza caché de capas)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto que usa la API
EXPOSE 3100

# Usar el usuario no-root que incluye la imagen oficial
USER node

# Arrancar con node directamente (no npm start) para que los signals SIGTERM
# lleguen al proceso Node.js, no a npm
CMD ["node", "index.js"]
```

### Pattern 5: Scripts npm para Docker (api/package.json)

```json
{
  "scripts": {
    "start":        "node index.js",
    "dev":          "nodemon index.js",
    "test":         "node --test index.test.js --test-force-exit",
    "docker:build": "docker build -t edf-lab-api .",
    "docker:start": "docker run --rm -p 3100:3100 --name edf-lab-api edf-lab-api"
  }
}
```

### Pattern 6: .dockerignore

```
node_modules
.git
*.test.js
data/users.json
```

Nota sobre `data/users.json`: excluirlo del contexto de build significa que el contenedor arranca con datos limpios (desde `SEED_DATA` en `index.js`). Esto es pedagógicamente correcto — el alumno observa que el contenedor es efímero. Si se incluye, heredaría el estado del host. La decisión queda en manos de Claude (Claude's Discretion).

### Anti-Patterns a Evitar

- **`CMD ["npm", "start"]` en Dockerfile:** npm intercepta señales del SO (SIGTERM, SIGINT), lo que puede causar cierres abruptos. Usar `CMD ["node", "index.js"]` directamente. [CITED: nodejs/docker-node BestPractices]
- **`RUN npm install` en lugar de `npm ci`:** `npm ci` lee `package-lock.json` y garantiza reproducibilidad. `npm install` puede resolver versiones distintas.
- **Copiar todo antes de instalar dependencias:** Destruye el caché de capas. Copiar `package*.json` primero, ejecutar `npm ci`, luego copiar el código fuente.
- **Correr como root en el contenedor:** La imagen `node:22-alpine` ya incluye el usuario `node`. Usar `USER node` antes de `CMD`.
- **`openapi: "3.1.0"` en lugar de `"3.0.3"`:** Swagger Editor online (editor.swagger.io) soporta 3.0.x con más fiabilidad. 3.1.0 tiene soporte parcial en herramientas gratuitas. [ASSUMED — basado en compatibilidad conocida de herramientas]

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|----------|-------------|------------------|---------|
| Definición de tipos de respuesta JSON | Schema propio en comentarios o README | `components/schemas` en OpenAPI | Reutilizable con `$ref`, validable por herramientas |
| Descripción de parámetros de ruta | Comentarios ad-hoc en el código | `parameters` con `in: path` en OpenAPI | Estándar, legible por Swagger Editor |
| Script de arranque Docker | Shell script `.sh` personalizado | `npm run docker:start` | Consistente con el resto de scripts del proyecto |
| Manejo de señales en contenedor | Lógica custom en `index.js` | `CMD ["node", "index.js"]` (no `npm start`) | Node.js recibe SIGTERM directamente |

**Insight clave:** La spec OpenAPI es un documento de lectura, no un generador de código. En este contexto educativo, su valor está en que el alumno pueda leerla y relacionarla con los endpoints que ya conoce.

---

## Common Pitfalls

### Pitfall 1: `data/users.json` incluido en la imagen Docker

**Qué sale mal:** Si se copia `data/users.json` en la imagen, el contenedor hereda el estado del host. Después de un `docker stop` + `docker run`, los datos parecen persistir — pero en realidad vienen del COPY en tiempo de build, no de persistencia real. Confunde al alumno.

**Por qué ocurre:** El `.dockerignore` no excluye `data/users.json` explícitamente.

**Cómo evitar:** Incluir `data/users.json` en `.dockerignore`. La API arranca desde `SEED_DATA` cuando no encuentra el fichero, lo que es el comportamiento correcto y educativo (el alumno ve que el contenedor es efímero).

**Señales de alerta:** El alumno observa que POST /users persiste entre reinicios del contenedor sin volúmenes montados.

### Pitfall 2: Puerto no publicado al arrancar el contenedor

**Qué sale mal:** `docker run edf-lab-api` sin `-p 3100:3100` hace que el contenedor escuche en el puerto interno pero no sea accesible desde el host. El dashboard y los curl del alumno fallan sin mensaje claro.

**Por qué ocurre:** Docker no publica puertos por defecto — el alumno olvida el flag `-p`.

**Cómo evitar:** El script `docker:start` incluye `-p 3100:3100` explícitamente. La misión 09 explica qué hace ese flag y propone el reto extra de cambiar el puerto externo.

**Señales de alerta:** `curl http://localhost:3100/health` devuelve "connection refused" aunque el contenedor está running.

### Pitfall 3: `$ref` apuntando a un path inexistente en el YAML

**Qué sale mal:** Si `$ref: "#/components/schemas/User"` no coincide exactamente con la clave en `components.schemas`, Swagger Editor muestra el path completo como "unresolved reference" y la spec no valida.

**Por qué ocurre:** Typo en el nombre del schema (`Users` vs `User`) o indentación incorrecta que saca el schema de `components`.

**Cómo evitar:** Validar el YAML pegándolo en editor.swagger.io antes de finalizar. El panel izquierdo muestra la lista de schemas resueltos.

**Señales de alerta:** Swagger Editor muestra warnings amarillos o rojos en la sección de responses.

### Pitfall 4: `USER node` antes de `COPY` crea ficheros sin permisos de lectura

**Qué sale mal:** Si se pone `USER node` antes del `COPY . .`, Node.js puede no tener permisos para leer los ficheros copiados (depende del umask y del sistema).

**Por qué ocurre:** Los ficheros se copian con el usuario que ejecuta el daemon Docker (root), y `USER node` cambia el usuario activo antes de que se copien.

**Cómo evitar:** Poner `USER node` justo antes de `CMD`, después de todos los `COPY` y `RUN`. [CITED: nodejs/docker-node BestPractices]

### Pitfall 5: Variable PORT en el contenedor

**Qué sale mal:** `index.js` lee `process.env.PORT || 3000`. Si el contenedor no recibe `PORT=3100`, la API escucha en 3000 internamente pero el `docker:start` publica `-p 3100:3100` → conexión rechazada.

**Por qué ocurre:** El script `docker:start` publica el puerto 3100 en el host, pero el contenedor escucha en 3000 si `PORT` no está definido.

**Cómo evitar:** Añadir `-e PORT=3100` al script `docker:start`, o añadir `ENV PORT=3100` en el Dockerfile (lo que también documenta la intención). Recomendado: `ENV PORT=3100` en el Dockerfile + `-p 3100:3100` en el script. El alumno puede sobreescribir con `-e PORT=XXXX`.

**Señales de alerta:** `docker logs edf-lab-api` muestra `Servidor arrancado en http://localhost:3000` cuando se esperaba 3100.

### Pitfall 6: Indentación YAML incorrecta en openapi.yaml

**Qué sale mal:** YAML es sensible a la indentación. Un tab en lugar de espacios, o mezcla de 2 y 4 espacios, produce un parse error que Swagger Editor muestra como "bad indentation".

**Por qué ocurre:** Editores que insertan tabs al tabular en ficheros `.yaml`.

**Cómo evitar:** Usar 2 espacios consistentemente (igual que el resto del proyecto). Si VS Code está configurado para insertar tabs, añadir `.editorconfig` o configurar la extensión YAML. La misión 08 puede mencionar esto como troubleshooting.

---

## Code Examples

Verificados contra fuentes oficiales:

### OpenAPI 3.0.3 — Estructura completa mínima para GET /health

```yaml
# Source: https://spec.openapis.org/oas/v3.0.3.html [VERIFIED]
/health:
  get:
    summary: Comprobar estado del servidor
    responses:
      "200":
        description: Servidor en funcionamiento
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: "healthy"
                timestamp:
                  type: string
                  format: date-time
                  example: "2026-05-29T11:00:00.000Z"
```

### OpenAPI 3.0.3 — DELETE con respuesta de confirmación

```yaml
# Source: https://spec.openapis.org/oas/v3.0.3.html [VERIFIED]
/users/{id}:
  delete:
    summary: Eliminar un usuario por ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          example: 1
    responses:
      "200":
        description: Usuario eliminado correctamente
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Usuario eliminado correctamente."
                user:
                  $ref: "#/components/schemas/User"
      "400":
        description: ID inválido
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
      "404":
        description: Usuario no encontrado
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
```

### Dockerfile completo para educación

```dockerfile
# Source: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md [CITED]
FROM node:22-alpine

WORKDIR /usr/src/app

# Copiar manifiestos primero — aprovecha caché de capas Docker
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Documentar el puerto que expone la aplicación
EXPOSE 3100

# Variable de entorno para que la API escuche en 3100
ENV PORT=3100

# Usuario no-root (incluido en la imagen oficial)
USER node

# CMD directo a node — los signals del SO llegan a Node.js, no a npm
CMD ["node", "index.js"]
```

### Scripts npm (api/package.json — sección scripts)

```json
"docker:build": "docker build -t edf-lab-api .",
"docker:start": "docker run --rm -p 3100:3100 --name edf-lab-api edf-lab-api"
```

### Diagrama ASCII para docs/12-docker.md

```
[Tu Mac - Puerto 3100]
        |
        |  -p 3100:3100
        |
[Contenedor Docker]
        |
   api/index.js
   (Node.js 22)
        |
   api/data/  ← datos efímeros dentro del contenedor
```

---

## State of the Art

| Enfoque anterior | Enfoque actual | Cuándo cambió | Impacto |
|-----------------|----------------|---------------|---------|
| Swagger 2.0 (YAML/JSON) | OpenAPI 3.0.x | 2017 (renombrado) | Mejor soporte para `requestBody`, `components`, servidores múltiples |
| OpenAPI 3.0.x | OpenAPI 3.1.0 | 2021 | Alineación con JSON Schema — pero herramientas gratuitas online tienen soporte parcial |
| `node:latest` como imagen base | `node:22-alpine` | ~2019 (popularización Alpine) | 7x reducción de tamaño de imagen |
| `CMD ["npm", "start"]` | `CMD ["node", "index.js"]` | Buenas prácticas establecidas | Gestión correcta de señales SIGTERM/SIGINT |

**Deprecado/obsoleto:**
- Swagger 2.0: completamente reemplazado por OpenAPI 3.x. Swagger Editor online acepta ambos, pero 3.0.3 es lo correcto para proyectos nuevos.
- `npm install` en Dockerfile: sustituido por `npm ci` para reproducibilidad.

---

## Project Constraints (from CLAUDE.md)

Directrices del proyecto que el planificador DEBE respetar:

| Directriz | Implicación para esta fase |
|-----------|---------------------------|
| Sin dependencias innecesarias (regla 5 de AGENTS.md) | La spec OpenAPI es un fichero `.yaml` — cero dependencias nuevas. ✓ |
| Documentación como producto | `docs/11`, `docs/12`, `missions/08`, `missions/09` son entregas de primera clase. |
| Errores reales → `NOTEBOOK.md` | Si el Dockerfile produce errores durante la implementación, documentarlos. |
| CORS es obligatorio | No afecta a esta fase — `index.js` no se modifica. |
| No acoplar api/ y dashboard/ | Esta fase no toca `dashboard/`. ✓ |
| Puertos 3100 y 5173 referenciados en varios sitios | El script `docker:start` debe usar `-p 3100:3100` para mantener consistencia. |

---

## Assumptions Log

| # | Claim | Sección | Riesgo si es incorrecto |
|---|-------|---------|------------------------|
| A1 | Swagger Editor online (editor.swagger.io) soporta OpenAPI 3.0.3 con fiabilidad completa | Standard Stack / Misión 08 | La misión 08 podría fallar si la herramienta cambia. Bajo riesgo — Swagger Editor es mantenido por SmartBear. |
| A2 | `node:22-alpine` está disponible en Docker Hub en mayo 2026 | Standard Stack | Prácticamente garantizado — Node.js 22 es LTS activo. |
| A3 | El flag `--rm` en `docker run` es pedagógicamente correcto (el contenedor se elimina al parar) | Scripts npm | Si el alumno quiere inspeccionar el contenedor parado, `--rm` lo impide. Bajo riesgo — simplifica el flujo. |
| A4 | `data/users.json` debe excluirse del COPY para que el contenedor sea efímero | .dockerignore | Si el alumno quiere conservar datos entre arranques sin volúmenes, necesitaría incluirlo o montar un volumen. Oportunidad de aprendizaje, no error. |

---

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|---------------|------------|---------|---------|
| Docker Desktop | 05-02 (Dockerfile, scripts) | ✓ | 29.4.3 | — |
| Node.js 22 | Imagen `node:22-alpine` / scripts | ✓ | v22.22.3 | — |
| npm | Scripts `docker:build`, `docker:start` | ✓ | incluido con Node 22 | — |
| Swagger Editor online | Misión 08 | ✓ (web) | — (SaaS) | editor-next.swagger.io |
| internet | editor.swagger.io en misión 08 | ✓ (asumido) | — | VS Code Extension "OpenAPI (Swagger) Editor" |

**Dependencias sin fallback bloqueante:** ninguna.

**Nota:** Docker v29.4.3 está instalado y operativo en el sistema de desarrollo. La imagen `node:22-alpine` se descargará en el primer `docker build` — requiere conexión a internet en ese momento.

---

## Open Questions

1. **¿`data/users.json` dentro o fuera del contexto de build Docker?**
   - Lo que sabemos: si se incluye, el contenedor hereda datos del host; si se excluye, arranca limpio desde SEED_DATA.
   - Lo que no está claro: si el alumno espera ver sus datos del host también en el contenedor.
   - Recomendación: excluirlo del `.dockerignore`. Más educativo: el alumno comprueba que el contenedor es efímero por defecto, y el "reto extra" de la misión 09 puede preguntar cómo persistirlos (volúmenes — concepto avanzado).

2. **¿Incluir `GET /about` y `GET /time` en la spec OpenAPI?**
   - Lo que sabemos: `api/index.js` define esos dos endpoints pero el CONTEXT.md (D-02) enumera los 7 endpoints principales. El código tiene 9 rutas en total (`/`, `/health`, `/users`, `/users/:id` × 3 métodos, `/about`, `/time`).
   - Lo que no está claro: si la omisión fue deliberada en D-02 o un olvido.
   - Recomendación: incluir `/about` y `/time` en la spec — una spec completa es más útil educativamente y enseña que el contrato debe cubrir toda la superficie pública de la API.

---

## Sources

### Primary (HIGH confidence)
- `/websites/spec_openapis_oas_v3_0_3` (Context7) — estructura Paths, Parameters, Operation, Components, Info, Schema
- `/websites/swagger_io_specification` (Context7) — requestBody, examples, Components YAML
- `https://spec.openapis.org/oas/v3.0.3.html` — especificación oficial OAI 3.0.3
- `https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md` — mejores prácticas Docker + Node.js (usuario no-root, CMD, npm ci)
- `api/index.js` (codebase verificado) — todos los endpoints, contratos de respuesta, mensajes de error en español

### Secondary (MEDIUM confidence)
- WebSearch "node:22-alpine Dockerfile best practices Node.js Express 2025" — tamaños de imagen, npm ci, multi-stage, señales
- `npm view express/cors/lodash version` — versiones actuales verificadas en registro npm

### Tertiary (LOW confidence)
- Compatibilidad de Swagger Editor online con OpenAPI 3.0.3 — asumida como estable, no verificada programáticamente en esta sesión

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — OpenAPI 3.0.3 y node:22-alpine son estables y bien documentados
- Architecture: HIGH — el código base está leído y verificado; no hay cambios en `index.js`
- Pitfalls: HIGH — basados en el código real de `index.js` (PORT env var, SEED_DATA) y mejores prácticas verificadas
- Ejemplos de código: HIGH — extraídos de spec oficial y BestPractices verificadas

**Research date:** 2026-05-29
**Valid until:** 2026-06-29 (stack estable; Docker y OpenAPI 3.0.3 no cambian en ciclos cortos)
