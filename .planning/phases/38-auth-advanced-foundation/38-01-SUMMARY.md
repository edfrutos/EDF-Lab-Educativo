# Phase 38-01 Summary

## Objective
Implementar base técnica de `AUTH-ADV-03` con endpoint autenticado para cambio de contraseña del operador y cobertura de tests API.

## Changes made

- `api/auth.js`
  - Nuevo `changePasswordHandler` con:
    - validación de sesión
    - validación de payload `currentPassword` / `newPassword`
    - validación de longitud mínima (8)
    - verificación bcrypt de contraseña actual
    - actualización de hash en `accounts`
- `api/index.js`
  - Nueva ruta `PATCH /auth/password` protegida con `requireAuth`
  - Endpoint listado en `GET /`
- `api/db-sqlite.js`
  - Añadidos `findAccountById()` y `updateAccountPassword()`
- `api/db-pg.js`
  - Añadidos `findAccountById()` y `updateAccountPassword()`
- `api/test-auth-helpers.js`
  - Nuevos tests auth para password change:
    - 401 sin sesión
    - 400 payload inválido
    - 400 nueva contraseña corta
    - 403 contraseña actual incorrecta
    - 200 cambio exitoso + login antiguo KO + login nuevo OK

## Verification

- `node --check api/index.js` ✅
- `node --check api/auth.js` ✅
- `cd api && npm run test:sqlite` ✅ (29 tests)
- `cd api && npm run test:pg` ⚠️ bloqueado por `ECONNREFUSED 127.0.0.1:5432` (Postgres local no disponible)

## Result

Wave 1 completada. `AUTH-ADV-03` implementado en backend con cobertura en SQLite y sin regresión observable en flujo auth existente.
