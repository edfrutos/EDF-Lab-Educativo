# Misión 14: login y token Bearer

## Objetivo

Activar la autenticación JWT en la API, iniciar sesión desde el **dashboard vanilla**, ejecutar una operación CRUD y **ver la cabecera `Authorization`** en la pestaña Network del navegador.

## Requisitos previos

- Haber completado [`01-arrancar-api.md`](./01-arrancar-api.md) y [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md).
- Lectura recomendada: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

## Pasos

1. **Configura la API con auth** (terminal 1):

   ```bash
   cd api
   cp .env.example .env   # si no existe
   ```

   Edita `api/.env`:

   ```env
   AUTH_ENABLED=true
   AUTH_USER=admin
   AUTH_PASSWORD=lab-secret
   JWT_SECRET=un-secreto-largo-minimo-32-caracteres
   PORT=3100
   ```

   Arranca:

   ```bash
   PORT=3100 npm start
   ```

   Debes ver en consola: `Autenticación JWT activa (rutas /users protegidas).`

2. **Arranca el dashboard** (terminal 2):

   ```bash
   cd dashboard
   python3 -m http.server 5173
   ```

   Abre http://localhost:5173

3. **Comprueba el estado sin login:**

   - Las tarjetas `/health` y `/` deben cargar.
   - Debe aparecer el formulario **POST /auth/login**.
   - Estado de conexión: «API conectada — inicia sesión».

4. **Inicia sesión** con `admin` / `lab-secret`.

   - Tras el login, la tabla de usuarios debe mostrarse.
   - Botón **Cerrar sesión** visible.

5. **Abre DevTools** (F12) → pestaña **Network** → filtro **Fetch/XHR**.

   - Recarga o crea un usuario.
   - Localiza `GET /users` o `POST /users`.
   - En **Request Headers**, verifica:

     ```txt
     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
     ```

6. **Cierra sesión** y confirma que vuelve el formulario de login.

## Resultado esperado

- Entiendes la diferencia entre **API caída** (error rojo de conexión) y **API con auth** (formulario de login).
- Has visto el token JWT viajar en la cabecera `Authorization`.
- Has completado al menos un CRUD con sesión activa.

## Reto extra

**Opción A — solo `curl`:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"lab-secret"}' | jq -r .token)

curl -s http://localhost:3100/users -H "Authorization: Bearer $TOKEN"
```

**Opción B — React o Vue:** añade el Bearer en `fetchJson` de `dashboard-react` o `dashboard-vue` y repite la inspección Network en el puerto 5174 o 5175.

## Enlaces

- [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- [`docs/05-cors-explicado.md`](../docs/05-cors-explicado.md)
- [`docs/18-despliegue.md`](../docs/18-despliegue.md) *(si despliegas en servidor)*
