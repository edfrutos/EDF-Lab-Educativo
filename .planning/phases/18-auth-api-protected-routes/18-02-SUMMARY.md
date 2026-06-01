---
phase: 18-auth-api-protected-routes
plan: 02
status: complete
completed: 2026-06-01
requirements:
  - AUTH-03
  - AUTH-04
  - AUTH-05
  - AUTH-06
  - AUTH-07
---

# Plan 18-02 Summary

## What Was Built

- `api/auth.js` — JWT en cookie `edf_session`, `requireAuth`, `loginHandler`, `logoutHandler`, `getAllowedOrigins`.
- `api/index.js` — CORS con `credentials: true`, `cookie-parser`, rutas `/auth/*`, `app.use('/users', requireAuth)`.
- `api/.env.example` — JWT, admin, CORS, flags documentados.

## Key Files

- `api/auth.js`, `api/index.js`, `api/.env.example`

## Verification (curl, PORT=3199)

- `GET /health` → 200 sin cookie ✓
- `GET /users` sin cookie → 401 ✓
- `POST /auth/login` credenciales incorrectas → 403 ✓
- `POST /auth/login` válido → 200 + cookie; `GET /users` → 200 con lista ✓
- `POST /auth/logout` → sesión invalidada ✓

## Notes for 18-03

- `npm test` requiere `AUTH_DISABLED=1` y tests de auth reales (plan 03).
- OpenAPI y README pendientes.
