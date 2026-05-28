---
plan: 03-02
phase: 03-api-tests-and-quality-fixes
status: complete
---

# Plan 03-02: Suite de Tests — Summary

**Completed:** 2026-05-28

## What Was Built

Suite completa de tests HTTP para la API Express con `node:test` + `supertest`:

**`api/index.test.js`** — 6 describe, 12 tests (todos en verde):
- `GET /health` — verifica 200 + `status: 'healthy'` + timestamp string
- `GET /users` — verifica array ordenado por nombre (Jane precede a John)
- `POST /users` — payload válido → 201; name vacío → 400; email vacío → 400
- `PUT /users/:id` — actualización exitosa → 200; id inexistente → 404
- `DELETE /users/:id` — eliminación exitosa → 200 con mensaje y datos; id inexistente → 404
- `Validación de IDs` — `1abc` → 400, `0` → 400, `abc` → 400 (TEST-04)

**`api/data/users.test.json`** — fixture controlado con 2 usuarios, nextId=3.

**Hallazgo de ejecución:** `users[]` es un array en memoria; `loadUsers()` solo se llama en `startServer()` (ahora gateado por `require.main`). Fix aplicado: exportar `loadUsers` desde `index.js` y llamarla en `beforeEach` tras escribir el fixture.

## Decisiones de Usuario Honradas

- **D-01**: `node:test` + `supertest` (único runner externo)
- **D-02**: Fichero único `api/index.test.js` junto al código
- **D-03**: Estructura Arrange-Act-Assert con comentarios inline
- **D-04**: `DATA_FILE` env var + `beforeEach`/`afterEach` para aislamiento
- **D-05**: Solo assertions HTTP — no se lee el archivo en disco desde los tests
- **D-07**: 3 casos de ID inválido cubiertos: `1abc`, `0`, `abc`

## Key Files

- `api/index.test.js` — suite completa (creado)
- `api/data/users.test.json` — fixture seed (creado)
- `api/index.js` — añadido `module.exports.loadUsers = loadUsers` (1 línea)

## Commits

- `feat(03-02)`: instalar supertest y crear fixture users.test.json
- `feat(03-02)`: escribir suite completa node:test + supertest (12/12 tests)

## Self-Check: PASSED

- `pass 12 / fail 0` verificado con `DATA_FILE=data/users.test.json node --test index.test.js --test-force-exit`
- `api/data/users.json` sin modificar (3 usuarios, nextId=4)
- fixture `users.test.json` borrado por `afterEach` — no queda entre ejecuciones
- `process.env.DATA_FILE = TEST_FILE` aparece antes del `require('./index.js')`
