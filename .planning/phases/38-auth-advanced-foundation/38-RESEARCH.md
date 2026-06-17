# Phase 38: Auth advanced foundation - Research

**Date:** 2026-06-17  
**Scope:** Diseñar un plan ejecutable para introducir cambio de contraseña del operador sin romper el contrato actual de auth.

## Findings

1. La API actual ya tiene separación clara entre `accounts` (operador) y `users` (CRUD), lo que favorece añadir cambio de contraseña sin tocar dominio de usuarios.
2. `api/index.js` delega autenticación en `api/auth.js` y mantiene `/auth/login` + `/auth/logout`; el nuevo endpoint puede seguir este patrón.
3. Los tests API ya incluyen bloque de autenticación reutilizable (`api/test-auth-helpers.js`) para validar sesión/cookie, ideal para extender casos de password change.
4. La documentación de auth (`docs/17-autenticacion.md`) y misiones 14/15 establecen el contrato didáctico vigente; cualquier cambio debe reflejarse ahí.

## Risks

- **Regresión de login actual:** cambios en auth pueden romper `/auth/login`.
  - Mitigación: mantener endpoint nuevo aditivo y correr suite auth existente.
- **Falsa sensación de seguridad:** permitir cambio sin validar contraseña actual.
  - Mitigación: exigir `currentPassword` válida + reglas de nueva contraseña.
- **Drift documental:** endpoint nuevo sin actualización en docs/misiones.
  - Mitigación: plan de wave 2 dedicado a docs y NOTEBOOK.

## Recommended execution split

- **Plan 38-01 (wave 1):** implementar endpoint de cambio de contraseña + validaciones + tests SQLite/Postgres.
- **Plan 38-02 (wave 2):** documentar contrato (`docs/17-autenticacion.md`), actualizar misión auth y registrar fricción real en NOTEBOOK si aparece.

## Verification baseline for phase 38

- `cd api && npm run test:sqlite`
- `cd api && npm run test:pg` (si Postgres disponible)
- Verificar que tests de autenticación previos siguen verdes.

---

*Research completed for planning phase 38.*
