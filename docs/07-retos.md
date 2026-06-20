# Retos educativos

## Reto 1

Añade validación más estricta a:

```txt
POST /users
PUT /users/:id
```

y devuelve mensajes de error más expresivos.

## Reto 2

Haz que el dashboard consuma también:

```txt
GET /about
GET /time
```

y muestre esa información en la interfaz.

## Reto 3

Añade un contador de usuarios en el dashboard.

## Reto 4

Añade un buscador por nombre.

## Reto 5

Rompe CORS, observa el error y vuelve a arreglarlo.

## Reto 6

Crea tests para comprobar:

- `GET /health`,
- `GET /users`,
- `POST /users`,
- `PUT /users/:id`,
- `DELETE /users/:id`.

## Reto 7 *(avanzado, v1.5)*

Completa la misión guiada de autenticación:

- [`missions/14-auth-vanilla-login-crud.md`](../missions/14-auth-vanilla-login-crud.md)

Objetivo: login de operador, CRUD con cookie `edf_session`, inspección en DevTools y logout. Guía conceptual: [`docs/17-autenticacion.md`](./17-autenticacion.md).