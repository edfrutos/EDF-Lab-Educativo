# Misión 15: login, CRUD y cookie en React o Vue

## Objetivo

Practicar el flujo completo de **autenticación** en un dashboard con framework (React **o** Vue): login de operador, CRUD con sesión activa, inspección de la cookie en DevTools y cierre de sesión.

## Requisitos previos

- Misiones [`01-arrancar-api.md`](./01-arrancar-api.md), [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md) y [`03-consumir-json.md`](./03-consumir-json.md).
- Lectura: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md) y sección auth de [`docs/16-frameworks.md`](../docs/16-frameworks.md).
- Recomendado: [`missions/14-auth-vanilla-login-crud.md`](./14-auth-vanilla-login-crud.md) (mismo flujo en vanilla).

> **Importante:** en esta misión **no** uses `AUTH_DISABLED=1` en `api/.env`. Queremos el gate de login y la cookie real.

## Pasos

1. **Prepara la API** (terminal 1):

   ```bash
   cd api
   cp .env.example .env   # si es la primera vez
   ```

   Comprueba que **`AUTH_DISABLED` está comentado** (desactivado).

   ```bash
   PORT=3100 npm start
   ```

2. **Elige un framework** y arranca su dev server (terminal 2).

   **Opción A — React (`:5174`):**

   ```bash
   cd dashboard-react
   npm install
   npm run dev
   ```

   Abre http://localhost:5174

   **Opción B — Vue (`:5175`):**

   ```bash
   cd dashboard-vue
   npm install
   npm run dev
   ```

   Abre http://localhost:5175

3. **Comprueba el gate de login**

   - Debe aparecer el formulario **Iniciar sesión** (componente `LoginGate`).
   - El panel principal (health, tabla CRUD) debe estar **oculto** hasta autenticarte.

4. **Inicia sesión**

   - Email: `admin@lab.local`
   - Contraseña: `changeme`

   Tras **Entrar**, el dashboard carga health, metadatos de la API y la lista de usuarios.

5. **CRUD protegido (smoke test)**

   - Crea un usuario nuevo **o** edita uno existente.
   - DevTools → **Network** → Fetch/XHR.
   - Localiza `POST /users` o `PUT /users/:id` — Status 201 o 200.

6. **Inspecciona la cookie**

   En una petición a `http://localhost:3100/users`:

   - **Headers** → **Request Headers**
   - Debe aparecer `Cookie: edf_session=...`

7. **Cierra sesión**

   - Pulsa **Cerrar sesión** en la barra de herramientas.
   - Debe volver el formulario de login.

   Comprueba con curl (sin cookie):

   ```bash
   curl -s http://localhost:3100/users
   # → 401
   ```

8. **Cambio de contraseña del operador (fase 38)**

   Repite el flujo con cookie de sesión activa:

   ```bash
   curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@lab.local","password":"changeme"}'

   curl -b /tmp/edf-cj -X PATCH http://localhost:3100/auth/password \
     -H 'Content-Type: application/json' \
     -d '{"currentPassword":"changeme","newPassword":"changeme-2026"}'
   ```

   Verifica que el login antiguo falla (403) y el nuevo funciona.

## Resultado esperado

Puedes explicar en tus palabras:

1. Diferencia entre **operador** (`accounts`) y **usuarios CRUD** (`users`).
2. Por qué `fetch` necesita `credentials: 'include'` (ver [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)).
3. Si elegiste **Vue**: cómo `LoginGate` usa **`emit('login')`** y el padre escucha `@login`. Si elegiste **React**: cómo `LoginGate` recibe la prop **`onLogin`** — contraste didáctico en [`docs/16-frameworks.md`](../docs/16-frameworks.md).
4. Por qué `PATCH /auth/password` exige contraseña actual además de sesión válida.

## Reto extra

Con la sesión activa:

1. DevTools → **Application** → borra la cookie `edf_session`.
2. Pulsa **Recargar datos**.

Debes volver al gate con un **mensaje en español** bajo el formulario (no solo el panel rojo de error de conexión).

## Reto extra 2 (opcional)

Con la API en marcha y **sin** iniciar sesión, envía muchos intentos de login fallidos (o usa curl en bucle). Tras superar el límite configurado, `POST /auth/login` devuelve **429**. Ver [`api/README.md`](../api/README.md) y [`docs/10-tests.md`](../docs/10-tests.md).

## Enlaces

- Comparativa auth tres paneles: [`docs/16-frameworks.md`](../docs/16-frameworks.md)
- Guía conceptual: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- Depuración 401/429: [`docs/06-debugging.md`](../docs/06-debugging.md)
- React: [`dashboard-react/README.md`](../dashboard-react/README.md)
- Vue: [`dashboard-vue/README.md`](../dashboard-vue/README.md)
- Vanilla (referencia): [`missions/14-auth-vanilla-login-crud.md`](./14-auth-vanilla-login-crud.md)
