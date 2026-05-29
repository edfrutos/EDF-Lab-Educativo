# OpenAPI: el contrato formal de una API

Ya conoces los endpoints de esta API. Los has arrancado, los has llamado con `curl` y has visto sus respuestas JSON. Este documento muestra cómo se describe ese contrato de forma formal, en un fichero que pueden leer tanto humanos como herramientas.

---

## ¿Qué es OpenAPI?

OpenAPI es un estándar abierto para describir APIs HTTP en formato YAML o JSON. No es código que se ejecuta — es un documento que se lee.

Piensa en él como un contrato legal, pero legible por personas y por máquinas: cualquier desarrollador puede abrir el fichero y saber exactamente qué endpoints existen, qué parámetros aceptan, qué respuestas devuelven y qué significa cada campo.

La versión actual del estándar es OpenAPI 3.0.3, que es la que usa este laboratorio. Herramientas como Swagger Editor, Postman o Stoplight entienden este formato y pueden convertirlo en una interfaz interactiva sin que escribas una sola línea de código extra.

---

## Estructura del fichero openapi.yaml

El fichero `api/openapi.yaml` del laboratorio tiene esta forma general:

```
openapi.yaml
├── openapi: "3.0.3"     ← versión del estándar
├── info                  ← metadatos del proyecto (título, versión)
├── servers               ← dónde escucha la API (localhost:3100)
├── paths                 ← aquí están los endpoints
│   ├── /
│   │   └── get           ← GET /
│   ├── /health
│   │   └── get           ← GET /health
│   ├── /users
│   │   ├── get           ← GET /users
│   │   └── post          ← POST /users
│   ├── /users/{id}
│   │   ├── get           ← GET /users/:id
│   │   ├── put           ← PUT /users/:id
│   │   └── delete        ← DELETE /users/:id
│   ├── /about
│   │   └── get           ← GET /about
│   └── /time
│       └── get           ← GET /time
└── components
    └── schemas           ← tipos reutilizables (User, UserInput, Error)
```

Cada sección tiene un propósito concreto:

- **`openapi`** — declara la versión del estándar. Las herramientas la usan para saber qué sintaxis esperar.
- **`info`** — nombre, descripción y versión del proyecto. Solo informativo.
- **`servers`** — lista de URLs donde corre la API. En este lab es `http://localhost:3100`.
- **`paths`** — el corazón de la spec. Cada clave es una ruta (`/users`, `/users/{id}`…) y dentro van los métodos HTTP y sus detalles.
- **`components/schemas`** — tipos de datos reutilizables. En lugar de repetir la estructura de `User` en cada endpoint, se define una vez aquí y se referencia con `$ref`.

---

## Cómo leer un path en la spec

Cada operación dentro de `paths` puede tener:

- **`summary`** — descripción breve en una línea. Aparece como título en Swagger Editor.
- **`parameters`** — lista de parámetros (en la ruta, en la query, en las cabeceras). Cada uno dice su nombre, dónde va y su tipo.
- **`requestBody`** — el cuerpo JSON que espera la petición (solo en POST y PUT).
- **`responses`** — los posibles códigos HTTP y el schema del cuerpo de respuesta.
- **`$ref`** — referencia a un schema definido en `components/schemas`. Evita repetir la misma estructura varias veces.

### Ejemplo: GET /users/{id}

Este es el fragmento del fichero `api/openapi.yaml` que describe `GET /users/:id`:

```yaml
/users/{id}:
  get:
    summary: Obtener un usuario por ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
          example: 1
    responses:
      "200":
        description: Usuario encontrado
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/User"
      "400":
        description: ID inválido (no es un número entero positivo)
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: 'El parámetro ":id" debe ser un número entero.'
      "404":
        description: Usuario no encontrado
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: "Usuario no encontrado."
```

Fíjate en tres cosas:

1. **`in: path`** — indica que `id` va en la URL, no en el body ni en la query.
2. **`$ref: "#/components/schemas/User"`** — reutiliza el schema `User` definido en `components`. No hay que repetir los campos `id`, `name` y `email` aquí.
3. **Los ejemplos de error** — son los mismos mensajes literales que devuelve `api/index.js`. Si cambia el código, hay que actualizar la spec.

---

## Por qué existe un contrato formal

| Situación | Sin contrato (solo README) | Con contrato OpenAPI |
|-----------|---------------------------|----------------------|
| Otro desarrollador pregunta qué devuelve `POST /users` con error | Lee el README (si existe y está actualizado) | Lee la spec — siempre sincronizada con el código |
| Quieres probar la API en un cliente visual | Configuras manualmente cada endpoint | Importas el YAML en Swagger Editor o Postman |
| El cliente del frontend pide saber los campos exactos | Le mandas el código fuente | Le mandas `openapi.yaml` |
| Hay tres códigos de error posibles para un endpoint | Hay que buscarlos en el código | Están documentados en `responses` con ejemplos |

El contrato no reemplaza al código — es su documentación exacta. Cuando el código y la spec divergen, el alumno aprende información errónea. Por eso los ejemplos de esta spec se han copiado literalmente de `api/index.js`.

---

## Cómo usar Swagger Editor online

Swagger Editor es una herramienta web gratuita que convierte un fichero YAML en una interfaz interactiva. No necesitas instalar nada.

```bash
# Abre en el navegador:
# https://editor.swagger.io

# Copia el contenido de api/openapi.yaml y pégalo en el panel izquierdo
# O usa File → Import File para cargar el fichero directamente
```

Lo que verás:

- **Panel izquierdo** — el YAML con resaltado de sintaxis y detección de errores.
- **Panel derecho** — la interfaz interactiva con los 9 endpoints del lab agrupados por recurso.
- **Cada endpoint** — tiene un botón "Try it out" que permite hacer peticiones reales contra tu API local si está corriendo en `localhost:3100`.

Si hay errores en el YAML (indentación incorrecta, `$ref` que no existe), el panel izquierdo los marca en rojo. Es la forma más rápida de validar que la spec es correcta.

---

## Resumen

OpenAPI es la forma estándar de documentar un contrato HTTP. En lugar de un README que puede quedarse desactualizado, el fichero `api/openapi.yaml` describe con precisión todos los endpoints que ya conoces: qué aceptan, qué devuelven y qué errores pueden producir.

Para explorarlo de forma interactiva, pégalo en Swagger Editor y observa cómo los campos del YAML se corresponden con los comportamientos reales de la API.

**Misión 08: explorar-openapi** → [`missions/08-explorar-openapi.md`](../missions/08-explorar-openapi.md)
