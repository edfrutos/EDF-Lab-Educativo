# Arquitectura del laboratorio

Este laboratorio separa backend y frontend para mostrar una arquitectura web habitual.

```txt
dashboard/                  api/
HTML + CSS + JS vanilla ->  Express
fetch() -> peticiones HTTP  rutas GET
renderizado <- JSON         respuestas JSON
```

## Flujo completo

```txt
Navegador
  ↓ abre
dashboard/index.html
  ↓ carga
dashboard/app.js
  ↓ hace fetch()
http://localhost:3100
  ↓ responde
api/index.js
  ↓ devuelve
JSON
  ↓ se transforma en
estado visual, métricas y tabla
```

## Backend

La carpeta `api/` contiene un servidor Express que:

- escucha en un puerto HTTP,
- expone rutas de lectura y escritura como `GET /users`, `POST /users`, `PUT /users/:id` y `DELETE /users/:id`,
- devuelve datos en formato JSON,
- habilita `cors()` para permitir peticiones desde otro origen.

Su responsabilidad en este laboratorio es **servir datos y explicar cómo responde una API**.

## Frontend

La carpeta `dashboard/` contiene una página estática que:

- se sirve por separado con `python3 -m http.server`,
- llama a la API con `fetch()`,
- interpreta las respuestas JSON,
- representa el resultado en la interfaz.

Su responsabilidad en este laboratorio es **consumir datos y hacer visible el flujo de información**.

## Contrato entre ambas partes

El laboratorio funciona porque backend y frontend comparten un contrato simple:

- la API publica endpoints HTTP,
- el dashboard conoce la URL base de la API,
- las respuestas llegan como JSON,
- la interfaz espera claves concretas como `status`, `timestamp`, `message`, `version`, `id`, `name` y `email`.

## Por qué separarlos

Porque permite aprender de forma clara:

- qué responsabilidad tiene el backend,
- qué responsabilidad tiene el frontend,
- cómo se comunican,
- qué problemas aparecen en la frontera entre ambos.

## Qué problemas aparecen en esa frontera

Al separar ambas partes aparecen conceptos reales de desarrollo web:

- puertos distintos,
- CORS,
- errores de conexión,
- contratos JSON entre cliente y servidor,
- estados de carga y error en la interfaz.
