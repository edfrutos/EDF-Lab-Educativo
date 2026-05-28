# Phase 3: API Tests and Quality Fixes - Research

**Researched:** 2026-05-28
**Domain:** Node.js API testing (node:test + supertest), Express app quality fixes
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Runner: `node:test` (nativo Node 22) + `supertest` (única dependencia nueva de desarrollo). Sin instalar Jest, Mocha ni Vitest.
- **D-02:** Fichero único `api/index.test.js` junto a `api/index.js`.
- **D-03:** Estilo Arrange-Act-Assert con comentarios `// Arrange`, `// Act`, `// Assert`.
- **D-04:** Aislamiento con `api/data/users.test.json` como fixture. `DATA_FILE` env var controla la ruta. `beforeEach` copia la semilla; `afterEach` limpia. `api/data/users.json` nunca se toca en tests.
- **D-05:** Tests solo comprueban comportamiento HTTP (códigos de estado + JSON bodies). No leen archivo en disco.
- **D-06:** Fix `parseUserId()`: reemplazar `Number.parseInt(value, 10)` por `Number(value)` con comprobación `Number.isInteger(id) && id > 0`. Comentario inline explicando la diferencia.
- **D-07:** Tests de validación de IDs: `GET /users/1abc` → 400, `GET /users/0` → 400, `GET /users/abc` → 400.
- **D-08:** Metadata `api/package.json`: `name: 'edf-lab-api'`, descripción educativa, author del propietario, keywords educativos.
- **D-09:** Script `"dev": "nodemon index.js"` en `api/package.json` (nodemon ya en devDependencies).
- **D-10:** Sección `## Comprobaciones y tests` en `api/README.md` con los cuatro comandos explicados.

### Claude's Discretion

- Organización interna de `api/index.test.js` (orden de suites, agrupación de casos).
- Mensaje de error HTTP 400 para IDs inválidos: mantener patrón existente en español.
- Contenido exacto de la semilla en `api/data/users.test.json`.

### Deferred Ideas (OUT OF SCOPE)

- Módulo separado `api/persistence.js`.
- Coverage con `--experimental-coverage`.
- Tests del dashboard (Playwright, Puppeteer).
- Mock de `fs/promises` con node:test mock API.
- Tests de frontend.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEST-01 | API test command runs successfully from `api/` | Confirmado: `node --test index.test.js` con supertest. npm test script actualizado. |
| TEST-02 | Tests cover `GET /health` and `GET /users` | Endpoints verificados en api/index.js. Respuesta JSON conocida. |
| TEST-03 | Tests cover `POST /users`, `PUT /users/:id`, `DELETE /users/:id` | Handlers async ya presentes. Fixture users.test.json necesario para aislamiento. |
| TEST-04 | Tests cover validation failures for invalid IDs and invalid user payloads | Bug confirmado en parseUserId (líneas 32-35). Fix documentado en D-06/D-07. |
| TEST-05 | Documentation explains how to run and interpret the API tests | Sección nueva en api/README.md (QUAL-05 también cubierto). |
| QUAL-01 | API package metadata reflects the educational lab | api/package.json verificado: name="test-project", description genérica. Fix directo. |
| QUAL-02 | Development script with Nodemon exists | nodemon 3.1.14 en devDependencies. Falta script "dev". Fix directo. |
| QUAL-03 | User ID parsing rejects partial numeric strings like `1abc` | Bug verificado: parseInt('1abc',10)→1. Fix: Number('1abc')→NaN. Lógica verificada. |
| QUAL-05 | Validation commands are documented and runnable | api/README.md tiene sección parcial (node --check, npm audit). Falta npm test y npm run dev. |

</phase_requirements>

---

## Summary

Esta fase tiene tres partes bien delimitadas: (1) instalar `supertest` y escribir `api/index.test.js` cubriendo todos los endpoints con `node:test`, (2) corregir el bug `parseUserId` y añadir tests para los tres casos de ID inválido, y (3) limpiar metadata de `api/package.json`, añadir el script `dev`, y completar la sección de validación en `api/README.md`.

El stack ya está preparado: Node 22.22.3 tiene `node:test` con todas las APIs necesarias (`describe`, `it`, `beforeEach`, `afterEach`, `before`, `after`), `node:assert/strict` disponible, y `module.exports = app` ya presente en `api/index.js` para que supertest pueda importar la app sin arrancar el servidor. El único cambio estructural necesario en `api/index.js` es hacer la ruta del archivo de datos configurable vía `process.env.DATA_FILE`.

El aislamiento de persistencia es el punto técnico más delicado: los tests de mutación (POST/PUT/DELETE) deben operar sobre `api/data/users.test.json` para nunca contaminar `api/data/users.json`. Esto requiere que `api/index.js` lea la ruta del archivo desde `process.env.DATA_FILE || path.join(__dirname, 'data/users.json')` en lugar del valor hardcodeado actual.

**Primary recommendation:** Instalar supertest como devDependency, cambiar una línea en index.js para DATA_FILE configurable, escribir el fichero de test único con Arrange/Act/Assert, corregir parseUserId con Number(), y actualizar package.json y README.md. Todo el trabajo es de baja complejidad y alta legibilidad educativa.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Tests HTTP de la API | API / Backend | — | supertest importa la app Express directamente; no hay capa de frontend involucrada |
| Aislamiento de persistencia en tests | API / Backend | Sistema de archivos (fixture) | DATA_FILE env var controla qué archivo usa el proceso en test |
| Fix de parseUserId | API / Backend | — | Función helper en index.js; cambio de una línea en lógica de validación de entrada |
| Limpieza de metadata (package.json) | Config del proyecto | — | Solo afecta npm identity, no comportamiento de la app |
| Script nodemon | Config del proyecto | — | devDependency ya instalada, falta exposición en scripts |
| Documentación de comandos | Documentación (api/README.md) | — | Sección nueva; no cambia código ni comportamiento observable |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:test` | built-in (Node 22) | Test runner: describe/it/before/after hooks | Nativo Node 22, cero dependencias, sintaxis familiar para principiantes [VERIFIED: node --help] |
| `node:assert/strict` | built-in (Node 22) | Assertions | Nativo Node 22, mensajes de error claros [VERIFIED: node -e test] |
| `supertest` | 7.2.2 | HTTP test client para Express | Importa `app` directamente sin arrancar servidor en puerto real; sintaxis `request(app).get('/health').expect(200)` muy legible [VERIFIED: npm registry 2026-01-06] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `nodemon` | 3.1.14 | Hot-reload durante desarrollo | Ya en devDependencies. Solo falta script `dev`. No instalar nada. [VERIFIED: npm registry 2026-03-06] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node:test` | Jest, Mocha, Vitest | Requieren instalar dependencias adicionales; innecesario para este proyecto educativo. Decisión D-01 bloqueada. |
| `node:assert/strict` | chai, expect de Jest | Dependencia extra sin valor añadido aquí |

**Installation:**
```bash
cd api
npm install --save-dev supertest
```

**Version verification:** [VERIFIED: npm registry]
- `supertest`: 7.2.2 (publicado 2026-01-06)
- `nodemon`: 3.1.14 (publicado 2026-03-06) — ya instalado

---

## Architecture Patterns

### System Architecture Diagram

```
npm test (api/)
    │
    ▼
node --test index.test.js --test-force-exit
    │
    ▼
index.test.js
  ├── require('supertest') → request(app)
  ├── require('./index.js') → Express app (sin arrancar servidor)
  │       └── loadUsers() lee DATA_FILE=data/users.test.json
  │
  ├── beforeEach → copia users.seed.json → users.test.json
  ├── afterEach  → elimina users.test.json
  │
  ├── describe('GET /health') → request(app).get('/health').expect(200)
  ├── describe('GET /users')  → verifica array + ordenación
  ├── describe('POST /users') → crea usuario, verifica 201 + body
  ├── describe('PUT /users/:id') → actualiza, verifica 200 + body
  ├── describe('DELETE /users/:id') → elimina, verifica 200 + message
  └── describe('Validación IDs') → 1abc→400, 0→400, abc→400
```

### Recommended Project Structure

```
api/
├── data/
│   ├── users.json          # seed real (no tocar en tests)
│   └── users.test.json     # fixture de tests (creado/destruido por beforeEach/afterEach)
├── index.js                # app Express (module.exports = app)
├── index.test.js           # suite única de tests (nuevo)
├── package.json            # actualizar name, description, scripts.test, scripts.dev
├── package-lock.json
└── README.md               # añadir sección ## Comprobaciones y tests
```

### Pattern 1: Importar app sin arrancar servidor (Supertest + module.exports)

**What:** `supertest` llama internamente a `app.listen(0)` en un puerto efímero. No interfiere con `startServer()` porque ese código solo corre si el módulo se ejecuta directamente (`require.main === module`), no cuando se importa.

**Importante:** En `api/index.js` actual, `startServer()` se llama incondicionalmente al final. Hay que protegerlo:

```javascript
// Source: patrón estándar Express + supertest [VERIFIED: Context7 /forwardemail/supertest]
// Al final de api/index.js — REEMPLAZAR las últimas 4 líneas por:
module.exports = app;

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[error] No se pudo arrancar el servidor:', err);
    process.exit(1);
  });
}
```

**Situación actual:** `module.exports = app` YA está presente (línea 246). Pero `startServer()` se llama sin guardia (líneas 248-252). Si no se añade la guardia `require.main === module`, importar `index.js` desde los tests disparará `loadUsers()` y `app.listen()` innecesariamente.

### Pattern 2: Aislamiento de persistencia con DATA_FILE

**What:** Cambiar la ruta del archivo de datos de hardcodeada a configurable vía env var.

```javascript
// Source: api/index.js líneas 7-8 actuales — REEMPLAZAR por:
const DATA_DIR  = path.join(__dirname, 'data');
// [VERIFIED: comportamiento confirmado en index.js actual]
const DATA_FILE_PATH = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(DATA_DIR, 'users.json');
```

Luego en `saveUsersData` y `loadUsers`, usar `DATA_FILE_PATH` en lugar de `DATA_FILE` (la constante actual).

**Nota de naming:** La constante actual se llama `DATA_FILE` (línea 8). Al añadir soporte para env var, renombrar la constante interna a `DATA_FILE_PATH` evita colisión con `process.env.DATA_FILE`.

### Pattern 3: Estructura de test con node:test + supertest + async/await

```javascript
// Source: Context7 /forwardemail/supertest — async/await pattern
// Source: node:test built-in — verified Node 22.22.3
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { copyFile, unlink } = require('fs/promises');
const path = require('path');

// DATA_FILE se inyecta ANTES de require('./index.js')
process.env.DATA_FILE = path.join(__dirname, 'data', 'users.test.json');
const app = require('./index.js');

const SEED_FILE   = path.join(__dirname, 'data', 'users.json');
const TEST_FILE   = path.join(__dirname, 'data', 'users.test.json');

beforeEach(async () => {
  // Arrange: restaurar fixture limpio antes de cada test
  await copyFile(SEED_FILE, TEST_FILE);
});

afterEach(async () => {
  // Cleanup: eliminar archivo de test tras cada test
  await unlink(TEST_FILE).catch(() => {});
});

describe('GET /health', () => {
  it('responde 200 con status healthy', async () => {
    // Arrange — (fixture ya preparado por beforeEach)
    // Act
    const res = await request(app).get('/health');
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(res.body.timestamp);
  });
});
```

**Nota crítica sobre el orden de imports:** `process.env.DATA_FILE` DEBE asignarse ANTES de `require('./index.js')`. En Node.js, `require` cachea módulos — si index.js se importa antes de setear la env var, usará el path por defecto.

### Pattern 4: npm test script para node:test

```json
{
  "scripts": {
    "test": "node --test index.test.js --test-force-exit",
    "dev":  "nodemon index.js",
    "start": "node index.js"
  }
}
```

`--test-force-exit` es necesario porque `supertest` puede dejar el proceso Express colgado esperando conexiones abiertas. [VERIFIED: node --help Node 22.22.3]

### Pattern 5: Fix de parseUserId

```javascript
// ANTES (bug: parseInt('1abc', 10) → 1)
function parseUserId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) ? id : null;
}

// DESPUÉS (fix: Number('1abc') → NaN)
// [VERIFIED: node -e "..." — comportamiento confirmado]
function parseUserId(value) {
  // Number.parseInt('1abc', 10) devuelve 1 — acepta prefijo numérico.
  // Number('1abc') devuelve NaN — rechaza cualquier carácter no numérico.
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
```

**Casos verificados:** [VERIFIED: node -e]
- `Number('1abc')` → NaN → `null` (corregido)
- `Number('0')` → 0 → `null` (0 > 0 = false, correcto)
- `Number('abc')` → NaN → `null` (correcto)
- `Number('1')` → 1 → `1` (correcto)
- `Number('1.5')` → 1.5 → `null` (isInteger = false, correcto)
- `Number(' 1 ')` → 1 → `1` (trims whitespace — comportamiento aceptable para IDs)

### Anti-Patterns to Avoid

- **Importar app sin proteger startServer():** Si no se añade `require.main === module`, el test arranca el servidor real y puede causar conflictos de puerto o cargar el archivo de datos real.
- **Asignar DATA_FILE después de require('./index.js'):** Node cachea módulos. La env var debe estar seteada antes del primer require.
- **Leer el archivo en disco para verificar persistencia:** Los tests deben verificar solo comportamiento HTTP (D-05). Reduce fragilidad y tiempo de ejecución.
- **Usar `before()` en lugar de `beforeEach()` para restaurar fixture:** Cada test mutante (POST/PUT/DELETE) necesita fixture limpio. `before()` solo corre una vez.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP assertions sobre Express | Arrancar servidor en puerto real, usar `http.get()` manual | `supertest` | Gestiona lifecycle del servidor automáticamente, sintaxis limpia, maneja conexiones abiertas |
| Fixture reset entre tests | Lógica custom de serialización/deserialización en memoria | `fs/promises.copyFile` + `unlink` | Dos líneas, reproduce el estado real de disco que la app usaría |
| Validación de enteros desde string | Regex custom, múltiples comprobaciones | `Number(value)` + `Number.isInteger()` + `> 0` | Una línea, comportamiento estándar JavaScript verificado |

**Key insight:** El aislamiento de persistencia con un archivo real es más didáctico y menos frágil que mockear `fs/promises`. El alumno puede inspeccionar `users.test.json` durante la ejecución si quiere entender qué está pasando.

---

## Common Pitfalls

### Pitfall 1: startServer() se ejecuta al importar el módulo en tests

**What goes wrong:** `require('./index.js')` en el test file llama `startServer()`, que llama `loadUsers()` y `app.listen()`. Si DATA_FILE no está configurado, carga `users.json` real. Si el puerto está ocupado, el test explota.

**Why it happens:** `api/index.js` llama `startServer()` incondicionalmente en las líneas 255-258. `module.exports = app` está en línea 246 pero no impide que el código posterior se ejecute.

**How to avoid:** Añadir guardia `if (require.main === module)` alrededor de la llamada a `startServer()`.

**Warning signs:** Mensaje `Servidor arrancado en http://localhost:PORT` en output de tests.

### Pitfall 2: Orden de asignación de DATA_FILE vs require

**What goes wrong:** `loadUsers()` lee `data/users.json` real en lugar de `data/users.test.json`. Los tests de mutación contaminan datos reales.

**Why it happens:** Node.js evalúa el módulo completo en el primer `require`. Si `process.env.DATA_FILE` no está seteado antes de ese primer require, la constante `DATA_FILE_PATH` queda con el valor por defecto.

**How to avoid:** En `index.test.js`, setear `process.env.DATA_FILE` antes del require de `./index.js`. En el mismo bloque de declaraciones, sin líneas intermedias.

**Warning signs:** El seed de test y el seed real tienen el mismo contenido inicial, así que el bug es silencioso hasta que un test de mutación "pasa" pero ha modificado el archivo real.

### Pitfall 3: Tests de mutación sin beforeEach

**What goes wrong:** Tests se contaminan entre sí. `DELETE /users/1` pasa en el primer test, falla en el segundo porque el usuario ya fue borrado.

**Why it happens:** El estado del fixture persiste en disco entre tests si no se restaura.

**How to avoid:** `beforeEach` copia siempre el seed al archivo de test. Cada test parte de un estado limpio y conocido.

**Warning signs:** Tests pasan en aislamiento (`--test-name-pattern`) pero fallan al ejecutar la suite completa.

### Pitfall 4: supertest deja proceso colgado sin --test-force-exit

**What goes wrong:** `npm test` completa todos los asserts pero el proceso no termina. Hay que hacer Ctrl+C.

**Why it happens:** supertest puede dejar conexiones TCP abiertas en el servidor Express efímero que levanta internamente.

**How to avoid:** Usar `node --test index.test.js --test-force-exit` en el script `test` de package.json.

**Warning signs:** Tests pasan pero el proceso no sale (el prompt no vuelve).

### Pitfall 5: Seed de users.json con estado modificado por fase anterior

**What goes wrong:** `users.json` actual tiene 3 usuarios (nextId: 4) porque la Fase 2 añadió "Alumno Persistente". Los tests que asumen exactamente 2 usuarios en el fixture fallarán.

**Why it happens:** El archivo en disco refleja el estado de uso, no el seed original de 2 usuarios.

**How to avoid:** El seed de `users.test.json` debe ser un fixture controlado — puede ser los 2 usuarios originales o un subset explícito. No copiar users.json tal cual como seed de tests.

**Warning signs:** `GET /users` devuelve 3 elementos cuando el test espera 2.

---

## Code Examples

### Suite completa con estructura recomendada

```javascript
// api/index.test.js
// Source: Decisiones D-01..D-07 de CONTEXT.md + Context7 /forwardemail/supertest

'use strict';

const { describe, it, before, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { copyFile, writeFile, unlink } = require('fs/promises');
const path = require('path');

// CRÍTICO: DATA_FILE debe asignarse antes del require de index.js
const TEST_FILE = path.join(__dirname, 'data', 'users.test.json');
process.env.DATA_FILE = TEST_FILE;

const app = require('./index.js');
const request = require('supertest');

// Semilla controlada para tests — 2 usuarios conocidos, nextId=3
const TEST_SEED = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};

beforeEach(async () => {
  // Arrange: fixture limpio antes de cada test
  await writeFile(TEST_FILE, JSON.stringify(TEST_SEED, null, 2), 'utf8');
});

afterEach(async () => {
  // Cleanup
  await unlink(TEST_FILE).catch(() => {});
});

// ── GET /health ───────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('responde 200 con status healthy y timestamp', async () => {
    // Arrange — fixture listo (beforeEach)
    // Act
    const res = await request(app).get('/health');
    // Assert
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(typeof res.body.timestamp === 'string');
  });
});

// ── GET /users ────────────────────────────────────────────────────────────────

describe('GET /users', () => {
  it('responde 200 con array de usuarios ordenados por nombre', async () => {
    // Arrange — fixture con John Doe y Jane Smith
    // Act
    const res = await request(app).get('/users');
    // Assert
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 2);
    // Jane Smith precede a John Doe (orden alfabético)
    assert.equal(res.body[0].name, 'Jane Smith');
    assert.equal(res.body[1].name, 'John Doe');
  });
});

// ── POST /users ───────────────────────────────────────────────────────────────

describe('POST /users', () => {
  it('crea un usuario válido y responde 201 con el objeto creado', async () => {
    // Arrange
    const payload = { name: 'Nueva Persona', email: 'nueva@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 201);
    assert.equal(res.body.name, payload.name);
    assert.equal(res.body.email, payload.email);
    assert.ok(typeof res.body.id === 'number');
  });

  it('responde 400 si name está vacío', async () => {
    // Arrange
    const payload = { name: '', email: 'x@example.com' };
    // Act
    const res = await request(app).post('/users').send(payload);
    // Assert
    assert.equal(res.status, 400);
    assert.ok(typeof res.body.error === 'string');
  });
});

// ── Validación de IDs ─────────────────────────────────────────────────────────

describe('Validación de IDs', () => {
  it('GET /users/1abc responde 400 (string con prefijo numérico)', async () => {
    const res = await request(app).get('/users/1abc');
    assert.equal(res.status, 400);
  });

  it('GET /users/0 responde 400 (cero no es ID válido)', async () => {
    const res = await request(app).get('/users/0');
    assert.equal(res.status, 400);
  });

  it('GET /users/abc responde 400 (string no numérico)', async () => {
    const res = await request(app).get('/users/abc');
    assert.equal(res.status, 400);
  });
});
```

### package.json actualizado (scripts + metadata)

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
  "dependencies": { ... },
  "devDependencies": {
    "nodemon": "^3.1.14",
    "supertest": "^7.2.2"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Number.parseInt(value, 10)` para validar IDs | `Number(value)` + `Number.isInteger()` + `> 0` | Esta fase (fix D-06) | Rechaza `1abc` correctamente |
| `npm test` → error placeholder | `node --test index.test.js --test-force-exit` | Esta fase | TEST-01 satisfecho |
| `DATA_FILE` hardcodeado en index.js | `process.env.DATA_FILE \|\| path.join(__dirname, 'data/users.json')` | Esta fase | Aislamiento de tests posible |
| `module.exports = app` sin guardia | `if (require.main === module) startServer()` | Esta fase | import seguro desde tests |

**Deprecated/outdated:**
- Placeholder `"test": "echo \"Error: no test specified\" && exit 1"`: reemplazar por script real.
- `startServer()` llamado incondicionalmente: mover dentro de guardia `require.main === module`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `node:test`, `node:assert` | ✓ | v22.22.3 | — |
| `node:test` | Test runner | ✓ | built-in Node 22 | — |
| `node:assert/strict` | Assertions | ✓ | built-in Node 22 | — |
| `supertest` | HTTP test client | ✗ (no instalado) | — | Instalar: `npm install --save-dev supertest` |
| `nodemon` | Script `dev` | ✓ (en devDependencies) | 3.1.14 | — (ya instalado) |
| `api/data/users.test.json` | Fixture de tests | ✗ (no existe) | — | Creado en Wave 0 o por beforeEach/writeFile |

**Missing dependencies with no fallback:**
- `supertest` — debe instalarse antes de que `npm test` funcione.

**Missing dependencies with fallback:**
- `api/data/users.test.json` — el archivo no existe pero `beforeEach` lo crea con `writeFile`. No es bloqueante, pero el directorio `api/data/` debe existir (ya existe).

---

## Open Questions

1. **Orden de ejecución de tests y estado compartido del módulo cacheado**
   - What we know: Node.js cachea módulos. Si `index.js` carga `DATA_FILE_PATH` en tiempo de import (como constante de módulo), cambiar `process.env.DATA_FILE` después no tiene efecto.
   - What's unclear: Si la ruta del archivo se almacena como constante en el módulo o se evalúa en cada llamada a `loadUsers()`/`saveUsers()`.
   - Recommendation: En el código actual (línea 8), `DATA_FILE` es una constante de módulo. Necesita reemplazarse por una expresión lazy o evaluada en runtime. La decisión D-04 asume este cambio — el plan debe incluirlo explícitamente como tarea.

2. **Seed para users.test.json: ¿copiar users.json o usar seed hardcodeado en el test?**
   - What we know: `users.json` actual tiene 3 usuarios (nextId: 4) por estado de uso en Fase 2. Si se usa como fuente de copia en beforeEach, los tests que asuman 2 usuarios fallarán.
   - What's unclear: Si el plan usa `copyFile(SEED_FILE, TEST_FILE)` o `writeFile(TEST_FILE, JSON.stringify(TEST_SEED))`.
   - Recommendation: Usar `writeFile` con una constante `TEST_SEED` definida en el test file (2 usuarios, nextId: 3). Más robusto que depender de que `users.json` tenga un estado conocido.

3. **`--test-force-exit` vs `after()` con `server.close()`**
   - What we know: supertest puede dejar conexiones abiertas. `--test-force-exit` es el enfoque más simple.
   - What's unclear: Si en Node 22 hay efectos secundarios de `--test-force-exit` en el output del runner.
   - Recommendation: Usar `--test-force-exit` como primera opción. Es la solución estándar para este caso. [VERIFIED: node --help Node 22.22.3]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `require.main === module` funciona como guardia en index.js para prevenir startServer() al hacer require desde tests | Pitfall 1, Pattern 1 | Si no funciona, necesitaría otro mecanismo de aislamiento — bajo riesgo, patrón estándar Node.js [ASSUMED como patrón estándar, verificación trivial] |

**Todos los demás claims en este documento están VERIFICADOS contra código fuente real, Node 22.22.3 built-ins, o npm registry.**

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` confirmado en config.json.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Lab educativo sin auth por diseño |
| V3 Session Management | no | API stateless |
| V4 Access Control | no | Todas las rutas son públicas por diseño educativo |
| V5 Input Validation | **sí** | Fix de `parseUserId()` + `validateUserPayload()` existente |
| V6 Cryptography | no | No se maneja criptografía |

### Known Threat Patterns — Express API

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDs malformados (`1abc`) | Tampering | Fix `parseUserId()` con `Number()` + `isInteger` + `> 0` |
| Payloads sin campos requeridos | Tampering | `validateUserPayload()` existente — sin cambios |
| Prototype pollution vía JSON body | Tampering | `express.json()` middleware — aceptable para lab educativo |

**Nota de seguridad:** El fix de `parseUserId` es la única corrección de seguridad/validación de esta fase. Las demás consideraciones (open CORS, sin auth) son deuda conocida y aceptada para el contexto educativo.

---

## Sources

### Primary (HIGH confidence)
- `node:test` — verificado con `node -e` en Node 22.22.3. Todas las APIs (`describe`, `it`, `before`, `after`, `beforeEach`, `afterEach`) disponibles.
- `node:assert/strict` — verificado con `node -e` en Node 22.22.3.
- `api/index.js` líneas 32-35, 246-258 — leído directamente del archivo.
- `api/package.json` — leído directamente del archivo. name="test-project", sin script dev, sin supertest.
- `api/data/users.json` — leído directamente. Estado actual: 3 usuarios, nextId: 4.
- npm registry supertest 7.2.2 — verificado con `npm view supertest version` (2026-01-06).
- npm registry nodemon 3.1.14 — verificado con `npm view nodemon version` (2026-03-06).
- Context7 `/forwardemail/supertest` — patrones async/await y `request(app)` directo.

### Secondary (MEDIUM confidence)
- `node --help` Node 22.22.3 — flags `--test`, `--test-force-exit` verificados.
- Comportamiento `Number()` vs `parseInt()` — verificado con `node -e` directamente.

### Tertiary (LOW confidence)
- Ninguna fuente tertiary usada en este documento.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versiones verificadas contra npm registry, built-ins verificados con Node 22.22.3
- Architecture: HIGH — basada en código fuente real leído directamente
- Pitfalls: HIGH — todos verificados con `node -e` o análisis del código fuente real
- Fix parseUserId: HIGH — comportamiento verificado con `node -e`

**Research date:** 2026-05-28
**Valid until:** 2026-08-28 (stack estable; Node 22 LTS, supertest 7.x maduro)
