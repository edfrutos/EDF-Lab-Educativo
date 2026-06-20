# Phase 20 UAT — Auth & Production Learning Material

**Fecha:** 2026-06-20  
**Alcance:** DEPLOY-01–DEPLOY-06 (cierre hito v1.5)

## Documentación

- [x] `docs/17-autenticacion.md` existe y enlaza a misión 14
- [x] `docs/18-despliegue.md` cubre Plesk, Compose prod, checklist
- [x] `docs/00-indice.md` lista docs 17–18
- [x] `README.md` menciona auth y misión 14
- [x] `missions/14-login-y-token.md` con objetivo, pasos, resultado, reto extra

## OpenAPI

- [x] `api/openapi.yaml` tiene `components.securitySchemes.bearerAuth`
- [x] Rutas `/users` documentan `security: bearerAuth` y respuesta 401

## NOTEBOOK

- [x] Sección `## Autenticación y despliegue (v1.5)` con errores reales (502, 5432, Plesk, PROD_HTTPS_PORT)

## Regresión auth (opcional manual)

- [x] `cd api && npm run test:sqlite` — 23/23
- [x] `node --check dashboard/app.js`

## Sign-off

| Verificador | Fecha | Resultado |
|-------------|-------|-----------|
| Automatizado (grep + tests) | 2026-06-20 | PASS |
| Revisión manual docs | 2026-06-20 | PASS |

**Criterio de cierre v1.5:** todos los DEPLOY-* marcados + fases 18–20 completas.
