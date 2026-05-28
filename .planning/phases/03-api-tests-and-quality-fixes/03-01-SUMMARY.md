---
plan: 03-01
phase: 03-api-tests-and-quality-fixes
status: complete
---

# Plan 03-01: Preparar api/index.js — Summary

**Completed:** 2026-05-28

## What Was Built

`api/index.js` ahora puede importarse desde tests sin efectos secundarios:

1. **DATA_FILE configurable** — la constante `DATA_FILE_PATH` se inicializa desde `process.env.DATA_FILE` (con `path.resolve()` para rutas absolutas) o cae al default `data/users.json`. Los tests pueden establecer esta env var antes del `require('./index')` para redirigir todas las operaciones de lectura/escritura a un archivo de fixtures.

2. **Guardia `require.main === module`** — el bloque que llama a `startServer()` ahora solo ejecuta cuando el módulo se invoca directamente con `node index.js`. Al importar desde tests vía `require('./index')`, el servidor NO arranca y `users.json` real no se toca.

3. **Fix de `parseUserId`** — reemplazado `Number.parseInt(value, 10)` por `Number(value)` con comprobación `Number.isInteger(id) && id > 0`. `Number('1abc')` devuelve `NaN` (rechazado), mientras que `Number.parseInt('1abc', 10)` devolvía `1` (bug). Se añadió comentario inline explicando la diferencia para valor didáctico.

## Key Files

- `api/index.js` — 2 cambios funcionales + 1 fix

## Commits

- `feat(03-01)`: hacer DATA_FILE configurable vía process.env.DATA_FILE
- `fix(03-01)`: corregir parseUserId y añadir guardia require.main

## Self-Check: PASSED

- `node --check api/index.js` → sin errores de sintaxis
- `DATA_FILE_PATH` usa `process.env.DATA_FILE` con fallback a `data/users.json`
- `require.main === module` guard presente en línea 258
- `parseUserId` usa `Number()` + `Number.isInteger()` + `id > 0`
- Comentario educativo inline explica diferencia `parseInt` vs `Number`
