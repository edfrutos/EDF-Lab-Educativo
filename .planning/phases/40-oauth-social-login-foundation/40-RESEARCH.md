# Phase 40: OAuth social login foundation - Research

**Date:** 2026-06-17  
**Scope:** Diseñar un plan ejecutable para AUTH-ADV-01 preservando el contrato auth actual (login + refresh + logout + password change).

## Findings

1. El sistema auth actual está consolidado en cookies (`edf_session`, `edf_refresh`) con pruebas amplias en `api/test-auth-helpers.js`.
2. La evolución aditiva de fases 38 y 39 demuestra que el patrón endpoint nuevo + tests + docs funciona sin regresiones.
3. No existe hoy una superficie OAuth (`/auth/oauth/*`) ni persistencia/estado de callback en backend.
4. La documentación auth y misiones ya son el punto único de referencia didáctica, ideal para extender flujo social sin fragmentar aprendizaje.

## Risks

- **Regresión del login clásico:** cambios OAuth podrían alterar `/auth/login`.
  - Mitigación: mantener rutas actuales intactas y añadir OAuth en endpoints separados.
- **Flujo OAuth no testeable localmente:** dependencia excesiva de proveedor externo.
  - Mitigación: diseñar adapter/mock local verificable para state/callback/session issuance.
- **Confusión didáctica:** mezclar login clásico y social sin delimitar cuándo usar cada uno.
  - Mitigación: wave 2 dedicada a narrativa y rutas guiadas en docs/misiones.

## Recommended execution split

- **Plan 40-01 (wave 1):** foundation backend OAuth (start/callback), validación `state`, emisión de sesión compatible y tests API.
- **Plan 40-02 (wave 2):** actualización de docs/misiones y registro de fricción real en NOTEBOOK.

## Verification baseline for phase 40

- `node --check api/index.js`
- `node --check api/auth.js`
- `cd api && npm run test:sqlite`
- `cd api && npm run test:pg` (si Postgres local disponible)

---

*Research completed for planning phase 40.*
