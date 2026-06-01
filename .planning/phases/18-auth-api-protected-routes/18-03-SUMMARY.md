---
phase: 18-auth-api-protected-routes
plan: 03
status: complete
completed: 2026-06-01
requirements:
  - AUTH-08
  - AUTH-09
---

# Plan 18-03 Summary

## What Was Built

- `AUTH_DISABLED=1` en tests CRUD (`package.json` + cabeceras de test).
- `test-auth-helpers.js` — 7 tests de autenticación compartidos (SQLite + Postgres).
- `openapi.yaml` — `/auth/login`, `/auth/logout`, `cookieAuth`, 401 en `/users`.
- `api/README.md` — sección Autenticación (fase 18) con curl y `.env.example`.

## Verification

- `npm run test:sqlite` — **23/23** (16 CRUD + 7 auth) ✓
- `npm test` — requiere Postgres en `edf_lab_test` para la segunda suite (como antes)

## Fix during execution

- Test logout usa `request.agent()` para respetar `Set-Cookie` de cierre de sesión.
- `clearCookie` sin `maxAge` (aviso deprecación Express).
