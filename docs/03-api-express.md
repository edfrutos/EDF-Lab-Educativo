# API Express

La API está en `api/index.js`.

## Endpoints

```txt
GET /
GET /health
GET /about
GET /time
POST /auth/login
POST /auth/logout
GET /users          ← requiere sesión de operador
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id
```

Las rutas `/users` devuelven **401** sin cookie de sesión válida. Antes de probar CRUD con `curl`, inicia sesión o lee [`17-autenticacion.md`](./17-autenticacion.md).

## Conceptos clave

### `app.get()`

Define una ruta HTTP de lectura.

### `app.post()`

Define una ruta HTTP para crear datos.

### `app.put()`

Define una ruta HTTP para reemplazar o actualizar un recurso existente.

### `req`

Objeto de petición.

### `res`

Objeto de respuesta.

### `res.json()`

Envía una respuesta JSON.

### `req.params`

Permite leer parámetros de la URL, por ejemplo `:id`.

### `req.body`

Contiene los datos enviados por el cliente en JSON.

### `res.status()`

Permite indicar el código HTTP antes de responder.

## Qué devuelve cada ruta

### `GET /`

Devuelve metadatos de la API y la lista de endpoints disponibles.

### `GET /health`

Sirve para comprobar que el servidor está vivo.

### `GET /users`

Devuelve la colección completa de usuarios ordenada por nombre.

### `GET /users/:id`

Devuelve un usuario concreto.

- `200` si existe.
- `400` si `:id` no es válido.
- `404` si el usuario no existe.

### `POST /users`

Crea un usuario nuevo en la base de datos (SQLite o Postgres según configuración).

Payload esperado:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}
```

### `PUT /users/:id`

Actualiza un usuario existente en la base de datos.

### `DELETE /users/:id`

Elimina un usuario y devuelve confirmación.

### `GET /about`

Devuelve información sobre el laboratorio educativo.

### `GET /time`

Devuelve la fecha y hora actuales en formato ISO.

## Ejemplos

```js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

```bash
# Login (guarda cookie)
curl -c /tmp/edf-cj -X POST http://localhost:3100/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.local","password":"changeme"}'

curl -b /tmp/edf-cj http://localhost:3100/users/1
```

```bash
curl -b /tmp/edf-cj -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

```bash
curl -b /tmp/edf-cj -X PUT http://localhost:3100/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.doe@example.com"}'
```

```bash
curl -b /tmp/edf-cj -X DELETE http://localhost:3100/users/1
```