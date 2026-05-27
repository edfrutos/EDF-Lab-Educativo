---
phase: 02-file-persistence
plan: "01"
subsystem: api
tags: [persistence, fs-promises, seed-data, async-startup]
dependency_graph:
  requires: []
  provides: [PERS-01, PERS-02]
  affects: [api/index.js, api/data/users.json]
tech_stack:
  added: []
  patterns: [async-startup, seed-data-recovery, path-join-dirname]
key_files:
  created:
    - api/data/users.json
  modified:
    - api/index.js
decisions:
  - "Ejecutado junto con el plan 02-02 en un único pass del executor (los planes 01 y 02 modifican el mismo archivo y el executor los combinó por dependencia bloqueante)"
metrics:
  duration: "~15 minutos (combinado con 02-02)"
  completed: "2026-05-27T19:50:38Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 02 Plan 01: Helpers de persistencia + semilla

Helpers async `loadUsers`, `saveUsers`, `saveUsersData` añadidos a `api/index.js`. Archivo semilla `api/data/users.json` creado.

## Objective

Sentar la base técnica de la fase: la API lee su estado desde disco al arrancar. Crea `api/data/users.json` con la semilla e introduce los helpers de persistencia asíncronos.

## Tasks Completed

### Tarea 1: Crear api/data/users.json con la semilla

**Archivo creado:** `api/data/users.json`

**Contenido:**
```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "nextId": 3
}
```

- Formato objeto wrapper con clave `users` y `nextId` (decisión D-08, D-09)
- Incluido en git (decisión D-10)
- JSON válido verificado

### Tarea 2: Refactorizar api/index.js con helpers de persistencia

**Archivo modificado:** `api/index.js`

**Cambios:**
- `const { readFile, writeFile, mkdir } = require('fs/promises')` + `const path = require('path')` al principio
- `DATA_DIR = path.join(__dirname, 'data')`, `DATA_FILE`, `SEED_DATA` constantes
- `let users = []` y `let nextUserId = 0` (inicialización vacía — los valores reales los asigna `loadUsers()`)
- `saveUsersData(data)` — escribe el objeto completo al disco
- `loadUsers()` — lee del disco; en caso de ENOENT o SyntaxError restaura desde semilla (D-01, D-02)
- `saveUsers()` — wrapper que serializa el estado actual
- `module.exports = app` ANTES de `async function startServer()` (Pitfall 4)
- `startServer()` async con `await loadUsers()` antes de `app.listen()`
- `users = [...SEED_DATA.users]` con spread operator (Pitfall 5 — evita referencia compartida)

## Verification Results

| Check | Result |
|-------|--------|
| `node --check api/index.js` | PASS |
| `api/data/users.json` contiene `"nextId": 3` | PASS |
| `api/data/users.json` contiene 2 usuarios semilla | PASS |
| `async function loadUsers(` en index.js | PASS |
| `async function saveUsers(` en index.js | PASS |
| `path.join(__dirname, 'data')` en index.js | PASS |
| `users = [...SEED_DATA.users]` con spread | PASS |
| `module.exports` antes de `startServer` (línea 246 < 248) | PASS |

## Deviations from Plan

**Ejecutado junto con 02-02:** El executor identificó que ambos planes modifican el mismo archivo (`api/index.js`) y los ejecutó en un solo pass por la dependencia bloqueante. El trabajo de ambos planes está en el commit `05ab8e1`.

## Self-Check: PASSED
