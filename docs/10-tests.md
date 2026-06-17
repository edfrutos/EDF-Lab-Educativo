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
| `npm run test:db:prepare` | Crea `edf_lab_test` y `edf_lab_e2e` si no existen |
| `npm run test:e2e` | Smoke auth + CRUD en los 3 dashboards (6 tests Chromium; SQLite) |
| `npm run test:e2e:ci` | Mismos specs en Chromium + Firefox (12 tests; usa CI) |
| `npm run test:e2e:firefox` | Solo Firefox (6 tests; opt-in local) |
| `npm run test:visual` | Regresión visual en vanilla, React y Vue (3 tests Chromium) |
| `npm run test:visual:ci` | Regresión visual para CI (job `visual-regression`, 3 tests Chromium) |
| `npm run test:e2e:pg` | Mismos 6 tests contra API Postgres (`edf_lab_e2e`) |
| `npm run test:e2e:ui` | Modo UI Playwright para depurar |
| `npm run playwright:install` | Instala Chromium (una vez, desde la raíz) |
| `npm run playwright:install:ci` | Instala Chromium + Firefox (CI / multi-browser local) |

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

### CRUD E2E (tres dashboards)

Mismo ciclo en vanilla (`:5173`), React (`:5174`) y Vue (`:5175`): login UI → crear usuario con email único → editar nombre y email → eliminar con confirmación del navegador. Los tres dashboards comparten el helper `runCrudFlow` y los mismos `id` en formulario y tabla (`#user-name-input`, `#user-email-input`, `#user-submit-button`, `#users-table-body`).

| Pieza | Ubicación |
|-------|-----------|
| Helper | `e2e/helpers/crud-flow.js` — `runCrudFlow`, `buildCrudTestUser` |
| Spec vanilla | `e2e/tests/crud.vanilla.spec.js` |
| Spec React | `e2e/tests/crud.react.spec.js` |
| Spec Vue | `e2e/tests/crud.vue.spec.js` |

Ejecutar solo un spec CRUD:

```bash
npx playwright test crud.vanilla --config=e2e/playwright.config.js --project=vanilla-chromium
npx playwright test crud.react --config=e2e/playwright.config.js --project=react-chromium
npx playwright test crud.vue --config=e2e/playwright.config.js --project=vue-chromium
```

**Notas didácticas:**

- Cada ejecución genera emails `@lab.local` únicos para evitar duplicados en `api/data/e2e.users.db`.
- El delete del dashboard usa `confirm()` — el helper registra `page.once('dialog', accept)` antes del click en «Eliminar».
- Usa `#login-email` para el operador y `#user-email-input` para el usuario CRUD (no `getByLabel('Email')` global — ver `NOTEBOOK.md`, sección Quality & CI v2.0).
- React/Vue recibieron los mismos `id` que vanilla en `UserForm` y `UsersTable` para reutilizar el helper sin duplicar aserciones.

### Regresión visual (tres dashboards, fase 35)

La suite visual compara snapshots del panel autenticado en cada dashboard. Cada framework tiene su **baseline propia** (no se espera pixel-idéntico entre vanilla, React y Vue).

- Comando: `npm run test:visual` — **3 tests** (vanilla `:5173`, React `:5174`, Vue `:5175`)
- Captura: `#dashboard-panel` post-login (`dashboard-post-login.png` por spec)
- Masks anti-flake: `#health-timestamp`, `#users-table-body`
- Threshold inicial: `maxDiffPixelRatio: 0.01`
- Actualizar baseline: `npm run test:visual -- --update-snapshots` (solo cuando el cambio visual es intencional)
- Relación con E2E funcional: la regresión visual **no** reemplaza smoke auth ni CRUD; las complementa
- IDs visuales en React/Vue: `#dashboard-panel`, `#login-gate`, `#health-timestamp` (paridad con vanilla para `visual-flow.js`)

#### Visual en CI (fase 36)

- Job dedicado: `visual-regression` en `.github/workflows/ci.yml`
- Comando CI: `npm run test:visual:ci` (misma matriz visual Chromium de 3 dashboards)
- Si falla snapshot, el job publica artefactos (`test-results`, `playwright-report`) para revisar diffs desde el PR

Flujo recomendado cuando el cambio visual es intencional:

1. Ejecutar local: `npm run test:visual -- --update-snapshots`
2. Revisar los PNG cambiados por dashboard/spec (no aceptar cambios ciegamente)
3. Commit de baselines junto con el cambio UI y nota en el PR explicando por qué cambió la referencia

Este gate visual es **aditivo**: `test:e2e`, `test:e2e:ci` y `test:e2e:pg` siguen siendo la validación funcional principal.

### E2E contra Postgres

Playwright puede arrancar la API con **PostgreSQL** en lugar de SQLite. Usa una base dedicada — nunca la de desarrollo Compose ni la de tests API.

| Base | Uso | Cómo se crea |
|------|-----|--------------|
| `edf_lab` | Desarrollo Compose (`docker compose up`) | Volumen `postgres_data` |
| `edf_lab_test` | Tests API (`npm run test:pg`) | `npm run test:db:prepare` o `POSTGRES_DB` en CI |
| `edf_lab_e2e` | E2E Playwright Postgres (`npm run test:e2e:pg`) | `npm run test:db:prepare` o `POSTGRES_DB: edf_lab_e2e` en CI |

**No uses `edf_lab` para E2E** — mezclarías datos del laboratorio con ejecuciones automatizadas.

#### Local

```bash
docker compose up -d edf-lab-postgres   # o Postgres en localhost:5432
npm run test:db:prepare
npm run test:e2e:pg
```

Override opcional: `E2E_DATABASE_URL=postgresql://usuario:clave@host:5432/edf_lab_e2e`.

`npm run test:e2e` sigue siendo **SQLite** (`api/data/e2e.users.db`); Postgres E2E es opt-in vía `test:e2e:pg`.

Config: `e2e/playwright.config.pg.js` inyecta `DATABASE_URL` en el `webServer` de la API y **no** define `DB_FILE`.

#### CI

El job **`e2e-postgres`** ejecuta `npm run test:e2e:pg` con servicio `postgres:16` y `POSTGRES_DB: edf_lab_e2e`. Corre en paralelo con `test-sqlite`, `test-postgres` y `e2e-smoke`.

### Matriz de navegadores (local vs CI)

Los proyectos Playwright siguen el patrón `{dashboard}-{browser}` en `e2e/playwright.config.js` (vanilla, react, vue × chromium, firefox). WebKit solo en vanilla.

| Motor | Local | CI `e2e-smoke` | CI `e2e-postgres` |
|-------|-------|----------------|-------------------|
| **Chromium** | `npm run test:e2e` (6 tests) | ✓ vía `test:e2e:ci` | ✓ `test:e2e:pg` (6 tests) |
| **Firefox** | `npm run test:e2e:firefox` (6 tests) | ✓ vía `test:e2e:ci` | — |
| **WebKit** | `npx playwright install webkit` + `--project=vanilla-webkit` | — (documentado) | — |

Comandos útiles:

```bash
npm run test:e2e              # 6 tests Chromium (SQLite)
npm run test:e2e:ci           # 12 tests Chromium + Firefox (como CI e2e-smoke)
npm run test:e2e:firefox      # 6 tests Firefox
npx playwright install webkit
npx playwright test --config=e2e/playwright.config.js --project=vanilla-webkit
```

Misión CRUD E2E y depuración con trace: [`missions/17-crud-e2e-playwright.md`](../missions/17-crud-e2e-playwright.md).

Resumen v2.1: **CRUD** (`runCrudFlow`, tres dashboards) + **Postgres E2E** (`test:e2e:pg`, `edf_lab_e2e`) + **multi-browser** (Chromium/Firefox en CI).

### Auth en tests API vs E2E

| Contexto | `AUTH_DISABLED` | Autenticación |
|----------|-----------------|---------------|
| Tests API (`npm run test:sqlite`) | Sí (CRUD sin cookie) | Bloque «Autenticación API» prueba login real |
| Smoke E2E (`npm run test:e2e`) | **No** | Login UI + CRUD en 3 dashboards (6 tests Playwright) |

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
3. **Cuatro jobs en paralelo** (todos obligatorios en PRs a `main`):
   - **`test-sqlite`** — `npm ci` y `npm run test:sqlite` dentro de `api/` (24 tests)
   - **`test-postgres`** — servicio `postgres:16`, healthcheck `pg_isready -d edf_lab_test`, `npm run test:pg` (23 tests; `AUTH_DISABLED=1` solo en este job API)
   - **`e2e-smoke`** — Chromium + Firefox; `npm run test:e2e:ci` (12 tests: smoke auth + CRUD × 3 dashboards × 2 browsers; SQLite; **sin** `AUTH_DISABLED`)
   - **`e2e-postgres`** — mismo setup que `e2e-smoke` pero `npm run test:e2e:pg` contra `edf_lab_e2e` (servicio Postgres con `POSTGRES_DB: edf_lab_e2e`)

La matriz didáctica completa está en las secciones siguientes. Misión práctica: [`missions/16-smoke-e2e-playwright.md`](../missions/16-smoke-e2e-playwright.md).

### Por qué Postgres es obligatorio en PRs

Hasta v1.6, CI solo ejecutaba SQLite (`test-sqlite`). Eso cubre CRUD y auth con `node:sqlite`, pero **no** ejercita el camino PostgreSQL: `TRUNCATE`, secuencias, pool `pg` y errores de conexión reales.

| Motivo | Qué evita |
|--------|-----------|
| Paridad con Compose/producción | Mergear código que rompe solo con `DATABASE_URL` |
| Suite duplicada (`index.pg.test.js`) | Regresiones en el adaptador Postgres |
| Healthcheck en CI | Arrancar tests antes de que Postgres acepte conexiones |

En local puedes seguir con solo SQLite; en **cada PR a `main`**, los cuatro jobs deben pasar.

### Duración esperada de CI (orientativa)

Los cuatro jobs corren **en paralelo**; el tiempo de wall-clock lo marca el más lento (suele ser `e2e-smoke` o `e2e-postgres`).

| Job | Alcance | Tiempo típico (GitHub Actions) |
|-----|---------|--------------------------------|
| `test-sqlite` | 24 tests API (SQLite) | ~20–40 s |
| `test-postgres` | 23 tests API (Postgres 16) | ~40–90 s |
| `e2e-smoke` | 12 specs Playwright Chromium + Firefox (SQLite) | ~3–10 min |
| `e2e-postgres` | 6 specs Playwright Chromium (Postgres `edf_lab_e2e`) | ~2–8 min |

Primera ejecución en un PR nuevo puede tardar más (caché fría, `playwright install --with-deps`).

### Tres capas de confianza (tabla didáctica)

| Capa | Comando / job | `AUTH_DISABLED` | Qué valida |
|------|---------------|-----------------|------------|
| API SQLite | `npm run test:sqlite` / `test-sqlite` | Sí en bloque CRUD | Lógica HTTP, validación, auth en supertest |
| API Postgres | `npm run test:pg` / `test-postgres` | Sí en bloque CRUD (script) | Lo mismo contra `edf_lab_test` |
| Browser E2E (SQLite, CI) | `npm run test:e2e:ci` / `e2e-smoke` | **Nunca** | 12 tests Chromium + Firefox |
| Browser E2E (SQLite, local) | `npm run test:e2e` | **Nunca** | 6 tests Chromium |
| Browser E2E (Postgres) | `npm run test:e2e:pg` / `e2e-postgres` | **Nunca** | Mismos 6 tests con API en `edf_lab_e2e` |

`AUTH_DISABLED=1` acelera tests CRUD en supertest **sin** simular al operador en el navegador. E2E enseña el camino que ve el alumno: formulario → cookie → tabla → logout.

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
