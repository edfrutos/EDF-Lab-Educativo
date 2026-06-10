# Phase 18 UAT — API Authentication Layer

**Fecha:** 2026-06-10  
**Alcance:** AUTH-01–AUTH-07 (solo API, sin dashboard)

## Pre-requisitos

- `cd api && npm install`
- Puerto 3100 libre

---

## 1. Auth desactivada (regresión v1.4)

- [ ] `cd api && npm run test:sqlite` — **23 tests** pasan (16 base + 7 auth)
- [ ] `PORT=3100 npm start` (sin `AUTH_ENABLED`)
- [ ] `curl -s http://localhost:3100/users` → **200** y array JSON
- [ ] `curl -s -X POST http://localhost:3100/auth/login -H 'Content-Type: application/json' -d '{"username":"a","password":"b"}'` → **404**

## 2. Auth activada

```bash
export AUTH_ENABLED=true
export AUTH_USER=admin
export AUTH_PASSWORD=lab-secret
export JWT_SECRET=lab-jwt-secret-minimum-32-chars!!
PORT=3100 npm start
```

- [ ] Consola muestra: `Autenticación JWT activa (rutas /users protegidas).`
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/users` → **401**
- [ ] Login devuelve token:

```bash
curl -s -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"lab-secret"}'
```

- [ ] `GET /users` con `Authorization: Bearer <token>` → **200**
- [ ] `curl -s http://localhost:3100/health` sin token → **200**

## 3. Fail-fast

- [ ] `AUTH_ENABLED=true` sin `JWT_SECRET` → el servidor **no arranca** y muestra error en español

## 4. CORS (preparación Fase 19)

- [ ] Con auth on, desde el dashboard `:5173` (cuando exista login en Fase 19), las peticiones con `Authorization` no fallan por CORS
- [ ] Si falla preflight: revisar `cors()` y cabeceras permitidas

## 5. OpenAPI

- [ ] `api/openapi.yaml` documenta `POST /auth/login`

---

## Sign-off

| Verificador | Fecha | Resultado |
|-------------|-------|-----------|
| Automatizado (`npm run test:sqlite`) | 2026-06-10 | |
| Manual (opcional) | | |

**Criterio de cierre Fase 18:** tests verdes + ítems 1–3 marcados.
