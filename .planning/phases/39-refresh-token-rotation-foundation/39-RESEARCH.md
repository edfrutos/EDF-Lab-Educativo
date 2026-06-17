# Phase 39: Refresh token rotation foundation - Research

**Date:** 2026-06-17  
**Scope:** Diseñar un plan ejecutable para AUTH-ADV-02 sin romper el flujo actual de auth en cookie.

## Findings

1. La autenticación actual usa una sola cookie JWT (`edf_session`) con contrato estable y tests maduros.
2. El patrón de evolución aditiva ya se validó en fase 38 (`PATCH /auth/password`) y permite repetir estrategia: endpoint nuevo + tests + docs.
3. La suite auth en `api/test-auth-helpers.js` ya centraliza casos críticos y es el lugar natural para incorporar refresh/rotation.
4. La documentación `docs/17-autenticacion.md` ya agrupa contrato y ejemplos curl, por lo que la extensión de ciclo de sesión puede quedar didácticamente consistente.

## Risks

- **Regresión de sesión actual:** romper login/logout al introducir refresh.
  - Mitigación: mantener endpoints actuales intactos y añadir flujo refresh aditivo.
- **Rotación incompleta:** aceptar refresh reuse sin invalidación adecuada.
  - Mitigación: definir regla mínima explícita (refresh token de un solo uso).
- **Desalineación didáctica:** endpoint implementado sin guía práctica clara.
  - Mitigación: reservar wave 2 para docs/misiones/NOTEBOOK.

## Recommended execution split

- **Plan 39-01 (wave 1):** endpoint refresh + rotación mínima + tests SQLite/Postgres.
- **Plan 39-02 (wave 2):** actualización de docs/misiones y registro de fricción real.

## Verification baseline for phase 39

- `node --check api/index.js`
- `node --check api/auth.js`
- `cd api && npm run test:sqlite`
- `cd api && npm run test:pg` (si Postgres está disponible)

---

*Research completed for planning phase 39.*
