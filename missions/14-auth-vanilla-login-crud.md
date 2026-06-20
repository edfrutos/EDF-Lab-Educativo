# Misión 14: login, CRUD protegido y cookie de sesión

## Objetivo

Practicar el flujo completo de **autenticación** en el dashboard vanilla: login de operador, CRUD con sesión activa, inspección de la cookie en DevTools y cierre de sesión.

Al terminar el **núcleo** (pasos 1–7) podrás explicar la diferencia entre operador y usuarios CRUD, y por qué `fetch` necesita `credentials: 'include'`.

## Requisitos previos

- Misiones [`01-arrancar-api.md`](./01-arrancar-api.md), [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md) y [`03-consumir-json.md`](./03-consumir-json.md).
- Lectura: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

> **Importante:** en esta misión **no** uses `AUTH_DISABLED=1` en `api/.env`. Queremos ver el gate de login y la cookie real.

---

## Núcleo (obligatorio)

### 1. Prepara la API (terminal 1)

```bash
cd api
cp .env.example .env   # si es la primera vez
```

En `.env`, define una clave larga para firmar JWT (comentario en la plantilla). Comprueba que **`AUTH_DISABLED` está comentado** (desactivado).

```bash
PORT=3100 npm start
```

### 2. Arranca el dashboard vanilla (terminal 2)

```bash
cd dashboard
python3 -m http.server 5173
```

Abre http://localhost:5173

### 3. Comprueba el gate de login

- Debe aparecer el formulario **Iniciar sesión**.
- La tabla de usuarios y el formulario CRUD deben estar **ocultos** hasta autenticarte.
- `GET /health` sigue siendo público: el indicador de conexión puede mostrar la API online aunque aún no hayas entrado.

### 4. Inicia sesión

- Email: `admin@lab.local`
- Contraseña: `changeme` (valores por defecto del laboratorio)

Tras **Entrar**, el panel principal debe cargar health, metadatos de la API y la lista de usuarios.

### 5. CRUD protegido (smoke test)

- Crea un usuario nuevo **o** edita uno existente desde el formulario.
- Abre DevTools → **Network** → filtra Fetch/XHR.
- Localiza la petición `POST /users` o `PUT /users/:id` y anota **Status** (201 o 200) y un fragmento del JSON de respuesta.

### 6. Inspecciona la cookie

La sesión vive en la cookie httpOnly **`edf_session`**, emitida por la API en `:3100` (no por el servidor estático en `:5173`).

En DevTools → **Network**, selecciona una petición a `http://localhost:3100/users`:

- Pestaña **Headers** → **Request Headers**
- Debe aparecer `Cookie: edf_session=...`

Opcional — pestaña **Application** → **Cookies** → `http://localhost:3100`: verás `edf_session` (httpOnly; el JS del dashboard no puede leerla).

### 7. Cierra sesión (logout)

- Pulsa **Cerrar sesión** en el dashboard (`POST /auth/logout`).
- Debe volver el formulario de login.

Comprueba sin cookie (terminal 3):

```bash
curl -s http://localhost:3100/users
# → 401
```

Comprueba el flujo completo con curl (opcional):

```bash
curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lab.local","password":"changeme"}'

curl -b /tmp/edf-cj http://localhost:3100/users
# → 200 + JSON

curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/logout
curl -b /tmp/edf-cj http://localhost:3100/users
# → 401
```

---

## Resultado esperado (núcleo)

Puedes explicar en tus palabras:

1. Diferencia entre **operador** (`accounts`) y **usuarios CRUD** (`users`).
2. Qué hace `POST /auth/login` y por qué las peticiones siguientes llevan `Cookie`.
3. Por qué `fetch` necesita `credentials: 'include'` (ver [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)).
4. Qué diferencia hay entre **API offline** (caja roja de error) y **sesión caducada** (formulario de login con mensaje en español).

---

## Reto extra (núcleo)

Con la sesión activa:

1. DevTools → **Application** → **Cookies** → `http://localhost:3100` → borra `edf_session`.
2. Pulsa **Recargar datos** en el dashboard.

Debes volver al gate de login con un **mensaje en español** bajo el formulario (no solo la caja roja de error de conexión).

---

## Anexo opcional: auth avanzada (fases 38–41)

Solo si ya dominas el núcleo. Detalle conceptual en [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

Antes de los `curl` de este anexo, guarda la cookie de sesión:

```bash
curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lab.local","password":"changeme"}'
```

### A. Cambio de contraseña del operador (fase 38)

```bash
curl -b /tmp/edf-cj -X PATCH http://localhost:3100/auth/password \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"changeme","newPassword":"changeme-2026"}'
```

Cierra sesión y vuelve a iniciar con la contraseña nueva. Si la contraseña actual no coincide, la API responde **403**.

### B. Refresh token rotation (fase 39)

```bash
curl -b /tmp/edf-cj -c /tmp/edf-cj -X POST http://localhost:3100/auth/refresh
```

Repite con una cookie `edf_refresh` antigua (si la guardaste antes de rotar): debe responder **401**.

### C. OAuth mock (fases 40–41)

Desde terminal:

```bash
curl -i "http://localhost:3100/auth/oauth/start?provider=mock"
# Copia state de la cookie edf_oauth_state o del redirect

curl -i "http://localhost:3100/auth/oauth/callback?provider=mock&code=mock-admin&state=<STATE>"
```

Desde el dashboard (`:5173`):

1. Compara el formulario **login clásico** con **Continuar con OAuth mock**.
2. Pulsa OAuth mock y confirma que aparece la tabla de usuarios sin contraseña.
3. Cierra sesión y repite el login clásico para verificar que ambas rutas conviven.

    Verificación automatizada (espera `# pass 36` al final; tarda unos segundos por bcrypt):

    ```bash
    cd api && npm install && npm run test:sqlite
    npx playwright test --config=e2e/playwright.config.js --project=vanilla-chromium e2e/tests/auth-smoke.vanilla.spec.js
    ```

### Resultado esperado (anexo)

Además del núcleo, puedes explicar:

- Qué significa **rotación de refresh token** y por qué reusar uno viejo debe fallar.
- Por qué el parámetro `state` en OAuth protege frente a callbacks no válidos.
- Cuándo usar **login clásico** frente a **OAuth mock**.

---

## Enlaces

- Guía conceptual: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- Arranque del dashboard: [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md)
- Depuración 401: [`docs/06-debugging.md`](../docs/06-debugging.md#401-en-users-sin-sesión)
- Despliegue producción: [`docs/18-production-deploy.md`](../docs/18-production-deploy.md)
- Siguiente misión (frameworks): [`15-framework-auth-login-crud.md`](./15-framework-auth-login-crud.md)
