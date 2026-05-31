# NOTEBOOK

Diario vivo del laboratorio educativo.

Aquí se documentan decisiones, errores reales, soluciones aplicadas y aprendizajes. No sustituye al README: lo complementa con contexto histórico y razonamiento.

---

## 2026-05-31 · Docker Compose v1.2 — errores de integración

### Docker daemon no disponible

**Síntoma:** Al ejecutar `npm run compose:up` o `docker compose up`:

```txt
Cannot connect to the Docker daemon. Is the docker daemon running?
```

**Causa:** Docker Desktop (o el daemon Docker) no está arrancado en tu Mac.

**Solución:**

```bash
# Abre Docker Desktop y espera a que esté listo
docker info
# Debe mostrar información del servidor sin error
npm run compose:up
```

**Aprendizaje:** Compose depende del mismo daemon que `docker run`. Sin daemon, ningún comando Docker funciona.

---

### EADDRINUSE en puerto 3100 (Docker + npm start)

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3100` al hacer `npm start` en `api/`.

**Causa:** Un contenedor Docker (`edf-lab-api`), el **stack Compose** (`edf-lab-api` vía `docker compose up`) u otra instancia de la API ya ocupa el puerto 3100 — habitual si probaste [`missions/09-arrancar-con-docker.md`](missions/09-arrancar-con-docker.md), [`missions/11-arrancar-con-compose.md`](missions/11-arrancar-con-compose.md) o Compose y no paraste los contenedores.

**Solución:**

```bash
docker ps
docker stop edf-lab-api
npm run compose:down
# o: docker compose down
# o identifica el PID que usa 3100 y para ese proceso
```

**Aprendizaje:** Solo un proceso puede escuchar en un puerto. No mezcles Docker en 3100 y `npm start` local sin parar el primero.

---

### EADDRINUSE en puerto 5173 (host + Compose dashboard)

**Síntoma:** El contenedor `edf-lab-dashboard` falla al arrancar; error de bind en puerto 5173.

**Causa:** `python3 -m http.server 5173` u otro proceso ya usa el puerto del dashboard en el host.

**Solución:** Para el servidor estático del host (`Ctrl+C`) o ejecuta `npm run compose:down` antes de volver a subir el stack.

**Aprendizaje:** Compose publica `:5173` en el host igual que el servidor Python de desarrollo — no pueden convivir sin cambiar puertos.

---

### Confusión: Misión 09 pierde datos pero Compose no

**Síntoma:** Tras Misión 09 el usuario creado desaparece; tras Misión 11 sobrevive. ¿Es un bug?

**Causa:** Misión 09 usa `docker run` **sin volumen** — SQLite efímero dentro del contenedor. Misión 11 usa Compose con **bind mount** `./api/data` — el mismo mecanismo que `npm start` en el host.

**Solución:** No es inconsistencia; son dos lecciones distintas. Consulta la tabla de tres modos en [`docs/12-docker.md`](docs/12-docker.md).

**Aprendizaje:** Los volúmenes (o su ausencia) definen si los datos sobreviven al ciclo de vida del contenedor.

---

## 2026-05-30 · SQLite v1.1 — avisos y errores de integración

### ExperimentalWarning al arrancar con node:sqlite

**Síntoma:** Al ejecutar `PORT=3100 npm start` aparece en consola:

```txt
(node:XXXX) ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

**Causa:** Node.js 22 expone `node:sqlite` como API experimental. El laboratorio la usa a propósito (cero dependencias npm).

**Solución:** En este lab puedes ignorar el aviso de forma segura. La API arranca y funciona con normalidad. Si desaparece en futuras versiones de Node, actualiza esta nota.

**Aprendizaje:** “Experimental” en Node no significa que tu código falle; significa que la API puede cambiar entre versiones mayores. Para producción muchos equipos usan `better-sqlite3` o PostgreSQL — ver [`docs/13-sqlite.md`](docs/13-sqlite.md).

---

### EADDRINUSE en puerto 3100 (Docker + npm start)

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3100` al hacer `npm start` en `api/`.

**Causa:** Un contenedor Docker (`edf-lab-api`), el stack Compose u otra instancia de la API ya ocupa el puerto 3100.

**Solución:** Ver la sección ampliada en [Docker Compose v1.2](#2026-05-31--docker-compose-v12--errores-de-integración) (incluye `npm run compose:down`).

**Aprendizaje:** Solo un proceso puede escuchar en un puerto. No mezcles Docker en 3100 y `npm start` local sin parar el primero.

---

### Migración cold start — log “Migrados N usuarios desde users.json”

**Síntoma:** Tras borrar `api/data/users.db` y reiniciar, algunos alumnos no ven el mensaje de migración o la tabla parece vacía.

**Causa:** La migración solo corre si `SELECT COUNT(*) FROM users` es 0 **después** de crear el esquema. Si la API no se reinició del todo o quedó un `.db` residual, no migra.

**Solución:**

```bash
cd api
rm -f data/users.db
PORT=3100 npm start
# Esperado: Migrados 2 usuarios desde users.json
curl -s http://localhost:3100/users
```

**Aprendizaje:** `users.json` es semilla; `users.db` es runtime. Borrar solo el JSON no resetea SQLite.

---

### HTTP 409 — email duplicado (UNIQUE constraint)

**Síntoma:** Crear un usuario con un email ya existente (p. ej. `john@example.com`) devuelve 409. El dashboard muestra un error genérico con “estado HTTP 409”.

**Causa:** `schema.sql` define `email TEXT NOT NULL UNIQUE`. SQLite rechaza el INSERT; `db.js` lanza `DuplicateEmailError` y la ruta responde 409 con `Ya existe un usuario con ese email.`

**Solución:** Usar un email distinto o editar el usuario existente. No es un fallo de CORS ni de conexión.

**Aprendizaje:** Las reglas de integridad pueden vivir en la base, no solo en JavaScript. Ver UAT Fase 7 y [`docs/13-sqlite.md`](docs/13-sqlite.md).

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


---

## Fase 3 — Fix: parseUserId rechazaba mal los IDs con prefijo numérico

**Fecha:** 2026-05-28
**Archivo:** `api/index.js` función `parseUserId()`

### Error encontrado

`Number.parseInt('1abc', 10)` devuelve `1` — acepta el prefijo numérico y descarta el resto.
Esto hacía que `GET /users/1abc` no devolviera 400 sino que buscaba el usuario con id=1.

### Comportamiento incorrecto

```bash
# Antes del fix:
curl http://localhost:3100/users/1abc
# → 200 { id: 1, name: 'John Doe', ... }  ← debería ser 400
```

### Fix aplicado

```javascript
// ANTES (bug):
function parseUserId(value) {
  const id = Number.parseInt(value, 10);  // '1abc' → 1
  return Number.isInteger(id) ? id : null;
}

// DESPUÉS (fix):
function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
```

### Aprendizaje

`Number.parseInt` está diseñado para parsear texto con unidades (`parseInt('10px')` → 10). Para validar que un string ES un entero puro, `Number()` es más estricto: convierte el string completo o devuelve `NaN`.

La condición `id > 0` también rechaza `0` como ID válido, lo que es correcto porque los IDs empiezan en 1.

### Tests que documentan el fix

```bash
# Desde api/
npm test
# Los tres casos están en la suite "Validación de IDs":
# ✓ GET /users/1abc responde 400
# ✓ GET /users/0 responde 400
# ✓ GET /users/abc responde 400
```

---

## Fase 3 — Fix: loadUsers() necesario en beforeEach cuando no hay startServer()

**Fecha:** 2026-05-28
**Archivo:** `api/index.test.js` — función `beforeEach` (líneas 29-34) + `api/index.js` (línea 251)

### Error encontrado

Al importar `api/index.js` para los tests con `require('./index.js')`, el guard
`require.main === module` impide que `startServer()` se ejecute. Esto significa que
`loadUsers()` nunca se llama al importar el módulo, y el array `users[]` arranca vacío.
El primer test que pedía `GET /users` devolvía `[]` en lugar de los 2 usuarios del fixture.

### Fix aplicado

```javascript
// ANTES (sin exportar loadUsers — los tests no podían recargar el estado):
module.exports = app;

// DESPUÉS (loadUsers exportado explícitamente):
module.exports = app;
module.exports.loadUsers = loadUsers;
```

Y en el test:

```javascript
beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test y recargar estado en memoria.
  // Necesario porque users[] es un array en memoria; sin startServer() el array está vacío.
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
  await app.loadUsers();  // ← esto es lo que carga users[] desde el fixture
});
```

### Aprendizaje

Cuando un módulo tiene estado en memoria (un array global como `users[]`), los tests deben
tener una forma de restaurar ese estado antes de cada caso. Exportar funciones de setup
(`loadUsers`) es el patrón estándar para esto en Node.js.

### Tests que documentan el fix

```bash
# Desde api/
npm test
# Todos los tests de GET /users y mutaciones dependen de beforeEach para tener datos válidos.
```

---

## Fase 3 — Decisión: guard require.main === module en api/index.js

**Fecha:** 2026-05-28
**Archivo:** `api/index.js` — bloque condicional final (líneas 260-265)

### Contexto

Los tests importan `api/index.js` con `require('./index.js')`.
Si el servidor arrancara al ser importado, el test runner abriría un puerto real
(3100) y `loadUsers()` leería del archivo de producción `data/users.json`
en lugar del fixture de tests `data/users.test.json`.

### Decisión aplicada

```javascript
// Sin el guard (problema): el servidor arranca SIEMPRE que alguien haga require('./index.js')
startServer();  // ← esto se ejecutaría al importar para tests

// Con el guard (solución): el servidor solo arranca cuando el archivo se ejecuta directamente
if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

### Aprendizaje

`require.main === module` es `true` cuando Node.js ejecuta el archivo directamente
(`node index.js`), y `false` cuando otro módulo lo importa (`require('./index.js')`).
Este patrón es habitual en cualquier módulo que deba funcionar tanto como programa
independiente como como librería importable.

```bash
# Verificar que index.js se puede importar sin arrancar el servidor:
node -e "const app = require('./api/index.js'); console.log('importado sin servidor')"
```

---

## 2026-05-27 · Observación: los datos en memoria desaparecen al reiniciar la API

### Contexto

Durante la Fase 2, antes de implementar la persistencia en archivo, el estado de la
API vivía únicamente en un array JavaScript en RAM (`let users = [...]`). Esta es
la configuración que verá cualquier alumno al clonar el proyecto por primera vez.

### Lo observado

```bash
# 1. Arrancar la API
cd api && PORT=3100 npm start

# 2. Crear un usuario
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno Prueba","email":"prueba@example.com"}'
# → { "id": 3, "name": "Alumno Prueba", ... }

# 3. Parar la API (Ctrl+C) y volver a arrancar
PORT=3100 npm start

# 4. Pedir la lista de usuarios
curl -s http://localhost:3100/users
# → Solo aparecen John Doe y Jane Smith — el usuario creado ha desaparecido.
```

Este comportamiento es el punto de partida de la Fase 2: motivar por qué existe la
persistencia en archivo.

### Aprendizaje

El estado de un proceso Node.js no persiste entre ejecuciones. Cuando el proceso
termina, la RAM se libera y con ella todos los arrays y objetos que vivían en memoria.
Para que los datos sobrevivan a un reinicio es necesario escribirlos en un medio
persistente (un archivo, una base de datos).

Ver la solución implementada en `docs/08-memoria-vs-persistencia.md`.

---

## Criterio para nuevas entradas

**NOTEBOOK = errores reales + decisiones no obvias.** Si algo te sorprendió, causó un bug, o requirió una decisión que no es evidente leyendo el código, va aquí.

**docs/ = conceptos enseñables desde cero.** Si necesitas explicar un concepto a alguien que no ha visto el problema, escribe un documento en `docs/`.
