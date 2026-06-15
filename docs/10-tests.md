# Tests de la API

El laboratorio incluye una suite de tests automatizados que verifica que la API se comporta como se espera. Este documento explica por qué existen esos tests, cómo ejecutarlos y cómo añadir uno nuevo.

## Por qué existen los tests

Cuando cambias código en la API —añades un endpoint, corriges un bug, refactorizas un helper— lo más natural es abrir el navegador o lanzar un `curl` y comprobar que todo sigue funcionando. Eso funciona bien para un cambio puntual, pero cuando el proyecto crece, repetir esa comprobación manual a mano cada vez se vuelve lento y propenso a errores.

Los tests automatizados resuelven ese problema: en lugar de comprobar cada endpoint uno por uno, un solo comando ejecuta todas las verificaciones y te indica exactamente qué funciona y qué no. Cuando un test falla, el mensaje de error señala el caso concreto —por ejemplo, `POST /users responde 400 si name está vacío`— y puedes localizar el problema sin tener que explorar toda la API.

## Cómo ejecutar la suite

Desde la carpeta `api/`:

```bash
cd api
npm test
```

Desde la **raíz del repositorio** (equivalente):

```bash
npm test
```

### Qué incluye `npm test`

| Bloque | Archivo | Tests | Backend |
|--------|---------|-------|---------|
| CRUD + validación | `index.test.js` | 16 | SQLite (`DB_FILE` → `users.test.db`) |
| Autenticación | `index.test.js` (final) | 7 | SQLite |
| Rate limiting login | `rate-limit.test.js` | 1 | SQLite |
| CRUD + validación | `index.pg.test.js` | 16 | PostgreSQL (`edf_lab_test`) |
| Autenticación | `index.pg.test.js` (final) | 7 | PostgreSQL |

**Total con Postgres en marcha: 47 tests** (24 + 23).

Los 16 tests CRUD de cada archivo se ejecutan con `AUTH_DISABLED=1` (la variable la define el script en `package.json`). El bloque «Autenticación API» **sí** prueba login, cookies y 401 reales.

### Scripts útiles

| Script | Qué hace |
|--------|----------|
| `npm test` | SQLite + Postgres (46 si PG disponible) |
| `npm run test:sqlite` | Solo SQLite (24 tests, no requiere Postgres) |
| `npm run test:pg` | Solo Postgres (`edf_lab_test`) |
| `npm run test:db:prepare` | Crea la base `edf_lab_test` si no existe |
| `npm run test:e2e` | Smoke auth en los 3 dashboards (Playwright; raíz del repo) |
| `npm run test:e2e:ui` | Modo UI Playwright para depurar |
| `npm run playwright:install` | Instala Chromium (una vez, desde la raíz) |

## Smoke E2E (Playwright)

Prueba de humo en el **navegador** de los tres dashboards (`:5173` vanilla, `:5174` React, `:5175` Vue): gate de login → credenciales del operador → tabla de usuarios visible → cerrar sesión → gate de nuevo. Playwright arranca la API (`:3100`) y el frontend de cada proyecto; no hace falta levantar terminales a mano.

### Setup (primera vez)

```bash
# Desde la raíz del repositorio
npm install
npm run playwright:install
cd api && npm ci && cd ..
cd dashboard-react && npm ci && cd ..
cd dashboard-vue && npm ci && cd ..
```

### Ejecutar

```bash
npm run test:e2e
npm run test:e2e:ui    # depuración interactiva
```

### Auth en tests API vs E2E

| Contexto | `AUTH_DISABLED` | Autenticación |
|----------|-----------------|---------------|
| Tests API (`npm run test:sqlite`) | Sí (CRUD sin cookie) | Bloque «Autenticación API» prueba login real |
| Smoke E2E (`npm run test:e2e`) | **No** | Solo login UI (3 proyectos Playwright) |

Más contexto: [`17-autenticacion.md`](./17-autenticacion.md).

La matriz CI completa (sqlite + postgres + e2e en PRs) está en [CI en GitHub Actions](#ci-en-github-actions).

### Troubleshooting E2E

- **Puertos ocupados:** `lsof -i :3100 -i :5173 -i :5174 -i :5175` — cierra procesos viejos antes de `npm run test:e2e`.
- **Estado raro en SQLite E2E:** borra `api/data/e2e.users.db` y vuelve a ejecutar.
- **CI:** con `CI=true`, Playwright no reutiliza servidores locales (`reuseExistingServer: false`).

Antes de la suite Postgres:

```bash
# Desde la raíz
npm run test:db:prepare
docker compose up -d edf-lab-postgres   # si no tienes Postgres local
```

Si Postgres **no** está en `localhost:5432`, la segunda mitad de `npm test` falla (no hay skip silencioso).

Ejemplo de output de una ejecución correcta (fragmento):

```
▶ GET /health
  ✔ responde 200 con status healthy y timestamp
▶ Autenticación API
  ✔ GET /users sin cookie responde 401

ℹ tests 24
ℹ pass 24
ℹ fail 0
```

**Cómo leer el output:**

- `✔` — el test pasó: la API respondió exactamente lo esperado.
- `✗` — el test falló: algo no coincide. El mensaje de error indica qué valor se obtuvo y qué se esperaba.
- La línea `ℹ fail 0` es la que importa al final de cada archivo: si es `0`, ese bloque está en verde.

**Nota sobre `--test-force-exit`:** El script de `npm test` incluye el flag `--test-force-exit`. Supertest mantiene abierta la conexión HTTP del servidor mientras está en uso. Sin este flag, el runner de Node.js (`node:test`) esperaría indefinidamente a que el servidor cerrara, y el proceso nunca terminaría.

Más contexto SQLite vs PostgreSQL: [`13-sqlite.md`](./13-sqlite.md) (sección «Hacia PostgreSQL») y [`15-postgresql.md`](./15-postgresql.md).

## CI en GitHub Actions

Cada **push** o **pull request** a la rama `main` ejecuta el workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

1. Checkout del repositorio
2. Node.js 22 con caché de `npm` (requerido por `node:sqlite` en los tests)
3. **Tres jobs en paralelo** (todos obligatorios en PRs a `main`):
   - **`test-sqlite`** — `npm ci` y `npm run test:sqlite` dentro de `api/` (24 tests)
   - **`test-postgres`** — servicio `postgres:16`, healthcheck `pg_isready -d edf_lab_test`, `npm run test:pg` (23 tests; `AUTH_DISABLED=1` solo en este job API)
   - **`e2e-smoke`** — `npm ci` en raíz, `api/`, `dashboard-react/` y `dashboard-vue/`; Chromium; `npm run test:e2e` (smoke auth en vanilla, React y Vue; **sin** `AUTH_DISABLED`)

La matriz didáctica completa (duración esperada, troubleshooting) se amplía en la fase 29.

### Postgres en CI (detalle)

El job `test-postgres` usa el mismo contrato que en local:

| Variable / servicio | Valor |
|---------------------|-------|
| Imagen | `postgres:16` |
| Usuario / contraseña | `edf_lab` / `edf_lab_dev` |
| Base de tests | `edf_lab_test` |
| `DATABASE_URL` | `postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test` |

`POSTGRES_DB: edf_lab_test` en el servicio crea la base al arrancar; no hace falta `npm run test:db:prepare` en CI.

**Prerrequisitos locales (referencia):**

```bash
npm run test:db:prepare
docker compose up -d edf-lab-postgres
cd api && npm run test:pg
```

Fragmento equivalente en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (job `test-postgres`). Más contexto: [`15-postgresql.md`](./15-postgresql.md).

## JSON vs SQLite (cuándo usar cada uno)

Un archivo JSON (`users.json`) basta para aprender persistencia en disco con pocos datos y un solo proceso: es fácil de abrir, editar y entender. SQLite entra cuando necesitas reglas en el esquema (por ejemplo `UNIQUE` en email), consultas más expresivas o preparar el terreno para acceso concurrente. En este laboratorio, `users.json` sigue siendo la **fuente de semilla** al arrancar con una base vacía; el **almacén en runtime** es `data/users.db` (o Postgres si `DATABASE_URL` está definida).

## Cómo está estructurado index.test.js

### Setup: el orden de importación importa

El archivo empieza asignando la variable de entorno `DB_FILE` **antes** de importar `index.js`. También fija `AUTH_DISABLED=1` para los tests CRUD:

```javascript
const TEST_DB = path.join(__dirname, 'data', 'users.test.db');
process.env.DB_FILE = TEST_DB;
process.env.AUTH_DISABLED = '1';

const app = require('./index.js');
const request = require('supertest');
```

Node.js cachea los módulos la primera vez que se importan. Si `index.js` se importara antes de asignar `DB_FILE`, el módulo usaría `data/users.db` de producción en lugar del archivo aislado `data/users.test.db`.

Al final del archivo, `registerAuthApiTests()` (desde `test-auth-helpers.js`) registra el bloque «Autenticación API», que **quita** `AUTH_DISABLED` durante esos tests.

### beforeEach y afterEach: estado limpio en cada test

```javascript
beforeEach(async () => {
  await unlink(TEST_DB).catch(() => {});
  await app.initDb();
});

afterEach(async () => {
  await unlink(TEST_DB).catch(() => {});
});
```

`beforeEach` elimina el `.db` de test y llama a `initDb()`, que crea la tabla y, si está vacía, importa desde `users.json`. Para probar una base **sin filas**, un test puede llamar `await app.initDb({ skipSeed: true })` después del `unlink`.

### index.pg.test.js

Misma estructura de 16 tests CRUD, pero con `DATABASE_URL` apuntando a `edf_lab_test` y `TRUNCATE users RESTART IDENTITY` en `beforeEach` en lugar de borrar un archivo `.db`. Ver [`15-postgresql.md`](./15-postgresql.md).

### Patrón Arrange-Act-Assert

Cada test sigue el patrón AAA (Arrange-Act-Assert): preparar estado, ejecutar la petición HTTP, comprobar la respuesta.

### Grupos describe de la suite CRUD

1. `GET /health` — estado del servidor
2. `GET /users` — listado de usuarios
3. `POST /users` — creación y validación
4. `PUT /users/:id` — actualización y 404
5. `DELETE /users/:id` — borrado y 404
6. `Validación de IDs` — rechazo de IDs malformados
7. `Base de datos vacía` — listado con cero usuarios
8. `Email duplicado` — respuestas 409 y PUT con el mismo email

### Grupo «Autenticación API»

1. `GET /users` sin cookie → 401
2. `POST /auth/login` válido → 200 + cookie `edf_session`
3. `GET /users` con cookie → 200
4. Login con contraseña incorrecta → 403
5. `POST /auth/logout` invalida la sesión
6. `GET /health` público sin cookie
7. Cookie inválida → 401

Narrativa de login y cookies: [`17-autenticacion.md`](./17-autenticacion.md).

## Cómo añadir un test nuevo

Añade un bloque `describe`/`it` en `api/index.test.js` (y, si aplica, el mismo caso en `index.pg.test.js`). Ejecuta `npm test`. El contador subirá en uno o dos según dupliques el caso para Postgres.

Si el test llama a `/users` dentro del bloque CRUD, déjalo bajo el `AUTH_DISABLED` del setup del archivo. Si prueba auth, añádelo en `test-auth-helpers.js` o en un `describe` que no dependa de `AUTH_DISABLED`.
