# API Express del laboratorio

Backend educativo construido con **Node.js**, **Express**, **Lodash** y **CORS**.

Esta API sirve como base para aprender:

- rutas HTTP en Express,
- respuestas JSON,
- parametros de ruta,
- lectura de `req.body`,
- validacion basica,
- codigos HTTP,
- CRUD con persistencia SQLite (`users.db`),
- consumo desde un frontend separado.

La API vive en:

```txt
/Users/edefrutos/Desktop/EDF-Lab-Educativo/api
```

---

## Arranque

Desde esta carpeta:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

Resultado esperado en consola:

```txt
Server is running on port 3100
```

Prueba rapida:

```bash
curl http://localhost:3100/health
```

Resultado esperado:

```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

---

## Autenticación (fase 18)

Las rutas `/users` requieren sesión de **operador** (tabla `accounts`, distinta de los usuarios CRUD).

1. Copia la plantilla de variables:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
cp .env.example .env
```

2. En `.env`, define una clave larga para firmar JWT (variable `JWT_SECRET`). Los valores por defecto de operador son `admin@lab.local` / `changeme` si no cambias `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

3. Inicia sesión y usa la cookie en peticiones siguientes:

```bash
curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lab.local","password":"changeme"}'

curl -b /tmp/edf-cj http://localhost:3100/users
```

4. Cerrar sesión:

```bash
curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/logout
```

**Tests:** `AUTH_DISABLED=1` en `npm test` desactiva la protección solo en la suite CRUD. Los tests del bloque «Autenticación API» validan login real. No uses `AUTH_DISABLED` en producción.

Contrato OpenAPI: [`openapi.yaml`](openapi.yaml) — esquema `cookieAuth` y rutas `/auth/*`.

### Clientes frontend (credentials)

La sesión es la cookie httpOnly `edf_session`. El navegador **no** la envía en peticiones cross-origin salvo que el cliente pida credenciales explícitamente:

- `fetch(url, { credentials: 'include' })`
- Axios: `{ withCredentials: true }`

No uses `localStorage` ni cabecera `Authorization` con JWT en este laboratorio v1.5: el token vive solo en la cookie.

**Orígenes permitidos:** en `.env`, `CORS_ORIGINS` debe incluir los puertos del dashboard (`http://localhost:5173` vanilla, `5174` React, `5175` Vue) con `credentials: true` en el servidor (ya configurado en fase 18).

| App | Ruta del cliente | Puerto típico |
|-----|------------------|-----------------|
| Vanilla | `dashboard/app.js` — `fetchJson` con `credentials: 'include'` por defecto | 5173 |
| React | `dashboard-react/src/api.js` — añade `credentials: 'include'` en cada `fetch` | 5174 |
| Vue | `dashboard-vue/src/api.js` — mismo patrón que React | 5175 |

Ejemplo mínimo (vanilla):

```javascript
const response = await fetch('http://localhost:3100/users', {
  credentials: 'include'
});
```

Tras `POST /auth/login` con credenciales correctas, las peticiones a `:3100` deben llevar la cookie en la pestaña Network.

Narrativa didáctica completa: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

### Producción y secretos

1. Copia la plantilla: `cp .env.example .env`
2. Define `JWT_SECRET` con una cadena larga y aleatoria (nunca la subas al repositorio).
3. Con `NODE_ENV=production`, la API **no arranca** sin `JWT_SECRET` (fail-fast con mensaje en español).
4. Nunca uses `AUTH_DISABLED=1` en producción.

Ejemplo de arranque en modo producción (con `JWT_SECRET` ya definido en `.env`):

```bash
NODE_ENV=production PORT=3100 npm start
```

En Docker Compose, el mismo archivo `api/.env` se carga con `env_file` (ver plan de despliegue en [`docs/18-production-deploy.md`](../docs/18-production-deploy.md)).

---

## Opcional: Docker Compose

Desde la **raíz del repositorio** (no desde `api/`):

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo
npm run compose:up
```

Para parar: `npm run compose:down`.

La API en Compose escucha en el mismo puerto **3100**. SQLite persiste en `api/data/users.db` gracias al bind mount `./api/data` — la misma ruta que usa `npm start`.

Guía completa: [`docs/14-docker-compose.md`](../docs/14-docker-compose.md). Misión: [`missions/11-arrancar-con-compose.md`](../missions/11-arrancar-con-compose.md).

---

## Endpoints actuales

```txt
GET /
GET /health
POST /auth/login
POST /auth/logout
GET /users
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id
GET /about
GET /time
```

---

## Lectura de datos

### `GET /`

Devuelve informacion general de la API y la lista de endpoints.

```bash
curl http://localhost:3100/
```

### `GET /health`

Comprueba que el servidor esta vivo.

```bash
curl http://localhost:3100/health
```

### `GET /users`

Devuelve todos los usuarios ordenados por nombre.

```bash
curl http://localhost:3100/users
```

### `GET /users/:id`

Devuelve un usuario concreto.

```bash
curl http://localhost:3100/users/1
```

Respuestas importantes:

- `200`: usuario encontrado.
- `400`: el parametro `:id` no es un numero entero.
- `404`: no existe un usuario con ese identificador.

Ejemplo de error:

```bash
curl http://localhost:3100/users/abc
```

---

---

## Persistencia SQLite y migración desde JSON

Los usuarios se guardan en **`data/users.db`** (SQLite via `node:sqlite`). Al arrancar con una base vacía, la API importa automáticamente los usuarios de **`data/users.json`** y muestra en consola:

```txt
Migrados 2 usuarios desde users.json
```

`users.json` es solo **fuente de semilla/migración**; el runtime no lo reescribe en cada CRUD. Si el JSON falta o está vacío, se inserta la semilla John/Jane. Si el JSON está corrupto, se restaura la semilla y la API sigue arrancando.

Emails duplicados devuelven **409 Conflict** con el mensaje `Ya existe un usuario con ese email.`

Variable opcional: `DB_FILE` apunta a otra ruta de base de datos (útil en tests).

Guía didáctica ampliada: [`docs/13-sqlite.md`](../docs/13-sqlite.md). Misión práctica: [`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md).

---

## Escritura de datos

Los datos persisten en SQLite. Si borras `data/users.db` y reinicias, se vuelve a migrar desde `users.json`.

### `POST /users`

Crea un usuario.

```bash
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

Resultado esperado:

```json
{
  "id": 3,
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}
```

### `PUT /users/:id`

Actualiza un usuario existente.

```bash
curl -X PUT http://localhost:3100/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.doe@example.com"}'
```

### `DELETE /users/:id`

Elimina un usuario.

```bash
curl -X DELETE http://localhost:3100/users/1
```

---

## Validacion

`POST /users` y `PUT /users/:id` esperan este cuerpo JSON:

```json
{
  "name": "Nombre",
  "email": "correo@example.com"
}
```

Si falta `name` o `email`, o si llegan vacios, la API responde con `400`.

Ejemplo ejecutable:

```bash
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":""}'
```

Resultado esperado:

```json
{
  "error": "El campo \"name\" es obligatorio y debe ser texto."
}
```

---

## Endpoints auxiliares

### `GET /about`

Devuelve informacion del laboratorio.

```bash
curl http://localhost:3100/about
```

### `GET /time`

Devuelve la fecha y hora actual en formato ISO.

```bash
curl http://localhost:3100/time
```

---

## Conceptos clave en `index.js`

### Middleware

```js
app.use(cors());
app.use(express.json());
```

- `cors()` permite que el dashboard en `http://localhost:5173` lea respuestas de la API.
- `express.json()` permite leer JSON enviado en el cuerpo de `POST` y `PUT`.

### Parametros de ruta

```js
app.get('/users/:id', (req, res) => {
  const userId = parseUserId(req.params.id);
});
```

`req.params.id` contiene el valor que llega en la URL.

### Cuerpo de la peticion

```js
const { name, email } = req.body;
```

`req.body` contiene el JSON enviado por el cliente.

### Codigo HTTP

```js
return res.status(404).json({ error: 'Usuario no encontrado.' });
```

El codigo HTTP explica el resultado de la operacion:

- `200`: lectura o actualizacion correcta.
- `201`: recurso creado.
- `400`: peticion invalida.
- `404`: recurso inexistente.
- `500`: error inesperado.

---

## Comprobaciones y tests

Estos comandos comprueban la calidad del código. Ejecútalos desde `api/`.

**Sintaxis** — detecta errores de parseo JavaScript sin ejecutar el servidor:

```bash
node --check index.js
```

**Seguridad** — revisa vulnerabilidades conocidas en las dependencias:

```bash
npm audit --audit-level=high
```

**Tests automáticos** — por cada backend: 16 tests CRUD + 7 de autenticación:

```bash
npm test
```

Requisitos para la suite completa: Postgres en `localhost:5432` y base de test creada con `npm run test:db:prepare` (desde la raíz del repo o `npm run test:db:prepare` en `api/`).

| Script | Qué hace |
|--------|----------|
| `npm test` | SQLite + Postgres (**46 tests** si Postgres está en marcha) |
| `npm run test:sqlite` | Solo SQLite (**23 tests**, no requiere Postgres) |
| `npm run test:pg` | Solo Postgres (`edf_lab_test`, 23 tests) |
| `npm run test:db:prepare` | Crea `edf_lab_test` si no existe |

Más contexto SQLite vs PostgreSQL: [`docs/13-sqlite.md`](../docs/13-sqlite.md) (sección «Hacia PostgreSQL») y guía dedicada [`docs/15-postgresql.md`](../docs/15-postgresql.md).

**Compose** define `DATABASE_URL` en el contenedor API → Postgres. **Host** sin esa variable → SQLite (`users.db`).

Resultado esperado: todos los tests en verde. El proceso termina solo (sin Ctrl+C).

**Desarrollo con recarga automática** — arranca el servidor y lo reinicia al guardar cambios:

```bash
npm run dev
```

Útil durante el desarrollo: evita tener que parar y volver a arrancar manualmente.

---

## Relacion con el dashboard

El dashboard vanilla esta en `dashboard/` (puerto **5173**).

Flujo actual:

1. `POST /auth/login` — sesión del operador (cookie httpOnly).
2. `GET /health`, `GET /`, `GET /users` — con `credentials: 'include'`.
3. CRUD: `POST`, `PUT`, `DELETE` en `/users`.

Tambien existen `GET /about` y `GET /time` (publicos).

Paneles opcionales React (`:5174`) y Vue (`:5175`): ver [`docs/16-frameworks.md`](../docs/16-frameworks.md). En v1.4 no incluyen pantalla de login; para pruebas locales puedes usar `AUTH_DISABLED=1` en `.env`.
