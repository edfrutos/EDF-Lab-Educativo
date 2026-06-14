# Debugging

Problemas habituales y cómo diagnosticarlos.

## Puerto ocupado

Síntoma:

```txt
EADDRINUSE
```

Diagnóstico:

```bash
lsof -nP -iTCP:3100 -sTCP:LISTEN
```

## API apagada

Síntoma:

El dashboard muestra error de conexión.

Solución:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

## Node incorrecto

Diagnóstico:

```bash
which node
which npm
node --version
npm --version
```

Debe apuntar a `~/.nvm/versions/node/...`.

## 401 en `/users` sin sesión

Síntoma:

- El dashboard muestra login o «API conectada» pero la tabla de usuarios no carga.
- `curl http://localhost:3100/users` devuelve **401**.
- En la pestaña Network, `GET /users` es rojo con 401.

Causa:

Las rutas `/users` están protegidas. Falta cookie de sesión (`edf_session`) o el cliente no envía credenciales.

Solución:

1. En el dashboard vanilla (`:5173`), inicia sesión con el operador del laboratorio (`admin@lab.local` / `changeme` por defecto si no cambiaste `.env`).
2. Comprueba que en `api/` exista `.env` con `JWT_SECRET` (copia desde `.env.example`).
3. Con `curl`, haz login antes: ver ejemplos en [`17-autenticacion.md`](./17-autenticacion.md).
4. Si desarrollas React/Vue sin pantalla de login, puedes usar temporalmente `AUTH_DISABLED=1` en `api/.env` **solo en local** — nunca en producción.

**Aprendizaje:** `GET /health` puede funcionar mientras `/users` falla: no son el mismo nivel de acceso.

## CORS con cookies (login OK pero `/users` sigue en 401)

Síntoma:

Tras login, Network muestra la petición a `/users` sin cookie o bloqueada por CORS.

Comprueba:

- `fetch` con `credentials: 'include'` (ya en `dashboard/app.js`).
- `CORS_ORIGINS` en `api/.env` incluye tu puerto (`5173`, `5174` o `5175`).

Ver [`05-cors-explicado.md`](./05-cors-explicado.md) y [`17-autenticacion.md`](./17-autenticacion.md).
