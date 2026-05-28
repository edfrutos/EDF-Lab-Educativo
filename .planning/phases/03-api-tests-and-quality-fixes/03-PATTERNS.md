# Phase 03: api-tests-and-quality-fixes - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 5 (new/modified)
**Analogs found:** 4 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `api/index.test.js` | test | request-response | `api/index.js` (app bajo test) | role-new / data-match |
| `api/index.js` | utility + service | CRUD + file-I/O | sí mismo (modificación) | exact (self-mod) |
| `api/data/users.test.json` | config / fixture | file-I/O | `api/data/users.json` | exact |
| `api/package.json` | config | — | sí mismo (modificación) | exact (self-mod) |
| `api/README.md` | documentation | — | sí mismo (extensión) | exact (self-mod) |

---

## Pattern Assignments

### `api/index.test.js` (test, request-response)

**Analog:** `api/index.js` — es la app que se importa como objeto bajo test. No hay test existente; los patrones vienen del propio index.js combinado con las decisiones D-01..D-07.

**Imports pattern** — basado en decisiones D-01/D-03 + estructura de index.js:

```javascript
'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { writeFile, unlink } = require('fs/promises');
const path = require('path');

// CRÍTICO: DATA_FILE debe asignarse ANTES del require de index.js
// Node cachea módulos — si se importa primero, la env var no tiene efecto
const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;

const app = require('./index.js');
const request = require('supertest');
```

**Fixture / lifecycle pattern** — decisión D-04 + pitfall 5 de RESEARCH.md:

```javascript
// Semilla controlada: 2 usuarios conocidos, nextId=3
// NO usar copyFile(users.json) — ese archivo tiene 3 usuarios (estado de Fase 2)
const TEST_SEED = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};

beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
});

afterEach(async () => {
  // Cleanup: eliminar fixture tras cada test
  await unlink(TEST_FILE).catch(() => {});
});
```

**Core test pattern (Arrange-Act-Assert)** — extraído de decisión D-03 y estructura de route handlers en `api/index.js` líneas 89-238:

```javascript
describe('GET /health', () => {
  it('responde 200 con status healthy y timestamp', async () => {
    // Arrange — fixture listo por beforeEach
    // Act
    const res = await request(app).get('/health');
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');       // campo: api/index.js línea 219
    assert.ok(typeof res.body.timestamp === 'string'); // campo: api/index.js línea 220
  });
});

describe('GET /users', () => {
  it('responde 200 con array ordenado por nombre', async () => {
    // Arrange — 2 usuarios: John Doe y Jane Smith
    // Act
    const res = await request(app).get('/users');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    // getSortedUsers() usa _.sortBy(users, 'name') — api/index.js línea 29
    assert.equal(res.body[0].name, 'Jane Smith');
    assert.equal(res.body[1].name, 'John Doe');
  });
});
```

**Error response pattern** — copiar exactamente los mensajes de `api/index.js` (en español):

```javascript
// Fuente: api/index.js líneas 115, 121, 159, 165, 195, 201
// Los tests deben hacer assert sobre estos strings exactos:
//   400 ID inválido: { error: 'El parámetro ":id" debe ser un número entero.' }
//   404 no encontrado: { error: 'Usuario no encontrado.' }
//   400 payload: { error: 'El campo "name" es obligatorio y debe ser texto.' }
//   400 payload: { error: 'El campo "email" es obligatorio y debe ser texto.' }
//   DELETE OK: { message: 'Usuario eliminado correctamente.', user: { ... } }

describe('Validación de IDs', () => {
  it('GET /users/1abc responde 400', async () => {
    const res = await request(app).get('/users/1abc');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'El parámetro ":id" debe ser un número entero.');
  });

  it('GET /users/0 responde 400', async () => {
    const res = await request(app).get('/users/0');
    assert.equal(res.status, 400);
  });

  it('GET /users/abc responde 400', async () => {
    const res = await request(app).get('/users/abc');
    assert.equal(res.status, 400);
  });
});
```

---

### `api/index.js` — modificaciones puntuales (service, CRUD + file-I/O)

**Analog:** sí mismo. Tres cambios quirúrgicos sobre el archivo existente.

**Cambio 1 — DATA_FILE configurable** (sustituye líneas 7-8):

```javascript
// ANTES (api/index.js líneas 7-8):
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// DESPUÉS: DATA_FILE_PATH lee process.env.DATA_FILE si está seteado
const DATA_DIR       = path.join(__dirname, 'data');
const DATA_FILE_PATH = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(DATA_DIR, 'users.json');
// Nota: renombrar la constante a DATA_FILE_PATH para evitar colisión con process.env.DATA_FILE
```

Todas las referencias a `DATA_FILE` en `saveUsersData()` (línea 60) y `loadUsers()` (línea 65) pasan a usar `DATA_FILE_PATH`.

**Cambio 2 — guardia require.main** (sustituye líneas 255-258):

```javascript
// ANTES (api/index.js líneas 255-258):
startServer().catch((err) => {
  console.error('[error] No se pudo arrancar el servidor:', err);
  process.exit(1);
});

// DESPUÉS: startServer() solo corre si el archivo se ejecuta directamente
if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

**Cambio 3 — fix parseUserId** (sustituye líneas 32-36):

```javascript
// ANTES (api/index.js líneas 32-35) — BUG: parseInt('1abc',10) → 1
function parseUserId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) ? id : null;
}

// DESPUÉS — Number('1abc') → NaN, rechaza strings con prefijo numérico
function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
```

El patrón de error que rodea a parseUserId no cambia — los guard clauses existentes en líneas 113-116, 157-160, 194-197 permanecen idénticos.

---

### `api/data/users.test.json` (fixture, file-I/O)

**Analog:** `api/data/users.json` (líneas 1-20).

Este archivo es la semilla de tests. A diferencia de `users.json` (que tiene 3 usuarios por estado de Fase 2), el fixture de tests usa exactamente 2 usuarios con `nextId: 3` para que los tests sean predecibles.

```json
{
  "users": [
    { "id": 1, "name": "John Doe",   "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```

El archivo puede incluirse en git (como `users.json`) y sirve de documentación del estado inicial esperado por los tests. `beforeEach` lo sobreescribe con `writeFile` antes de cada test, por lo que su contenido en disco es siempre el canónico.

---

### `api/package.json` — actualización metadata + scripts (config)

**Analog:** sí mismo. Cambios sobre el archivo existente (líneas 1-25).

**Patrón existente a mantener** (líneas 10-17):

```json
"dependencies": {
  "cors": "^2.8.6",
  "express": "^4.18.2",
  "lodash": "^4.17.21"
},
"devDependencies": {
  "nodemon": "^3.1.14"
}
```

**Campos a modificar** (decisiones D-08, D-09 + añadir supertest):

```json
{
  "name": "edf-lab-api",
  "version": "1.0.0",
  "description": "API REST educativa para EDF Lab — enseña Express, JSON y CRUD a principiantes",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev":   "nodemon index.js",
    "test":  "node --test index.test.js --test-force-exit"
  },
  "keywords": ["educativo", "express", "rest-api", "crud", "node"],
  "author": "edefrutos",
  "license": "MIT",
  "devDependencies": {
    "nodemon": "^3.1.14",
    "supertest": "^7.2.2"
  }
}
```

La flag `--test-force-exit` es obligatoria: supertest puede dejar conexiones TCP abiertas en el servidor Express efímero que levanta internamente (pitfall 4 de RESEARCH.md).

---

### `api/README.md` — extensión con sección de comandos (documentation)

**Analog:** sí mismo. Extensión al final del archivo existente (actualmente líneas 261-300).

**Patrón de sección existente** — copiar el estilo de "## Validaciones recomendadas" (líneas 261-273): encabezado `##`, párrafo intro breve, bloque `bash`, resultado esperado en prosa.

**Nueva sección a añadir** (decisión D-10):

```markdown
## Comprobaciones y tests

Estos comandos comprueban la calidad del código desde `api/`:

**Sintaxis** — detecta errores de parseo JavaScript sin ejecutar el servidor:

```bash
node --check index.js
```

**Seguridad** — revisa vulnerabilidades conocidas en las dependencias:

```bash
npm audit --audit-level=high
```

**Tests automáticos** — ejecuta la suite de tests sobre todos los endpoints:

```bash
npm test
```

Resultado esperado: todos los tests en verde, proceso termina solo.

**Desarrollo con recarga automática** — arranca el servidor y lo reinicia al guardar cambios:

```bash
npm run dev
```

Útil durante el desarrollo: evita tener que parar y volver a arrancar manualmente.
```

---

## Shared Patterns

### Mensajes de error HTTP — español, formato `{ error: "..." }`

**Fuente:** `api/index.js` líneas 115, 121, 149, 159, 165, 186, 195, 201, 212
**Aplica a:** todos los asserts sobre `res.body.error` en `api/index.test.js`

```javascript
// Strings exactos que los tests deben esperar (no parafrasear):
{ error: 'El parámetro ":id" debe ser un número entero.' }   // 400 ID
{ error: 'Usuario no encontrado.' }                           // 404
{ error: 'El campo "name" es obligatorio y debe ser texto.' } // 400 payload
{ error: 'El campo "email" es obligatorio y debe ser texto.' }// 400 payload
{ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' } // 500
// DELETE 200:
{ message: 'Usuario eliminado correctamente.', user: { ... } }
```

### Guard clause con return temprano

**Fuente:** `api/index.js` líneas 113-116, 157-160, 194-197
**Aplica a:** los tests pueden asumir que si parseUserId devuelve null, el handler retorna 400 sin llegar a la lógica de negocio. No hay código de error alternativo a cubrir.

```javascript
// Patrón en index.js — no cambia en esta fase:
const userId = parseUserId(req.params.id);
if (userId === null) {
  return res.status(400).json({ error: 'El parámetro ":id" debe ser un número entero.' });
}
```

### Estructura de datos en disco

**Fuente:** `api/data/users.json` líneas 1-20 + `api/index.js` líneas 10-16 (SEED_DATA)
**Aplica a:** `api/data/users.test.json` debe seguir exactamente el mismo schema:

```json
{
  "users": [ { "id": <number>, "name": <string>, "email": <string> } ],
  "nextId": <number>
}
```

### async/await en handlers

**Fuente:** `api/index.js` líneas 127, 155, 192 (handlers POST/PUT/DELETE son async)
**Aplica a:** todos los `it()` en `api/index.test.js` deben ser `async` para hacer `await request(app).METHOD(...)`.

---

## No Analog Found

| File | Role | Data Flow | Razón |
|------|------|-----------|-------|
| `api/index.test.js` | test | request-response | No existe ningún test en el proyecto. El archivo se construye desde cero siguiendo patrones de `node:test` + supertest documentados en RESEARCH.md y los contratos de respuesta extraídos de `api/index.js`. |

---

## Metadata

**Analog search scope:** `api/` (único directorio con código fuente del backend)
**Files scanned:** `api/index.js` (259 líneas), `api/package.json` (25 líneas), `api/README.md` (300 líneas), `api/data/users.json` (20 líneas)
**Pattern extraction date:** 2026-05-28
