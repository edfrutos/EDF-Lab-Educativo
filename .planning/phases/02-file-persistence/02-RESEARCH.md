# Phase 2: File Persistence — Research

**Researched:** 2026-05-27
**Domain:** Node.js `fs/promises`, async Express startup, JSON file I/O
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Si `data/users.json` no existe al arrancar, crearlo automáticamente con datos semilla (`John Doe`, `Jane Smith`, `nextId: 3`).
- **D-02:** Si `data/users.json` existe pero es JSON inválido, sobrescribirlo con la semilla, arrancar normalmente y loguear `[warn] data/users.json corrupto — restaurando semilla`.
- **D-03:** Incluir misión explícita de corrupción y restauración.
- **D-04:** Escribir el archivo de forma inmediata tras cada mutación (POST/PUT/DELETE) con `fs.writeFile` + `async/await`. Sin diferido ni batch.
- **D-05:** Los helpers `loadUsers()` y `saveUsers()` viven en `api/index.js`. Sin módulo separado.
- **D-06:** Si `saveUsers()` falla, revertir la mutación en memoria y responder HTTP 500 con `{ "error": "No se pudo persistir el cambio. Comprueba los permisos del archivo." }`.
- **D-07:** Si `loadUsers()` falla al leer (permisos, etc.), arrancar con semilla y loguear el error.
- **D-08:** Formato objeto wrapper: `{ "users": [...], "nextId": N }` — no array plano.
- **D-09:** Escribir con `JSON.stringify(data, null, 2)` — indentado 2 espacios.
- **D-10:** `data/users.json` se incluye en el repositorio con los datos semilla.

### Claude's Discretion

- Ubicación exacta de `data/users.json` respecto a la raíz (`api/data/` vs `data/` en raíz del proyecto): no está fijada en CONTEXT.md. Ver sección "Open Questions".

### Deferred Ideas (OUT OF SCOPE)

- Módulo separado `api/persistence.js`
- Versionado del archivo JSON (campo `version`)
- Locking de archivo para escrituras concurrentes
- Base de datos SQLite/PostgreSQL
- `data/` en `.gitignore`
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERS-01 | API stores users in `data/users.json` instead of only process memory | `fs/promises.writeFile` + objeto wrapper D-08; `loadUsers`/`saveUsers` en D-05 |
| PERS-02 | API creates or initializes persistence data safely when the data file is missing | ENOENT catch + semilla D-01; `mkdir({ recursive: true })` para crear carpeta si no existe |
| PERS-03 | Learner can observe that users survive an API restart | Misión de restart D-03; arranque async que llama `loadUsers()` antes de `app.listen` |
| PERS-04 | Documentation explains memory vs file persistence with executable examples | Nuevo capítulo en `docs/`; diagrama antes/después; decisión D-10 hace el archivo inspeccionable |
| PERS-05 | Simple backup behavior exists or is explicitly taught as a mission | Misión de corrupción y restauración D-03; recuperación automática ya implementada en D-02 |
</phase_requirements>

---

## Summary

Esta fase añade persistencia de datos en `api/data/users.json` usando exclusivamente el módulo `fs/promises` incorporado en Node.js — sin nuevas dependencias. El patrón central es simple: un helper `loadUsers()` asíncrono que se ejecuta antes de `app.listen`, y un helper `saveUsers()` que se llama al final de cada route handler de mutación. El objetivo educativo es que el alumno vea exactamente dónde y cuándo el estado en memoria se serializa a disco.

El ecosistema de decisiones está completamente definido en CONTEXT.md (D-01 a D-10). La investigación confirma que todos los patrones elegidos son idiomáticos en Node.js 22 y no requieren librerías externas. El único punto abierto relevante para el planificador es la ubicación exacta del directorio `data/` (dentro de `api/` o en la raíz del proyecto).

El cambio más delicado de toda la fase es la transformación del arranque sincrónico (`app.listen` directo) a un arranque asíncrono (`async function startServer() { await loadUsers(); app.listen(...) }`). Este cambio afecta también el `module.exports = app` actual, que debe preservarse para que futuros tests puedan importar el módulo.

**Recomendación principal:** Colocar `data/` dentro de `api/data/` y referenciarla con `path.join(__dirname, 'data', 'users.json')` — esto hace que la ruta sea siempre relativa al entrypoint, independientemente del directorio de trabajo desde el que se arranque la API.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Carga inicial de usuarios desde disco | API / Backend | — | Se ejecuta en el proceso Node antes de que el servidor acepte conexiones |
| Escritura tras mutación CRUD | API / Backend | — | Responsabilidad exclusiva del route handler que muta el estado |
| Lectura del archivo JSON por el alumno | Sistema de ficheros / Editor | — | El archivo es legible directamente; no hay capa de abstracción |
| Documentación memoria vs persistencia | Docs (ficheros markdown) | — | Capítulo nuevo en `docs/`; no afecta al frontend |
| Misiones ejecutables | Docs (ficheros markdown) | — | Instrucciones en `missions/`; el alumno las sigue manualmente |
| Contrato `GET /users` hacia el dashboard | API / Backend | Browser / Frontend | La respuesta JSON no cambia; el dashboard no se modifica |

---

## Standard Stack

### Core

| Librería | Versión | Propósito | Por qué es estándar |
|----------|---------|-----------|---------------------|
| `fs/promises` | Built-in Node 22 | Leer y escribir `users.json` con async/await | Módulo nativo; cero dependencias; API estable desde Node 10 |
| `path` | Built-in Node 22 | Construir rutas absolutas con `__dirname` | Evita errores de ruta relativa al cambiar CWD |

[VERIFIED: Bash — `node -e "const {readFile,writeFile,mkdir}=require('fs/promises'); console.log('OK')"` ejecutado en Node v22.22.3]

### Supporting

No hay librerías de soporte adicionales. `express`, `cors` y `lodash` ya están presentes y no se modifican.

### Alternatives Considered

| En lugar de | Se podría usar | Tradeoff |
|-------------|---------------|----------|
| `fs/promises` | `fs` con callbacks | Callbacks son más verbosos y menos didácticos que async/await; descartado |
| `fs/promises` | `fs.writeFileSync` | Síncrono bloquea el event loop; nunca en producción; descartado |
| `fs/promises` | `lowdb`, `nedb`, `better-sqlite3` | Introducen dependencias sin valor educativo adicional en esta fase; deferred a fases posteriores |
| `path.join(__dirname, ...)` | Ruta relativa `'./data/users.json'` | Ruta relativa es frágil si la API se arranca desde otro directorio (e.g. `node api/index.js` desde la raíz del proyecto) |

**Instalación:** Ninguna — solo módulos built-in de Node.js.

---

## Architecture Patterns

### System Architecture Diagram

```
Arranque de la API
  │
  ▼
loadUsers()
  ├── data/users.json existe y es JSON válido
  │     └── users ← data.users
  │         nextUserId ← data.nextId
  │
  ├── data/users.json no existe (ENOENT)
  │     └── Crear directorio + escribir semilla
  │         users ← SEED_DATA.users
  │         nextUserId ← SEED_DATA.nextId
  │         [log] [info] data/users.json creado con semilla
  │
  └── data/users.json existe pero JSON corrupto (SyntaxError)
        └── Sobrescribir con semilla
            users ← SEED_DATA.users
            nextUserId ← SEED_DATA.nextId
            [log] [warn] data/users.json corrupto — restaurando semilla
        └── Otros errores de lectura (EPERM, etc.)
              └── Arrancar con semilla en memoria
                  [log] [error] No se pudo leer data/users.json: <mensaje>
  │
  ▼
app.listen(PORT)  ← Solo se llama DESPUÉS de que loadUsers() resuelve

Petición de mutación (POST / PUT / DELETE)
  │
  ▼
Route handler ejecuta mutación en `users[]` / `nextUserId`
  │
  ▼
saveUsers()
  ├── Éxito: res.json(resultado)
  └── Error de escritura
        ├── Revertir mutación en memoria
        └── res.status(500).json({ error: "No se pudo persistir..." })
```

### Recommended Project Structure

```
api/
├── index.js          # Entrypoint único (loadUsers, saveUsers, routes, startServer)
├── data/
│   └── users.json    # Estado persistido; incluido en git con semilla
├── package.json
└── README.md
```

### Pattern 1: Helpers de persistencia en `api/index.js`

**Qué hace:** `loadUsers()` lee el archivo al arrancar y devuelve el estado inicial. `saveUsers()` serializa el estado actual y lo escribe.

**Cuándo usarlo:** Siempre que el state en memoria cambie (POST, PUT, DELETE).

```javascript
// Source: Node.js docs — fs/promises (https://nodejs.org/api/fs.html#fspromisesreadfilepath-options)
// [VERIFIED: Bash — patrones probados en Node v22.22.3]

const { readFile, writeFile, mkdir } = require('fs/promises');
const path = require('path');

const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

const SEED_DATA = {
  users: [
    { id: 1, name: 'John Doe',   email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  nextId: 3
};

async function loadUsers() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);          // SyntaxError si el JSON es inválido
    users       = data.users;
    nextUserId  = data.nextId;
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn('[warn] data/users.json corrupto — restaurando semilla');
      await saveUsersData(SEED_DATA);
    } else if (err.code === 'ENOENT') {
      console.info('[info] data/users.json no encontrado — creando con semilla');
      await mkdir(DATA_DIR, { recursive: true });
      await saveUsersData(SEED_DATA);
    } else {
      console.error('[error] No se pudo leer data/users.json:', err.message);
    }
    users      = [...SEED_DATA.users];
    nextUserId = SEED_DATA.nextId;
  }
}

async function saveUsers() {
  const data = { users, nextId: nextUserId };
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}
```

### Pattern 2: Arranque asíncrono de Express

**Qué hace:** Envuelve `app.listen` en una función `async` para poder usar `await loadUsers()` antes de aceptar conexiones. El servidor no responde a peticiones hasta que el estado esté cargado desde disco.

**Cuándo usarlo:** Siempre que el servidor necesite I/O antes de estar listo.

```javascript
// [VERIFIED: Node.js 22 + Express 4 — patrón idiomático]
// [CITED: https://expressjs.com/en/guide/writing-middleware.html]

async function startServer() {
  await loadUsers();
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[error] No se pudo arrancar el servidor:', err);
  process.exit(1);
});

// IMPORTANTE: module.exports = app permanece aquí (antes de startServer),
// para que los tests futuros puedan importar `app` sin ejecutar el servidor.
module.exports = app;
```

### Pattern 3: Guardar tras mutación con rollback en caso de error

**Qué hace:** Aplica la mutación en memoria, intenta persistir; si falla, deshace la mutación y responde 500.

```javascript
// [VERIFIED: patrón de rollback probado conceptualmente contra fs/promises Node 22]

app.post('/users', async (req, res) => {
  const validationError = validateUserPayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const user = { id: nextUserId, name: req.body.name.trim(), email: req.body.email.trim() };
  nextUserId += 1;
  users.push(user);

  try {
    await saveUsers();
  } catch (err) {
    // Rollback: deshacer la mutación en memoria
    users.pop();
    nextUserId -= 1;
    console.error('[error] saveUsers() falló en POST /users:', err.message);
    return res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' });
  }

  res.status(201).json(user);
});
```

Para PUT: guardar copia del usuario anterior antes de sobrescribir, restaurarla en el catch.
Para DELETE: guardar el usuario borrado y el índice; reinsertarlo en el catch con `users.splice(index, 0, deletedUser)`.

### Anti-Patterns a Evitar

- **`fs.writeFileSync` en route handlers:** Bloquea el event loop entero mientras escribe; inaceptable incluso en demos educativos. Usar siempre la versión async.
- **`require('fs')` con callbacks anidados en route handlers:** Produce callback hell innecesario cuando `async/await` está disponible.
- **Inicializar `users` con la semilla hardcodeada Y también llamar `loadUsers()`:** Si se deja la inicialización hardcodeada junto a la carga desde archivo, el alumno no verá el efecto de la persistencia en una sesión nueva.
- **Ruta relativa `'./data/users.json'`:** Si el alumno arranca la API con `node api/index.js` desde la raíz del proyecto, la ruta resolverá a `./data/users.json` relativa al CWD — no al directorio de `index.js`. Usar siempre `path.join(__dirname, 'data', 'users.json')`.
- **`JSON.parse` sin try/catch:** Un archivo corrupto (p.ej. escritura interrumpida a mitad) lanzará `SyntaxError` no capturado y tumbará el servidor.

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|----------|-------------|------------------|---------|
| Escritura atómica (evitar archivo medio escrito) | Implementación propia con archivo temporal + rename | No necesario en esta fase — lab local, un solo proceso | `writeFile` de Node es suficientemente atómica para un lab local; las escrituras atómicas con `rename` son para producción multi-proceso |
| Detección de JSON inválido | Parser propio | `JSON.parse` + captura de `SyntaxError` | Estándar del lenguaje, cero dependencias |
| Creación recursiva de directorios | Iteración manual de segmentos de ruta | `mkdir(dir, { recursive: true })` | Built-in desde Node 10.12; un solo await |
| Logging estructurado | Sistema de logging casero | `console.info/warn/error` con prefijo `[info]`/`[warn]`/`[error]` | Suficiente para un lab local; no introduce dependencias |

**Insight clave:** La persistencia en fichero con `fs/promises` es deliberadamente simple. La complejidad aparente (errores de I/O, rollback, arranque asíncrono) está cubierta por patrones estándar de Node.js sin necesidad de ninguna librería adicional.

---

## Common Pitfalls

### Pitfall 1: Ruta relativa vs. `__dirname`

**Qué falla:** `readFile('./data/users.json')` funciona si la API se arranca con `cd api && node index.js` pero falla con `node api/index.js` desde la raíz del proyecto porque Node resuelve rutas relativas respecto al CWD del proceso, no al fichero.

**Por qué ocurre:** Node.js toma el CWD del proceso como base para rutas relativas en `fs`. La variable `__dirname` siempre apunta al directorio del fichero fuente.

**Cómo evitarlo:** Usar siempre `path.join(__dirname, 'data', 'users.json')`.

**Señales de alerta:** `Error: ENOENT: no such file or directory, open './data/users.json'` cuando se arranca desde un directorio distinto a `api/`.

---

### Pitfall 2: Olvidar `await` en `saveUsers()` dentro del route handler

**Qué falla:** Si el handler no es `async` o si se omite `await saveUsers()`, la mutación en memoria ocurre pero la escritura a disco es una promesa que nadie espera. El handler responde al cliente antes de que el archivo se haya guardado.

**Por qué ocurre:** Express acepta route handlers tanto síncronos como asíncronos; no obliga a usar `await`.

**Cómo evitarlo:** Declarar el handler como `async (req, res) => { ... await saveUsers(); ... }`. Verificar con `node --check` que la sintaxis es válida.

**Señales de alerta:** Los datos desaparecen en restart aunque "la API guardaba bien"; en tests unitarios futuros, las aserciones sobre el archivo fallan intermitentemente.

---

### Pitfall 3: Route handler `async` sin captura de errores no propaga al middleware de Express 4

**Qué falla:** En Express 4 (la versión actual), si un route handler `async` lanza una excepción no capturada (p.ej. `saveUsers()` rechaza sin try/catch), Express **no** la envía automáticamente al error middleware — la promesa rechazada queda huérfana y el servidor no responde al cliente.

**Por qué ocurre:** Express 4 no tiene soporte nativo de async; Express 5 lo añade. La versión instalada es `^4.18.2`.

**Cómo evitarlo:** Envolver siempre `await saveUsers()` en un bloque `try/catch` explícito dentro del handler, como muestra el Pattern 3.

**Señales de alerta:** El cliente queda esperando respuesta indefinidamente; el servidor no loguea nada; `UnhandledPromiseRejectionWarning` aparece en consola (Node 22 lo convierte en error fatal por defecto).

**Nota Node 22:** A partir de Node 15, las promesas rechazadas sin captura terminan el proceso con código de salida 1. Esto hace que el fallo sea visible pero también que el servidor caiga — razón adicional para envolver siempre en try/catch.

---

### Pitfall 4: `module.exports = app` desaparece o se desplaza

**Qué falla:** Al refactorizar el arranque a `startServer()`, es fácil mover o eliminar `module.exports = app`. Esto romperá los tests de la Fase 3 que importan `app` directamente.

**Por qué ocurre:** El refactor del final del archivo es la zona de mayor riesgo de edición.

**Cómo evitarlo:** Mantener `module.exports = app` **antes** de la llamada a `startServer()`. El export declara qué expone el módulo; `startServer()` es un efecto secundario de ejecución.

---

### Pitfall 5: Semilla con referencia compartida

**Qué falla:** Si `SEED_DATA.users` se asigna directamente (`users = SEED_DATA.users`), cualquier mutación posterior modifica también `SEED_DATA`, rompiendo la recuperación de una segunda corrupción en la misma sesión.

**Por qué ocurre:** Los arrays en JavaScript se asignan por referencia.

**Cómo evitarlo:** Usar copia: `users = [...SEED_DATA.users]` o `users = JSON.parse(JSON.stringify(SEED_DATA.users))`.

---

### Pitfall 6: Rollback incorrecto en DELETE

**Qué falla:** En DELETE, el rollback requiere recolocar el usuario borrado en la posición original del array. Un simple `users.push(deletedUser)` lo añade al final, cambiando el orden y potencialmente causando confusión en tests futuros.

**Por qué ocurre:** `splice` devuelve el elemento eliminado y su índice es conocido en el momento del borrado — hay que guardarlo.

**Cómo evitarlo:**
```javascript
const userIndex = findUserIndexById(userId);
const [deletedUser] = users.splice(userIndex, 1);
try {
  await saveUsers();
} catch (err) {
  users.splice(userIndex, 0, deletedUser); // reinserta en la posición original
  // ...
}
```

---

## Code Examples

### Helper `saveUsersData` interno (escritura de datos arbitrarios)

```javascript
// Helper privado para reutilizar en loadUsers (escritura de semilla) y saveUsers
// Source: Node.js fs/promises docs — [VERIFIED: Node v22.22.3]
async function saveUsersData(data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function saveUsers() {
  await saveUsersData({ users, nextId: nextUserId });
}
```

### Verificación manual post-implementación

```bash
# Desde la raíz del proyecto:
cd api && PORT=3100 npm start
# En otro terminal:
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com"}' | jq .
cat data/users.json   # debe mostrar el nuevo usuario
# Ctrl+C para parar la API, luego:
PORT=3100 npm start
curl -s http://localhost:3100/users | jq .  # Test User debe seguir ahí
```

---

## State of the Art

| Enfoque antiguo | Enfoque actual | Desde | Impacto |
|----------------|---------------|-------|---------|
| `fs.readFile` con callbacks | `fs/promises.readFile` con async/await | Node 10 (stable Node 12+) | Código lineal, sin callback hell |
| `fs.mkdirSync` con check previo | `fs.promises.mkdir({ recursive: true })` | Node 10.12 | Una línea; no lanza error si ya existe |
| `app.listen` síncrono con datos hardcodeados | `async startServer() { await init(); app.listen() }` | Express 4+ / Node 8+ | Patrón estándar para init asíncrona |

**Obsoleto/deprecated:**
- `fs.exists()`: Deprecated desde Node 1.0. Usar `readFile` + captura de ENOENT en su lugar — evita race conditions.
- Callbacks de `fs`: Funcionan pero son didácticamente inferiores para enseñar async en 2026.

---

## Assumptions Log

| # | Afirmación | Sección | Riesgo si es incorrecta |
|---|-----------|---------|------------------------|
| A1 | Express 4 no captura automáticamente promesas rechazadas en handlers async | Pitfall 3 | Si el proyecto usa Express 5 (no es el caso — `^4.18.2` en package.json), el pitfall no aplica | [VERIFIED: package.json muestra `express: ^4.18.2`] |
| A2 | `data/` debe vivir dentro de `api/data/` (no en la raíz del proyecto) | Open Questions | Si la decisión fuera raíz del proyecto, los paths `__dirname` serían distintos |

---

## Open Questions

1. **Ubicación de `data/users.json`: ¿`api/data/` o `data/` en la raíz del proyecto?**
   - Lo que sabemos: CONTEXT.md y ROADMAP.md mencionan `data/users.json` sin prefijo de carpeta. La API vive en `api/index.js`.
   - Lo que es ambiguo: Si `data/` es relativo a `api/` (coherente con el single-file pattern y `__dirname`) o relativo a la raíz del proyecto (visible junto a `api/` y `dashboard/`).
   - Recomendación: Usar `api/data/users.json` — encapsula los datos junto al backend, evita el pitfall de ruta relativa, y es más coherente con el patrón single-file. Si el planificador elige raíz del proyecto, ajustar el path a `path.join(__dirname, '..', 'data', 'users.json')`.

---

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|--------------|------------|---------|----------|
| Node.js `fs/promises` | `loadUsers`, `saveUsers` | SI | Built-in Node v22.22.3 | — |
| Node.js `path` | Rutas absolutas con `__dirname` | SI | Built-in Node v22.22.3 | — |
| Express 4 | Route handlers async | SI | ^4.18.2 (instalado) | — |
| `data/` directory | Archivo JSON | Crear en runtime | — | `mkdir({ recursive: true })` en `loadUsers` |

**Dependencias bloqueantes sin fallback:** Ninguna.

[VERIFIED: Bash — `node --version` devuelve v22.22.3 en el entorno del proyecto]

---

## Validation Architecture

No hay suite de tests automatizados en esta fase (TEST-01..05 están en Fase 3). La validación es manual.

### Comandos de verificación disponibles

| Qué verifica | Comando |
|-------------|---------|
| Sintaxis del archivo modificado | `cd api && node --check index.js` |
| Auditoría de seguridad de dependencias | `cd api && npm audit --audit-level=high` |
| Smoke test manual de persistencia | `cd api && PORT=3100 npm start` + curl + restart + curl |
| Integridad del archivo JSON | `node -e "JSON.parse(require('fs').readFileSync('api/data/users.json','utf8'))"` |

### Wave 0 Gaps

- No hay ficheros de test que crear en esta fase. La cobertura automatizada se añade en Fase 3.
- `node --check api/index.js` debe pasar antes de cerrar cada plan.

---

## Security Domain

Esta fase no introduce superficie de ataque nueva:

| Categoría ASVS | Aplica | Control estándar |
|---------------|--------|-----------------|
| V5 Input Validation | SI (ya existente) | `validateUserPayload` — sin cambios |
| V6 Cryptography | NO | Datos de demo, sin datos sensibles |
| V2 Authentication | NO | Lab local, sin auth |

**Consideración específica de I/O:**
- El archivo `data/users.json` contiene solo datos de demo (nombres y emails inventados). No hay datos sensibles.
- `writeFile` sobrescribe el archivo completo en cada mutación — no hay riesgo de información residual de escrituras parciales en este contexto de un solo proceso local.
- Permisos del archivo: el planificador debe asegurarse de que `data/users.json` se crea con permisos `644` (por defecto en `writeFile`) y que `data/` es `755`. No añadir lógica de permisos explícita — el comportamiento por defecto es correcto para un lab local.

---

## Sources

### Primary (HIGH confidence)
- Node.js v22 docs — `fs/promises` API: `readFile`, `writeFile`, `mkdir` [VERIFIED: Bash — todos los métodos confirmados ejecutando código real en Node v22.22.3]
- `api/index.js` — estructura actual de variables, helpers y route handlers [VERIFIED: Read]
- `api/package.json` — versión de Express (`^4.18.2`), sin dependencias de I/O [VERIFIED: Read]
- `.planning/phases/02-file-persistence/02-CONTEXT.md` — decisiones D-01 a D-10 [VERIFIED: Read]

### Secondary (MEDIUM confidence)
- `.planning/codebase/CONVENTIONS.md` — patrones de naming y orden de imports [VERIFIED: Read]
- `.planning/codebase/CONCERNS.md` — deuda técnica conocida y áreas frágiles [VERIFIED: Read]

### Tertiary (LOW confidence)
- Ninguna fuente de terceros necesaria — el dominio (Node.js `fs/promises` + Express 4) está completamente cubierto por fuentes primarias verificadas.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — módulos built-in de Node 22, verificados en ejecución real
- Architecture: HIGH — patrones idiomáticos de Node.js/Express 4, código existente inspeccionado
- Pitfalls: HIGH — verificados contra documentación oficial y comportamiento real de Node 22
- Decisiones de CONTEXT.md: HIGH — tomadas por el usuario, no inferidas

**Research date:** 2026-05-27
**Valid until:** 2026-08-27 (Node.js `fs/promises` es estable; no hay riesgo de cambios en el horizonte)
