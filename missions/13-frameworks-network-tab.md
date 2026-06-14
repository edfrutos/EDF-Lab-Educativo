# Misión 13: frameworks y pestaña Network

## Objetivo

Arrancar la API y **un** dashboard con framework (React **o** Vue), ejecutar carga inicial y una operación CRUD, e **inspeccionar las peticiones HTTP** en las DevTools del navegador (pestaña Network).

## Requisitos previos

- Haber completado las misiones vanilla (p. ej. [`02-arrancar-dashboard.md`](./02-arrancar-dashboard.md), [`03-consumir-json.md`](./03-consumir-json.md)).
- Lectura recomendada: [`docs/16-frameworks.md`](../docs/16-frameworks.md), [`docs/05-cors-explicado.md`](../docs/05-cors-explicado.md), [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

## Pasos

1. **Arranca la API** (terminal 1):

   ```bash
   cd api
   cp .env.example .env   # si es la primera vez
   ```

   Para esta misión con React/Vue, descomenta **`AUTH_DISABLED=1`** en `api/.env` (solo desarrollo local) y reinicia. Los paneles framework aún no tienen pantalla de login.

   ```bash
   PORT=3100 npm start
   ```

2. **Elige un framework** y arranca su dev server (terminal 2).

   **Opción A — React:**

   ```bash
   cd dashboard-react
   npm install
   npm run dev
   ```

   Abre http://localhost:5174

   **Opción B — Vue:**

   ```bash
   cd dashboard-vue
   npm install
   npm run dev
   ```

   Abre http://localhost:5175

3. **Abre DevTools** (F12 o clic derecho → Inspeccionar) → pestaña **Network** (Red).

   - Activa el filtro **Fetch/XHR** si tu navegador lo ofrece.
   - Marca **Preserve log** si vas a recargar la página.

4. **Recarga la página** y localiza estas peticiones al cargar:

   - `GET http://localhost:3100/health`
   - `GET http://localhost:3100/`
   - `GET http://localhost:3100/users`

   Para cada una anota en tu cuaderno o en `NOTEBOOK.md`:

   - **Status** (debe ser 200)
   - **Request URL** completa
   - Un vistazo al **Response** (JSON)

5. **Crea un usuario** desde el formulario (nombre + email únicos).

   Localiza `POST http://localhost:3100/users`:

   - Método **POST**
   - Request headers: `Content-Type: application/json`
   - Request payload: `{ "name": "...", "email": "..." }`
   - Response: usuario creado con `id`

6. **Comprueba el origen (CORS):**

   - En la petición, mira que el **origen** de la página sea `http://localhost:5174` o `http://localhost:5175`.
   - En la consola **no** debe aparecer un error del tipo *blocked by CORS policy*.

## Resultado esperado

Puedes explicar con tus palabras:

- Qué JSON devolvió `/users` al cargar la página.
- Qué envió el navegador en el POST al crear un usuario.
- Por qué la API está en el puerto 3100 y el panel en otro puerto.

## Reto extra

Elige **una** de estas extensiones:

- Repite los pasos 4–5 con el **otro** framework (Vue si empezaste con React, o al revés).
- O bien: con vanilla en http://localhost:5173, compara una misma petición `GET /users` (headers, URL) con la del framework.

Documenta una diferencia que hayas observado (aunque el JSON sea el mismo).

## Enlaces

- [`docs/16-frameworks.md`](../docs/16-frameworks.md) — comparativa de estado y formularios
- [`dashboard-react/README.md`](../dashboard-react/README.md) — puerto 5174
- [`dashboard-vue/README.md`](../dashboard-vue/README.md) — puerto 5175
