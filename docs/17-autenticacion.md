# Autenticación del operador

A partir de la **fase de autenticación**, las rutas **`/users`** (y sus variantes con `:id`) exigen una **sesión de operador**. Los usuarios que gestionas con CRUD (`John`, `Jane`, etc.) no son lo mismo que la cuenta que inicia sesión: el operador vive en la tabla `accounts` y solo sirve para **acceder al panel**.

Las rutas públicas siguen abiertas sin login:

```txt
GET /health
GET /
GET /about
GET /time
POST /auth/login
GET /auth/oauth/start
GET /auth/oauth/callback
POST /auth/refresh
PATCH /auth/password
POST /auth/logout
```

Guía técnica ampliada en [`api/README.md`](../api/README.md). Contrato formal: [`api/openapi.yaml`](../api/openapi.yaml).

---

## Flujo en el laboratorio

```txt
Navegador (dashboard :5173)
  ↓ POST /auth/login { email, password }
API valida contra accounts → cookie httpOnly edf_session (JWT)
  ↓ fetch('/users', { credentials: 'include' })
API requireAuth → 200 + JSON de usuarios
```

Sin cookie válida, `GET /users` responde **401** con un mensaje sobre la sesión.

---

## Contraseñas y bcrypt

La cuenta del **operador** vive en la tabla `accounts` (SQLite o Postgres). Nunca guardamos la contraseña en texto plano:

- Al crear el operador inicial, la API hashea con **bcrypt** y guarda `password_hash`.
- En `POST /auth/login`, `bcrypt.compare()` contrasta la contraseña enviada con ese hash.

Los **usuarios CRUD** (`users`: John, Jane, etc.) son otro concepto: datos del panel, no credenciales de acceso.

Implementación: [`api/auth.js`](../api/auth.js) (`loginHandler`).

---

## JWT en cookie httpOnly

Tras un login válido, la API firma un **JWT** con `JWT_SECRET` y lo envía en la cookie **`edf_session`**:

- **`httpOnly`:** JavaScript del dashboard no puede leerla (menos riesgo de robo por XSS).
- **`sameSite: 'lax'`:** comportamiento razonable en navegación normal entre orígenes del lab.
- **`secure` en producción:** con `NODE_ENV=production`, la cookie solo viaja por HTTPS — necesitas TLS delante (ver despliegue abajo).

**No** guardamos el JWT en `localStorage` ni en cabecera `Authorization` en este laboratorio v1.5: el navegador gestiona la cookie si el cliente pide credenciales.

Desde fase 39, además de `edf_session`, la API emite `edf_refresh` y aplica rotación: cada `POST /auth/refresh` devuelve un refresh nuevo e invalida el anterior.

Desde fase 40, existe una base didáctica de OAuth social con proveedor `mock` para practicar el flujo `start` + `callback` sin depender de internet.

---

## Configuración en la API

Desde `api/`:

```bash
cp .env.example .env
```

Variables importantes:

| Variable | Uso |
|----------|-----|
| `JWT_SECRET` | Firma del token (cadena larga en `.env`, no en el repo) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Operador inicial si `accounts` está vacía |
| `CORS_ORIGINS` | Orígenes del dashboard (`5173`, `5174`, `5175`) con cookies |
| `AUTH_DISABLED=1` | **Solo tests** — desactiva `requireAuth` en la suite CRUD |

Credenciales por defecto del laboratorio: `admin@lab.local` / `changeme`.

Arranca la API:

```bash
cd api
PORT=3100 npm start
```

---

## Probar con curl

Login y cookie en un archivo temporal:

```bash
curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lab.local","password":"changeme"}'

curl -b /tmp/edf-cj http://localhost:3100/users
```

Sin cookie:

```bash
curl -s http://localhost:3100/users
# → 401
```

Cerrar sesión:

```bash
curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/logout
```

Renovar sesión con refresh token (rotación):

```bash
curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/refresh
```

Si reutilizas un refresh ya rotado o inválido, responde **401** y obliga a iniciar sesión de nuevo.

OAuth mock start/callback (foundation):

```bash
# 1) inicia flujo OAuth mock y obtén state
curl -i "http://localhost:3100/auth/oauth/start?provider=mock"

# 2) completa callback con code mock-admin y el state devuelto
curl -i "http://localhost:3100/auth/oauth/callback?provider=mock&code=mock-admin&state=<STATE>"
```

Si `state` no coincide con la cookie `edf_oauth_state`, el callback responde **400**.

Cambiar contraseña del operador autenticado:

```bash
curl -b /tmp/edf-cj -X PATCH http://localhost:3100/auth/password \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"changeme","newPassword":"changeme-2026"}'
```

Si `currentPassword` no coincide, responde **403**. Si faltan campos o `newPassword` tiene menos de 8 caracteres, responde **400**.

---

## Dashboard vanilla

En [`dashboard/app.js`](../dashboard/app.js), la función **`fetchJson`** envía **`credentials: 'include'`** por defecto para que el navegador adjunte la cookie en peticiones a `:3100`.

```javascript
const response = await fetch(url, {
  credentials: 'include',
  headers: { Accept: 'application/json', ...options.headers },
  ...options
});
```

La interfaz muestra un formulario de **Iniciar sesión** antes del panel CRUD. Tras login correcto, se cargan health, metadatos y usuarios.

### Login clásico vs OAuth mock

| Ruta | Cuándo usarla | Qué hace en UI |
|------|---------------|----------------|
| **Login clásico** | Tienes email/contraseña del operador | Formulario **Entrar** → `POST /auth/login` |
| **OAuth mock** | Quieres practicar el handoff OAuth sin proveedor externo | Botón **Continuar con OAuth mock** → `GET /auth/oauth/start` + callback con `authUrl` |

El dashboard vanilla completa OAuth mock **en la misma página**: llama a `/auth/oauth/start`, consume la `authUrl` devuelta con `credentials: 'include'` y reutiliza el bootstrap actual para cargar `/users`. No necesitas navegar manualmente al JSON del callback en `:3100`.

Errores frecuentes en UI:

- **State inválido:** el callback se ejecutó sin la cookie `edf_oauth_state` del start previo.
- **401 tras OAuth:** la API no está en `:3100` o CORS/cookies no están habilitados.
- **Mezclar rutas:** OAuth mock no sustituye refresh/password; son flujos complementarios del mismo operador.

Lectura relacionada: [`04-dashboard-fetch.md`](./04-dashboard-fetch.md) (patrón `fetch` y estados de carga).

---

## Dashboards React y Vue (opcional)

Los paneles en `dashboard-react/` y `dashboard-vue/` están pensados para comparar **estado y formularios**, no para repetir toda la pantalla de login.

Opciones didácticas:

1. **Aprender auth con vanilla** en `:5173` (recomendado).
2. **Explorar React/Vue sin login en la UI:** en `api/.env`, descomenta temporalmente `AUTH_DISABLED=1`, reinicia la API y no uses eso en producción.
3. **Extender React/Vue** con un formulario de login (reto avanzado).

Si la API exige sesión y el cliente no envía cookie, verás **401** en la pestaña Network aunque `GET /health` funcione.

Detalle multi-framework: [`16-frameworks.md`](./16-frameworks.md).

---

## CORS y cookies

Con frontends en puertos distintos (`5173`, `5174`, `5175`), el navegador aplica CORS. La API usa `cors()` con **`credentials: true`** y lista `CORS_ORIGINS` en `.env`.

El cliente debe usar:

```javascript
fetch(url, { credentials: 'include', /* ... */ });
```

Sin `credentials: 'include'`, la cookie de sesión **no viaja** y `/users` seguirá devolviendo 401.

Más contexto: [`05-cors-explicado.md`](./05-cors-explicado.md).

---

## Tests automatizados

`npm test` en `api/` define `AUTH_DISABLED=1` para los **16 tests CRUD** de SQLite y los **16** de Postgres.

El bloque **«Autenticación API»** (7 tests) desactiva `AUTH_DISABLED` y comprueba login, logout, 401 y cookie.

Desde fase 38/39, ese bloque también valida:

- `PATCH /auth/password` (sin sesión, payload inválido, contraseña actual incorrecta y login con contraseña nueva)
- `POST /auth/refresh` (sin cookie, refresh válido con rotación, reuse inválido, invalidación en logout)
- `GET /auth/oauth/start|callback` (state generado, callback inválido por state, callback mock exitoso con sesión)

No uses `AUTH_DISABLED` en un servidor real. Ver [`10-tests.md`](./10-tests.md).

---

## Producción y secretos

En desarrollo local puedes omitir `JWT_SECRET` (verás un aviso). Con **`NODE_ENV=production`**, la API **no arranca** sin secret definido en `api/.env`.

Secretos, Compose (`env_file`), TLS en nginx y cookies `Secure`: [`18-production-deploy.md`](./18-production-deploy.md).

Misión guiada con login real: [`missions/14-auth-vanilla-login-crud.md`](../missions/14-auth-vanilla-login-crud.md).

---

## Depuración rápida (bloque 3 / misión 19)

| Síntoma | Causa | Acción |
|---------|-------|--------|
| `changeme` → credenciales inválidas | Contraseña ya rotada con `PATCH /auth/password` | Login con `changeme-2026` o reset de `accounts` |
| Refresh → 401 siempre | Sin login previo o cookie jar vacío | `curl -c /tmp/edf-cj` en login; `cp` antes de rotar |
| Playwright: puerto `:3100` en uso | `npm start` manual + config E2E (`reuseExistingServer: false` para API) | `kill $(lsof -ti :3100)` y relanza el test |
| `.env` no cambia la contraseña | `seedAdminIfEmptyAccounts` solo inserta si `accounts` está vacía | `DELETE FROM accounts` + reinicio, o `PATCH /auth/password` logueado |

Reset SQLite en desarrollo host (solo laboratorio):

```bash
./scripts/clean-local-dev.sh
cd api && PORT=3100 npm start   # recrea users.db y operador desde .env
```

---

## Resumen

- **Operador** ≠ usuarios CRUD.
- **Cookie httpOnly** `edf_session`, no JWT en `localStorage`.
- **`/users` protegido**; health y raíz públicos.
- **Vanilla** incluye login; **React/Vue** requieren auth desactivada en dev o implementar login.
- **Depuración 401:** [`06-debugging.md`](./06-debugging.md#401-en-users-sin-sesión).
