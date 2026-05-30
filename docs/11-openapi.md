# OpenAPI: el contrato formal de una API

Ya conoces los endpoints de esta API. Este documento muestra cómo se describe ese contrato de forma formal.

---

## ¿Qué es OpenAPI?

OpenAPI es un estándar para describir APIs HTTP en YAML o JSON. No es código que se ejecuta — es un documento que se lee.

Piensa en él como un contrato: define qué rutas existen, qué datos acepta cada una y qué respuestas devuelve. Las personas lo leen para entender la API; las herramientas lo leen para generar clientes, documentación interactiva o validaciones.

---

## Estructura del fichero openapi.yaml

```
openapi.yaml
├── openapi: "3.0.3"   ← versión del estándar
├── info                ← metadatos (título, versión del proyecto)
├── servers             ← dónde escucha la API
├── paths               ← aquí están los endpoints
│   ├── /users
│   │   ├── get         ← GET /users
│   │   └── post        ← POST /users
│   └── /users/{id}
│       ├── get
│       ├── put
│       └── delete
└── components
    └── schemas         ← tipos reutilizables (User, UserInput, Error)
```

- **openapi** — versión del estándar OpenAPI (3.0.3 en este lab).
- **info** — título, descripción y versión del proyecto.
- **servers** — URL base donde escucha la API (`http://localhost:3100`).
- **paths** — cada ruta HTTP con sus métodos, parámetros, cuerpos y respuestas.
- **components/schemas** — tipos reutilizables referenciados con `$ref`.

---

## Cómo leer un path en la spec

Cada operación en `paths` puede incluir:

- **parameters** — valores en la ruta, query o cabeceras.
- **requestBody** — JSON que envía el cliente (POST, PUT).
- **responses** — códigos HTTP posibles con su schema.
- **$ref** — referencia a un schema en `components` (evita repetir definiciones).

### Ejemplo: GET /users/{id}

```yaml
/users/{id}:
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: integer
  get:
    summary: Obtener un usuario por ID
    responses:
      "200":
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/User"
      "400":
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: El parámetro ":id" debe ser un número entero.
      "404":
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Error"
            example:
              error: Usuario no encontrado.
```

---

## Por qué existe un contrato formal

| Situación | Sin contrato (solo README) | Con contrato OpenAPI |
|-----------|---------------------------|----------------------|
| Otro desarrollador pregunta qué devuelve POST /users con error | Lee el README (si existe y está actualizado) | Lee la spec — estructura clara por código HTTP |
| Quieres probar la API en un cliente visual | Configuras manualmente cada endpoint | Importas el YAML en Swagger Editor o Postman |
| El cliente del frontend pide saber los campos exactos | Le mandas el código fuente | Le mandas `openapi.yaml` |

---

## Cómo usar Swagger Editor online

```bash
# Abre en el navegador:
https://editor.swagger.io

# Pega el contenido de api/openapi.yaml
# O usa File → Import File para cargar el fichero directamente
```

En Swagger Editor verás:

- Panel izquierdo con el YAML editable.
- Panel derecho con la UI interactiva generada automáticamente.
- Lista de endpoints colapsable por path.
- Botón **Try it out** para probar peticiones en vivo contra tu API local (si está arrancada en `:3100`).

---

## Resumen

OpenAPI es la forma estándar de documentar un contrato HTTP. El fichero `api/openapi.yaml` de este lab describe todos los endpoints que ya conoces. Para explorarlo interactivamente, ve a la Misión 08.

**Misión 08: explorar-openapi** → [`missions/08-explorar-openapi.md`](../missions/08-explorar-openapi.md)
