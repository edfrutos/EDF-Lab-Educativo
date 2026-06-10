# Phase 18 Discussion Log

**Date:** 2026-06-10  
**Phase:** 18 — API Authentication Layer  
**Mode:** Auto (sin cuestionario interactivo; decisiones por defecto alineadas con v1.5 research y restricciones del lab)

## Áreas tratadas

1. Arquitectura del módulo de auth  
2. Contrato de `POST /auth/login`  
3. Middleware y rutas protegidas  
4. Variables de entorno y arranque  
5. CORS y cabecera `Authorization`  
6. Suite de tests  
7. OpenAPI y alcance de documentación  
8. Endpoints opcionales (`GET /auth/me`)

---

## 1. Arquitectura del módulo

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| Organización del código | Todo en `index.js` / **`api/auth.js`** / carpeta `middleware/` | **`api/auth.js`** (paridad con `db.js`) |
| Exportaciones | Solo middleware / **middleware + helpers de test** | **Helpers exportados** (`signToken`, `isAuthEnabled`) para tests |

**Notas:** `index.js` importa `requireAuth`, `loginHandler` (o router) y aplica cambios mínimos en rutas `/users`.

---

## 2. Contrato de login

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| HTTP en éxito | **200** / 201 | **200** (no se crea recurso de usuario) |
| Cuerpo de éxito | `{ token, expiresIn }` / + `tokenType` | **`{ token, expiresIn }`** — `expiresIn` en **segundos** (3600) |
| Credenciales incorrectas | 401 / 403 | **401** `{ error: "Credenciales incorrectas." }` |
| Cuerpo inválido | 400 / 401 | **400** si faltan `username` o `password` |
| Auth desactivada | No registrar ruta / **404 explicativo** | **404** `{ error: "La autenticación no está activada (AUTH_ENABLED=false)." }` |

**Notas:** Comparación directa con `AUTH_USER` y `AUTH_PASSWORD` en texto plano — **solo laboratorio**; doc 17 explicará hashing en producción.

---

## 3. Middleware y rutas

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| Rutas protegidas | Solo mutaciones / **todo `/users*`** | **GET/POST/PUT/DELETE** bajo `/users` |
| Rutas públicas con auth on | health + / / about + time / + login | **health, /, about, time, POST /auth/login** |
| Sin token | 401 / 403 | **401** `{ error: "Token no proporcionado." }` |
| Token inválido/caducado | 401 / 403 | **401** `{ error: "Token inválido o caducado." }` |
| Aplicación del middleware | Por ruta / **`Router` `/users`** | **Router** `usersRouter` montado en `/users` con `requireAuth` condicional |

**Notas:** `requireAuth` es no-op (llama `next()`) cuando `AUTH_ENABLED=false`.

---

## 4. Variables de entorno

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| Cargar `.env` | **Sin `dotenv`** / añadir dependencia | **Sin `dotenv`** — `export` en shell + `api/.env.example` |
| `AUTH_ENABLED` default | false / true | **`false`** (misiones 01–13 intactas) |
| Parseo de boolean | `=== 'true'` / truthy | **`process.env.AUTH_ENABLED === 'true'`** (explícito) |
| Arranque con auth on | Lazy fail / **fail-fast** | **Fail-fast** si faltan `JWT_SECRET`, `AUTH_USER` o `AUTH_PASSWORD` |
| Expiración JWT | 1h / 24h / configurable | **1h fijo** (`expiresIn: '1h'` en sign; 3600 en respuesta) |

---

## 5. CORS

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| Cambio en API | **`cors()` sin cambios** / orígenes explícitos | **Sin cambios en Fase 18** |
| Verificación | Manual en UAT / omitir | **`18-UAT.md`** — comprobar preflight con `Authorization` desde `:5173` (preparación Fase 19) |

**Notas:** `cors` por defecto permite cabecera `Authorization`; si falla en UAT, ajuste mínimo en plan 18-02.

---

## 6. Tests

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| Archivo | Ampliar `index.test.js` / **`index.auth.test.js`** | **`index.auth.test.js`** separado |
| Encadenado en `test:sqlite` | Sí / no | **Sí** — `index.test.js` && `index.auth.test.js` |
| Tests Postgres con auth | Duplicar en `index.pg.test.js` / solo SQLite | **Solo SQLite en Fase 18** (middleware agnóstico a DB) |
| Aislamiento env | beforeEach set/delete / archivo `.env.test` | **beforeEach/afterEach** en vars `AUTH_*` (patrón `DB_FILE`) |
| Orden de require | Igual que DB | **`AUTH_ENABLED` y credenciales ANTES de `require('./index')`** en auth tests |

**Casos mínimos:** login ok, login fail, GET /users sin token → 401, GET /users con Bearer → 200, regresión auth off (suite existente 16/16).

---

## 7. OpenAPI y documentación

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| OpenAPI en Fase 18 | Completo / **borrador `/auth/login`** / Fase 20 | **Borrador en plan 18-03**; `securitySchemes` completo en Fase 20 |
| `.env.example` | Fase 18 / Fase 20 | **Fase 18** (plan 18-01) |
| NOTEBOOK | Fase 18 / Fase 20 | **Fase 20** (errores vividos al integrar dashboard) |
| Actualizar `GET /` endpoints | Sí / no | **Sí** — incluir `POST /auth/login` en lista |

---

## 8. Endpoints opcionales

| Pregunta | Opciones | Selección |
|----------|----------|-----------|
| `GET /auth/me` | Implementar / **omitir** / reto doc | **Omitir** — Fase 19 valida token vía `/users`; reto extra en doc 17 |

---

## Dependencia nueva

| Paquete | Decisión |
|---------|----------|
| `jsonwebtoken` | **Añadir** a `dependencies` — valor didáctico claro (JWT estándar) |
| `bcryptjs` | **No** en Fase 18 — contraseña en env; doc advierte |

---

## Aplazado durante la discusión

- Login en dashboards React/Vue — Fase 19 / Misión 14 reto  
- Endurecimiento CORS por origen — doc 18, no código obligatorio en Fase 18  
- Tests auth con Postgres — redundante si middleware no toca DB  
- `GET /auth/me` — reto en documentación

---

## Resultado

CONTEXT.md actualizado con decisiones D-17–D-28. **Listo para** `/gsd-plan-phase 18`.

*Log generado desde /gsd-discuss-phase 18*
