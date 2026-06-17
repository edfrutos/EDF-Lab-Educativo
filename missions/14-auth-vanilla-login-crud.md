# Misión 14: login, CRUD protegido y cookie de sesión

## Objetivo

Practicar el flujo completo de **autenticación** en el dashboard vanilla: login de operador, CRUD con sesión activa, inspección de la cookie en DevTools y cierre de sesión.

## Requisitos previos

- Misiones [`01-arrancar-api.md`](./01-arrancar-api.md), [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md) y [`03-consumir-json.md`](./03-consumir-json.md).
- Lectura: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

> **Importante:** en esta misión **no** uses `AUTH_DISABLED=1` en `api/.env`. Queremos ver el gate de login y la cookie real.

## Pasos

1. **Prepara la API** (terminal 1):

   ```bash
   cd api
   cp .env.example .env   # si es la primera vez
   ```

   En `.env`, define una clave larga para firmar JWT (variable documentada en el comentario de la plantilla). Comprueba que **`AUTH_DISABLED` está comentado** (desactivado).

   ```bash
   PORT=3100 npm start
   ```

2. **Arranca el dashboard vanilla** (terminal 2):

   ```bash
   cd dashboard
   python3 -m http.server 5173
   ```

   Abre http://localhost:5173

3. **Comprueba el gate de login**

   - Debe aparecer el formulario **Iniciar sesión**.
   - La tabla de usuarios y el formulario CRUD deben estar **ocultos** hasta autenticarte.

4. **Inicia sesión**

   - Email: `admin@lab.local`
   - Contraseña: `changeme` (valores por defecto del laboratorio)

   Tras **Entrar**, el panel principal debe cargar health, metadatos de la API y la lista de usuarios.

5. **CRUD protegido (smoke test)**

   - Crea un usuario nuevo **o** edita uno existente desde el formulario.
   - Abre DevTools → **Network** → filtra Fetch/XHR.
   - Localiza la petición `POST /users` o `PUT /users/:id` y anota **Status** (201 o 200) y un fragmento del JSON de respuesta.

6. **Inspecciona la cookie**

   En DevTools → **Network**, selecciona una petición a `http://localhost:3100/users` (o similar):

   - Pestaña **Headers** → **Request Headers**
   - Debe aparecer `Cookie: edf_session=...`

   Opcional: DevTools → **Application** → **Cookies** → `http://localhost:5173` o el origen que muestre la cookie httpOnly (según navegador, la cookie puede listarse bajo el dominio de la API en peticiones cross-origin).

7. **Cierra sesión (logout)**

   - Pulsa **Cerrar sesión** en el dashboard (equivale a `POST /auth/logout`).
   - Debe volver el formulario de login.
   - Comprueba con curl (sin cookie):

     ```bash
     curl -s http://localhost:3100/users
     # → 401
     ```

8. **Cambio de contraseña del operador (fase 38)**

   Con sesión activa, prueba el endpoint nuevo:

   ```bash
   curl -b /tmp/edf-cj -X PATCH http://localhost:3100/auth/password \
     -H 'Content-Type: application/json' \
     -d '{"currentPassword":"changeme","newPassword":"changeme-2026"}'
   ```

   Luego cierra sesión y vuelve a iniciar con la contraseña nueva para confirmar el cambio.

9. **Refresh token rotation (fase 39)**

   Con login activo, renueva sesión:

   ```bash
   curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/refresh
   ```

   Repite el mismo comando usando una cookie de refresh antigua (si la guardaste antes de rotar): debe responder **401**.

## Resultado esperado

Puedes explicar en tus palabras:

1. Diferencia entre **operador** (`accounts`) y **usuarios CRUD** (`users`).
2. Qué hace `POST /auth/login` y por qué las peticiones siguientes llevan `Cookie`.
3. Por qué `fetch` necesita `credentials: 'include'` (ver [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)).
4. Qué diferencia hay entre **cambiar contraseña** (requiere sesión + contraseña actual) y **hacer login**.
5. Qué significa **rotación de refresh token** y por qué reusar uno viejo debe fallar.

## Reto extra

Con la sesión activa:

1. DevTools → **Application** → borra la cookie `edf_session`.
2. Pulsa **Recargar datos** en el dashboard.

Debes volver al gate de login con un **mensaje en español** bajo el formulario (no solo la caja roja de error de conexión).

## Enlaces

- Guía conceptual: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- Arranque del dashboard: [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md)
- Depuración 401: [`docs/06-debugging.md`](../docs/06-debugging.md)
