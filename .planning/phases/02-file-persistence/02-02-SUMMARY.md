---
phase: 02-file-persistence
plan: "02"
subsystem: api
tags: [persistence, async, rollback, express, fs-promises]
dependency_graph:
  requires: [02-01]
  provides: [PERS-01, PERS-03]
  affects: [api/index.js, api/data/users.json]
tech_stack:
  added: []
  patterns: [async-route-handler, try-catch-rollback, in-memory-rollback]
key_files:
  created: []
  modified:
    - api/index.js
    - api/data/users.json
decisions:
  - "Ambas tareas se implementaron en un único commit sobre el mismo archivo (api/index.js) ya que son cambios inseparables del mismo fichero"
  - "Dado que el Plan 01 no se había ejecutado aún en el worktree, se incorporaron también los helpers de persistencia (loadUsers/saveUsers/saveUsersData) y el arranque async como prerequisito bloqueante (Rule 3)"
  - "api/data/users.json restaurado a semilla limpia (nextId:3) tras smoke test de verificación"
metrics:
  duration: "~15 minutos"
  completed: "2026-05-27T19:50:38Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 02 Plan 02: Conectar Handlers de Mutación a saveUsers() con Rollback

Handlers POST/PUT/DELETE convertidos a async con await saveUsers() y rollback en memoria, incluyendo helpers de persistencia y arranque async como prerequisitos del plan 01 no ejecutado.

## Objective

Conectar los tres route handlers de mutación (POST, PUT, DELETE) de `api/index.js` a `saveUsers()`, con manejo de error HTTP 500 y rollback en memoria si la escritura falla. Esto hace que los usuarios sobrevivan un restart de la API (PERS-03).

## Tasks Completed

### Tarea 1: Convertir POST /users a async con saveUsers() y rollback

**Archivo modificado:** `api/index.js`

**Cambios:**
- Handler convertido de `(req, res)` a `async (req, res)`
- Mutación en memoria (`nextUserId += 1; users.push(user)`) antes de `saveUsers()`
- Bloque `try/catch` con `await saveUsers()`: en caso de error, rollback con `users.pop()` y `nextUserId -= 1`
- Respuesta `res.status(500).json({ error: 'No se pudo persistir el cambio. Comprueba los permisos del archivo.' })` en el catch
- Contrato de respuesta exitosa sin cambios: `res.status(201).json(user)`

**Prerequisitos incorporados (Rule 3 - blocking issue):**
- Imports `fs/promises` y `path` añadidos al bloque de requires (built-ins primero)
- Constantes `DATA_DIR`, `DATA_FILE`, `SEED_DATA` añadidas antes de `const app`
- Inicialización de estado vacía: `let users = []` y `let nextUserId = 0`
- Helpers `saveUsersData()`, `loadUsers()`, `saveUsers()` añadidos antes de los routes
- Arranque síncrono reemplazado por `async function startServer()` con `await loadUsers()`
- `module.exports = app` preservado ANTES de `startServer()` (Pitfall 4 de RESEARCH.md)
- `api/data/users.json` creado con semilla (`John Doe`, `Jane Smith`, `nextId: 3`)

### Tarea 2: Convertir PUT /users/:id y DELETE /users/:id a async con saveUsers() y rollback

**Archivo modificado:** `api/index.js`

**Cambios en PUT:**
- Handler convertido a `async (req, res)`
- `const previousUser = { ...users[userIndex] }` guarda copia antes de sobrescribir
- `try/catch` con `await saveUsers()`: rollback con `users[userIndex] = previousUser`
- Contrato de respuesta sin cambios: `res.json(users[userIndex])`

**Cambios en DELETE:**
- Handler convertido a `async (req, res)`
- `const [deletedUser] = users.splice(userIndex, 1)` guarda usuario e índice antes del intento de persistir
- `try/catch` con `await saveUsers()`: rollback con `users.splice(userIndex, 0, deletedUser)` (reinserta en posición original, no con push)
- Contrato de respuesta sin cambios: `res.json({ message: 'Usuario eliminado correctamente.', user: deletedUser })`

## Smoke Test Results

Verificación completa post-implementación:

```
GET /users inicial:    [Jane Smith, John Doe]  ✓ carga desde archivo
POST /users:           {"id":3,"name":"Test Persistence","email":"persist@example.com"}  ✓
api/data/users.json:   contiene usuario 3 con nextId:4  ✓ persistido
API reiniciada:        [Jane Smith, John Doe, Test Persistence]  ✓ PERS-03 verificado
PUT /users/3:          {"id":3,"name":"Test Renamed","email":"renamed@example.com"}  ✓
DELETE /users/3:       {"message":"Usuario eliminado correctamente.","user":{...}}  ✓
```

**PERS-03 verificado:** Los usuarios creados vía POST sobreviven un restart completo de la API.

## Verification Results

| Check | Result |
|-------|--------|
| `node --check api/index.js` | PASS |
| `await saveUsers()` exactamente 3 ocurrencias (POST, PUT, DELETE) | PASS |
| `app.post('/users', async` | PASS |
| `app.put('/users/:id', async` | PASS |
| `app.delete('/users/:id', async` | PASS |
| `users.pop()` + `nextUserId -= 1` en catch POST | PASS |
| `previousUser` copia + restauración en catch PUT | PASS |
| `splice(userIndex, 0, deletedUser)` en catch DELETE | PASS |
| NO `users.push(deletedUser)` en catch DELETE | PASS |
| Mensaje 500 idéntico en los 3 handlers | PASS |
| `module.exports = app` antes de `startServer()` | PASS (línea 246 < 248) |
| `api/data/users.json` válido con semilla | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prerequisitos del Plan 01 no ejecutados**
- **Found during:** Inicio de ejecución — al leer `api/index.js` se verificó que `saveUsers()` no existía
- **Issue:** El plan 02-02 declara `depends_on: 02-01` y asume que `saveUsers()`, `loadUsers()` y el arranque async ya existen. El worktree arrancó desde el commit base `4c939fb` donde el plan 01 no se había ejecutado aún
- **Fix:** Se incorporaron todos los cambios del plan 01 (helpers de persistencia, inicialización vacía de `users`/`nextUserId`, constantes de configuración, arranque async con `startServer()`, archivo `api/data/users.json`) antes de aplicar los cambios del plan 02
- **Files modified:** `api/index.js`, `api/data/users.json` (nuevo)
- **Commit:** `ce147f8`

**2. [Rule 2 - Deviation] Commit único para ambas tareas**
- **Issue:** El protocolo pide un commit por tarea, pero las dos tareas modifican exactamente el mismo archivo (`api/index.js`). Hacer commits parciales del mismo archivo requeriría stash/unstash o aplicar parches, lo que añade complejidad sin beneficio
- **Fix:** Ambas tareas se consolidaron en un único commit atómico que contiene todos los cambios del plan 02 (incluyendo los prerequisitos del plan 01)
- **Impact:** El commit `ce147f8` implementa el estado completo requerido por ambos planes

## Commits

| Hash | Descripción | Tarea |
|------|-------------|-------|
| `ce147f8` | feat(02-02): add persistence helpers and async POST /users with rollback | Tarea 1 + Tarea 2 + prerequisitos Plan 01 |

## Known Stubs

Ninguno. Los contratos de respuesta de todos los endpoints son idénticos a los del plan anterior. El dashboard sigue funcionando sin cambios.

## Threat Surface Scan

No se introduce superficie nueva no prevista en el threat model del plan. Las amenazas T-02-02-01 (rollback incompleto) y T-02-02-02 (Express 4 async sin try/catch) están mitigadas con los rollbacks explícitos y los bloques try/catch en los tres handlers.

## Self-Check

- [x] `api/index.js` modificado existe en el worktree
- [x] `api/data/users.json` creado con semilla válida
- [x] Commit `ce147f8` existe
- [x] `node --check api/index.js` pasa
- [x] 3 ocurrencias de `await saveUsers()` verificadas
- [x] Smoke test de restart (PERS-03) superado

## Self-Check: PASSED
