# NOTEBOOK

Diario vivo del laboratorio educativo.

Aquí se documentan decisiones, errores reales, soluciones aplicadas y aprendizajes. No sustituye al README: lo complementa con contexto histórico y razonamiento.

---

## 2026-05-27 · Auditoría de situación del repositorio

### Contexto

Revisión completa del estado del repositorio al inicio de una nueva sesión de trabajo.

### Estado verificado de Phase 01

Todo lo implementado en Phase 01 está funcionando correctamente:

- `node --check api/index.js` → OK
- `node --check dashboard/app.js` → OK
- `npm audit --audit-level=high` → 0 vulnerabilidades

El dashboard CRUD completo opera correctamente: formulario compartido crear/editar, botones Editar/Eliminar por fila, feedback método+endpoint, confirm() nativo antes de DELETE, estados loading/online/offline/error.

### Anomalía detectada: git tracking incompleto

El repositorio tiene un desfase importante entre lo que existe en disco y lo que está en git:

**Archivos trackeados (comprometidos):**

```txt
.planning/          ← toda la planificación GSD
AGENTS.md
NOTEBOOK.md
dashboard/app.js
dashboard/index.html    ← con cambios sin commit
dashboard/styles.css    ← con cambios sin commit
docs/04-dashboard-fetch.md
missions/05-mejorar-dashboard.md
```

**Archivos sin trackear (nunca comprometidos):**

```txt
api/                ← ⚠️ TODO el backend Express
docs/00-03, 05-07   ← 6 de 7 capítulos de documentación
missions/01-04      ← 4 de 5 misiones
README.md
ROADMAP.md
CHANGELOG.md
CLAUDE.md
.gitignore
```

Esto significa que si alguien clona el repositorio solo recibe el frontend y la planificación, pero no la API. El backend completo existe en disco pero nunca se ha commiteado.

### Aprendizaje

Separar el trabajo de planificación (commits GSD) del trabajo de código puede dejar archivos de código en disco sin llegar a git. Conviene hacer un commit de estado completo antes de iniciar una nueva fase para tener un snapshot limpio y reproducible.

### Acción recomendada antes de Phase 02

Hacer un commit que incluya todos los archivos sin trackear relevantes:

```bash
git add api/ docs/ missions/ README.md ROADMAP.md CHANGELOG.md CLAUDE.md .gitignore
git add dashboard/index.html dashboard/styles.css
git commit -m "chore: commit full project snapshot before phase 02"
```

---

## 2026-05-23 · Nacimiento del laboratorio

### Contexto

Partimos de una API Express mínima ubicada originalmente en:

```txt
/Users/edefrutos/Desktop/test-project
```

Después se creó un frontend externo:

```txt
/Users/edefrutos/Desktop/users-dashboard
```

Finalmente ambos proyectos se agruparon en:

```txt
/Users/edefrutos/Desktop/express-api-demo
```

### Decisión

Convertir la demo en un laboratorio educativo con estructura:

```txt
api/       → backend Express
dashboard/ → frontend consumidor
docs/      → documentación conceptual
missions/  → ejercicios guiados
```

### Motivo

Separar backend y frontend ayuda a aprender conceptos reales de desarrollo web moderno:

- API REST,
- JSON,
- `fetch()`,
- CORS,
- puertos,
- debugging,
- documentación técnica.

---

## Problema real: puerto 3000 ocupado

### Síntoma

Al intentar usar `localhost:3000`, el puerto estaba ocupado por otro proceso relacionado con Docker.

### Decisión

Usar:

```txt
API:       http://localhost:3100
Dashboard: http://localhost:5173
```

### Aprendizaje

El puerto forma parte del origen. Por tanto:

```txt
http://localhost:3100
http://localhost:5173
```

son orígenes distintos para el navegador.

---

## Problema real: CORS

### Síntoma

El frontend necesita llamar a la API desde otro puerto.

### Solución

Se instaló y configuró `cors` en la API:

```js
const cors = require('cors');

app.use(cors());
```

### Aprendizaje

CORS no es un error de Express, sino una política de seguridad del navegador.

---

## Problema real: Node/npm fuera de sincronía

### Síntoma

`npm audit` mostraba un aviso porque npm 11 se estaba ejecutando con Node 16.

### Diagnóstico

`which node` apuntaba a Heroku y `which npm` a Homebrew.

### Solución

Reordenar la configuración del shell para que `nvm` tenga prioridad.

Estado correcto final:

```txt
node → ~/.nvm/versions/node/v22.22.3/bin/node
npm  → ~/.nvm/versions/node/v22.22.3/bin/npm
```

### Aprendizaje

El orden del `PATH` determina qué binario se ejecuta realmente.

---

## Regla de trabajo

Cada mejora educativa debe responder a estas preguntas:

1. ¿Qué concepto enseña?
2. ¿Qué archivo toca?
3. ¿Cómo se prueba?
4. ¿Qué error típico ayuda a entender?
5. ¿Dónde queda documentado?

---

## 2026-05-26 · Dashboard CRUD desde el navegador

### Contexto

La API ya tenía rutas CRUD en memoria, pero el dashboard solo hacía lecturas con `GET`. Para alumnos principiantes faltaba ver el ciclo completo:

```txt
formulario -> fetch() -> API Express -> JSON -> tabla actualizada
```

### Decisiones

- Usar un único formulario para crear y editar usuarios.
- Mostrar el modo de edición con `Editando usuario {id}`.
- Usar `confirm()` nativo antes de `DELETE /users/:id`.
- Mostrar feedback con método y endpoint:
  - `POST /users -> usuario creado`
  - `PUT /users/:id -> usuario actualizado`
  - `DELETE /users/:id -> usuario eliminado`

### Motivo

El formulario compartido evita duplicar interfaz y ayuda a explicar que crear y editar son casi el mismo flujo: leer campos, construir JSON, llamar a la API y refrescar la tabla.

La confirmación nativa con `confirm()` evita introducir todavía modales, estado adicional o componentes complejos. La prioridad de esta fase es entender HTTP, no construir un sistema de diseño avanzado.

### Problema real corregido

El dashboard todavía mostraba una ruta antigua para arrancar la API:

```txt
/Users/edefrutos/Desktop/express-api-demo/api
```

Se corrigió a:

```txt
/Users/edefrutos/Desktop/EDF-Lab-Educativo/api
```

### Aprendizaje

Para principiantes, el feedback `METODO endpoint -> resultado` es más útil que mostrar JSON crudo. Hace visible qué petición se acaba de enviar y conecta la acción del botón con el endpoint de Express.

### Cómo se valida

```bash
node --check dashboard/app.js
rg -n "POST /users|PUT /users/:id|DELETE /users/:id" dashboard docs missions NOTEBOOK.md
```

### Problema real: caché del navegador en el dashboard

Durante la revisión visual se veía el HTML nuevo, pero no aparecían los botones `Editar` y `Eliminar`, y el formulario no usaba el layout esperado.

Diagnóstico:

```txt
index.html actualizado
app.js/styles.css antiguos en caché del navegador
```

Solución aplicada:

```html
<link rel="stylesheet" href="./styles.css?v=phase-01-crud" />
<script src="./app.js?v=phase-01-crud"></script>
```

Aprendizaje: en proyectos estáticos, el navegador puede reutilizar CSS o JS anteriores aunque el HTML ya haya cambiado. Añadir una versión en la URL del asset fuerza la recarga sin introducir herramientas nuevas.

---

## 2026-05-26 · Sincronizacion documental

### Contexto

El codigo de `api/index.js` ya habia evolucionado hasta incluir rutas de lectura, rutas CRUD en memoria, validacion basica y endpoints auxiliares.

Sin embargo, parte de la documentacion seguia describiendo el estado anterior:

- `api/README.md` hablaba de una API minima con solo tres endpoints.
- varias instrucciones usaban rutas antiguas como `express-api-demo` o `test-project`.
- `ROADMAP.md` mantenia sin marcar tareas que ya estaban implementadas.

### Decision

Sin tocar la logica de la app, se sincronizo la documentacion con el estado real:

- `ROADMAP.md` ahora marca como completadas las tareas ya implementadas.
- `api/README.md` se reescribio con endpoints actuales y ejemplos ejecutables.
- `README.md`, `docs/` y `missions/` usan la ruta actual `EDF-Lab-Educativo`.
- `CHANGELOG.md` registra la version `0.2.0`.

### Aprendizaje

La documentacion tambien puede tener deuda tecnica. Cuando el codigo avanza y la documentacion no, el proyecto se vuelve mas dificil de aprender aunque funcione correctamente.

### Como se valida

```bash
node --check api/index.js
node --check dashboard/app.js
rg -n "express-api-demo|test-project|localhost:3000" README.md api/README.md ROADMAP.md docs missions
```

---

## 2026-05-25 · Evolución de la API mínima

### Contexto

La primera versión del laboratorio solo mostraba rutas de lectura:

- `GET /`
- `GET /health`
- `GET /users`

Eso servía para introducir Express y `fetch()`, pero se quedaba corta para enseñar operaciones típicas de una API.

### Decisión

Ampliar `api/index.js` con una API en memoria más útil para aprender:

- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /about`
- `GET /time`

Además, actualizar:

- `docs/03-api-express.md`,
- `docs/07-retos.md`,
- `README.md`.

### Motivo

Esto permite enseñar:

- parámetros de ruta,
- lectura de `req.body`,
- códigos HTTP básicos,
- creación, edición y borrado,
- endpoints utilitarios para practicar consumo desde el dashboard.

### Aprendizaje

Una API educativa gana mucho valor cuando no solo expone datos, sino que también permite modificarlos con un contrato simple y observable.
