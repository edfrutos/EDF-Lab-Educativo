# Phase 39-01 Summary

## Objective
Implementar la base técnica de `AUTH-ADV-02` con refresh token rotation mínima en backend, preservando login/logout existentes.

## Changes made

- `api/schema.sql` y `api/schema.pg.sql`
  - Nueva tabla `account_refresh_tokens` (1 refresh activo por cuenta).
- `api/db-sqlite.js` y `api/db-pg.js`
  - Nuevos métodos:
    - `upsertRefreshToken(accountId, tokenHash)`
    - `getRefreshTokenHashByAccountId(accountId)`
    - `deleteRefreshTokenByAccountId(accountId)`
- `api/auth.js`
  - Cookie nueva `edf_refresh`
  - `signRefreshToken()` con `jti` aleatorio para rotación real
  - `refreshHandler` para `POST /auth/refresh` con invalidación de token previo
  - login emite `edf_session` + `edf_refresh`
  - logout limpia e invalida refresh
  - cambio de contraseña invalida refresh activo
- `api/index.js`
  - Nueva ruta `POST /auth/refresh`
  - Endpoint listado en `GET /`
- `api/test-auth-helpers.js`
  - Nuevos tests refresh:
    - 401 sin cookie
    - 200 con rotación
    - 401 por reuse
    - logout invalida refresh
- `api/index.test.js` y `api/index.pg.test.js`
  - `LOGIN_RATE_LIMIT_MAX=1000` para evitar ruido de rate limiting en suite auth extensa

## Verification

- `node --check api/index.js` ✅
- `node --check api/auth.js` ✅
- `cd api && npm run test:sqlite` ✅ (33 tests)
- `cd api && npm run test:pg` ⚠️ bloqueado por `ECONNREFUSED 127.0.0.1:5432` (Postgres local no disponible)

## Result

Wave 1 completada. Rotación mínima de refresh implementada y cubierta en SQLite sin romper el flujo base de autenticación.
