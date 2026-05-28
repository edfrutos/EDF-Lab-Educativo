# API Express del laboratorio

Backend educativo construido con **Node.js**, **Express**, **Lodash** y **CORS**.

Esta API sirve como base para aprender:

- rutas HTTP en Express,
- respuestas JSON,
- parametros de ruta,
- lectura de `req.body`,
- validacion basica,
- codigos HTTP,
- CRUD en memoria,
- consumo desde un frontend separado.

La API vive en:

```txt
/Users/edefrutos/Desktop/EDF-Lab-Educativo/api
```

---

## Arranque

Desde esta carpeta:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

Resultado esperado en consola:

```txt
Server is running on port 3100
```

Prueba rapida:

```bash
curl http://localhost:3100/health
```

Resultado esperado:

```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

---

## Endpoints actuales

```txt
GET /
GET /health
GET /users
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id
GET /about
GET /time
```

---

## Lectura de datos

### `GET /`

Devuelve informacion general de la API y la lista de endpoints.

```bash
curl http://localhost:3100/
```

### `GET /health`

Comprueba que el servidor esta vivo.

```bash
curl http://localhost:3100/health
```

### `GET /users`

Devuelve todos los usuarios ordenados por nombre.

```bash
curl http://localhost:3100/users
```

### `GET /users/:id`

Devuelve un usuario concreto.

```bash
curl http://localhost:3100/users/1
```

Respuestas importantes:

- `200`: usuario encontrado.
- `400`: el parametro `:id` no es un numero entero.
- `404`: no existe un usuario con ese identificador.

Ejemplo de error:

```bash
curl http://localhost:3100/users/abc
```

---

## Escritura de datos

Los datos se guardan en memoria. Si reinicias la API, vuelven al estado inicial definido en `index.js`.

### `POST /users`

Crea un usuario.

```bash
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

Resultado esperado:

```json
{
  "id": 3,
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}
```

### `PUT /users/:id`

Actualiza un usuario existente.

```bash
curl -X PUT http://localhost:3100/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane.doe@example.com"}'
```

### `DELETE /users/:id`

Elimina un usuario.

```bash
curl -X DELETE http://localhost:3100/users/1
```

---

## Validacion

`POST /users` y `PUT /users/:id` esperan este cuerpo JSON:

```json
{
  "name": "Nombre",
  "email": "correo@example.com"
}
```

Si falta `name` o `email`, o si llegan vacios, la API responde con `400`.

Ejemplo ejecutable:

```bash
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":""}'
```

Resultado esperado:

```json
{
  "error": "El campo \"name\" es obligatorio y debe ser texto."
}
```

---

## Endpoints auxiliares

### `GET /about`

Devuelve informacion del laboratorio.

```bash
curl http://localhost:3100/about
```

### `GET /time`

Devuelve la fecha y hora actual en formato ISO.

```bash
curl http://localhost:3100/time
```

---

## Conceptos clave en `index.js`

### Middleware

```js
app.use(cors());
app.use(express.json());
```

- `cors()` permite que el dashboard en `http://localhost:5173` lea respuestas de la API.
- `express.json()` permite leer JSON enviado en el cuerpo de `POST` y `PUT`.

### Parametros de ruta

```js
app.get('/users/:id', (req, res) => {
  const userId = parseUserId(req.params.id);
});
```

`req.params.id` contiene el valor que llega en la URL.

### Cuerpo de la peticion

```js
const { name, email } = req.body;
```

`req.body` contiene el JSON enviado por el cliente.

### Codigo HTTP

```js
return res.status(404).json({ error: 'Usuario no encontrado.' });
```

El codigo HTTP explica el resultado de la operacion:

- `200`: lectura o actualizacion correcta.
- `201`: recurso creado.
- `400`: peticion invalida.
- `404`: recurso inexistente.
- `500`: error inesperado.

---

## Comprobaciones y tests

Estos comandos comprueban la calidad del código. Ejecútalos desde `api/`.

**Sintaxis** — detecta errores de parseo JavaScript sin ejecutar el servidor:

```bash
node --check index.js
```

**Seguridad** — revisa vulnerabilidades conocidas en las dependencias:

```bash
npm audit --audit-level=high
```

**Tests automáticos** — ejecuta la suite de tests sobre todos los endpoints:

```bash
npm test
```

Resultado esperado: todos los tests en verde. El proceso termina solo (sin Ctrl+C).

**Desarrollo con recarga automática** — arranca el servidor y lo reinicia al guardar cambios:

```bash
npm run dev
```

Útil durante el desarrollo: evita tener que parar y volver a arrancar manualmente.

---

## Relacion con el dashboard

El dashboard esta en:

```txt
/Users/edefrutos/Desktop/EDF-Lab-Educativo/dashboard
```

Actualmente consume:

```txt
GET /health
GET /
GET /users
```

La API ya tiene endpoints adicionales para futuras misiones:

- mostrar `/about`,
- mostrar `/time`,
- crear formularios para `POST /users`,
- editar usuarios con `PUT /users/:id`,
- eliminar usuarios con `DELETE /users/:id`.
