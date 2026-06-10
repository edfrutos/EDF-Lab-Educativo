# Phase 18 Research: API Authentication Layer

**Phase:** 18-api-authentication-layer  
**Researched:** 2026-06-10  
**Status:** Ready for planning

## Summary

Fase 18 añade auth **opcional** vía JWT sin tocar el dashboard. El patrón de módulo separado (`auth.js`) replica `db.js`. Los tests existentes deben pasar sin cambios de entorno.

## Estado actual del código

| Archivo | Relevancia |
|---------|------------|
| `api/index.js` | Rutas `/users*`, `cors()`, `module.exports = app` para supertest |
| `api/index.test.js` | 16 tests; `DB_FILE` antes de require; `delete DATABASE_URL` |
| `api/openapi.yaml` | Sin auth; actualización parcial en plan 18-03 |
| `api/package.json` | `test:sqlite` encadena un archivo; ampliar con `index.auth.test.js` |

## Patrón JWT propuesto

```txt
Cliente                    API
  | POST /auth/login        |
  | { user, password }      |
  |------------------------>|
  |<------------------------| 200 { token, expiresIn: 3600 }
  |                         |
  | GET /users              |
  | Authorization: Bearer   |
  |------------------------>|
  |<------------------------| 200 [ users ]
```

## Middleware condicional

```js
function requireAuth(req, res, next) {
  if (!isAuthEnabled()) return next();
  // extraer Bearer, verify jwt.verify(...)
}
```

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Romper tests al importar `index.js` | `AUTH_ENABLED` unset → false; sin validación de secret al arrancar tests |
| Cache de módulos Node | Vars auth en auth tests **antes** del require (como `DB_FILE`) |
| Learners olvidan export en shell | `api/.env.example` + mensaje fail-fast claro en consola |
| CORS preflight con Bearer | Verificar en `18-UAT.md`; `cors()` suele bastar |

## Referencias en el repo

- Errores españoles: `validateUserPayload`, respuestas 400/404/409 en `index.js`
- Tests supertest: `index.test.js` describe/it/beforeEach
- Decisión dependencias: `AGENTS.md` regla 5 — solo `jsonwebtoken`

## Plan split sugerido (para `/gsd-plan-phase`)

| Plan | Entregables |
|------|-------------|
| 18-01 | `auth.js`, `POST /auth/login`, `.env.example`, dependencia `jsonwebtoken` |
| 18-02 | Router `/users` + `requireAuth`, fail-fast startup, lista endpoints en `GET /` |
| 18-03 | `index.auth.test.js`, script `test:sqlite`, borrador OpenAPI, `18-UAT.md` |
