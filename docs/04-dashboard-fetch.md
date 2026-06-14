# Dashboard y Fetch API

El dashboard está en `dashboard/`.

## Sesión antes del CRUD

Las rutas `/users` exigen **login de operador**. La página muestra un formulario de inicio de sesión; tras `POST /auth/login` correcto, el panel carga health, metadatos y la tabla de usuarios.

Todas las peticiones autenticadas usan `fetchJson`, que incluye **`credentials: 'include'`** para enviar la cookie `edf_session`. Sin eso, verías 401 aunque la API esté en marcha.

Guía completa: [`17-autenticacion.md`](./17-autenticacion.md).

## Función principal

`app.js` llama a la API con `fetch()`:

```js
const response = await fetch(url);
const data = await response.json();
```

Cuando solo se lee información, `fetch()` usa `GET` por defecto:

```js
const users = await fetchJson('/users');
```

Cuando se quiere cambiar información, el navegador debe indicar el método HTTP y, si envía JSON, también el tipo de contenido.

## Crear un usuario: POST /users

El formulario del dashboard recoge `name` y `email` y los envía como JSON:

```js
await fetchJson('/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Ada Lovelace',
    email: 'ada@example.com'
  })
});
```

Feedback visible en el dashboard:

```txt
POST /users -> usuario creado
```

## Editar un usuario: PUT /users/:id

Al pulsar `Editar`, el dashboard carga los datos de esa fila en el mismo formulario. Al guardar, se envía el usuario actualizado:

```js
await fetchJson('/users/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Ada Byron',
    email: 'ada.byron@example.com'
  })
});
```

Feedback visible en el dashboard:

```txt
PUT /users/:id -> usuario actualizado
```

## Eliminar un usuario: DELETE /users/:id

Antes de borrar, el dashboard usa una confirmación nativa del navegador. Si se acepta, manda una petición `DELETE`:

```js
await fetchJson('/users/1', {
  method: 'DELETE'
});
```

Feedback visible en el dashboard:

```txt
DELETE /users/:id -> usuario eliminado
```

## Qué demuestra

- El frontend no tiene datos propios.
- Pide datos al backend.
- Recibe JSON.
- Convierte JSON en HTML.
- También puede crear, editar y eliminar datos si usa el método HTTP adecuado.

## Estados importantes

- Cargando.
- Sin sesión / formulario de login.
- API conectada.
- API no disponible.
- Datos recibidos.
- Operación completada.
- Error al crear, editar o eliminar.
- Credenciales inválidas (login).

Para la misma API con React o Vue (estado y formularios con otro enfoque), ver [`16-frameworks.md`](./16-frameworks.md) *(avanzado, opcional)*.
