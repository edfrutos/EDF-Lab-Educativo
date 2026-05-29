# Misión 08: explorar la spec OpenAPI

## Objetivo

Abrir `api/openapi.yaml` en VS Code y en Swagger Editor online, localizar un endpoint conocido en la spec y relacionar los campos del YAML con el comportamiento real de la API.

## Pasos

1. Abre el fichero en el editor:
   ```bash
   code api/openapi.yaml
   ```
   Observa la estructura: `openapi`, `info`, `servers`, `paths`, `components`. El fichero describe los 9 endpoints que ya conoces, pero en un formato que pueden leer tanto personas como herramientas.

2. Localiza el path `/users` en la sección `paths`. ¿Cuántos métodos tiene definidos? (Pista: busca las claves `get` y `post` dentro de `/users`.)

3. Abre Swagger Editor online en el navegador:
   ```
   https://editor.swagger.io
   ```

4. Copia el contenido completo de `api/openapi.yaml` y pégalo en el panel izquierdo del editor. El panel derecho mostrará automáticamente la interfaz interactiva con los 9 endpoints del lab agrupados por ruta.

5. Localiza `GET /users/{id}` en el panel derecho. Expándelo y observa:
   - El campo `parameters` — el parámetro `id` en la ruta, de tipo `integer`
   - Las tres respuestas posibles: **200**, **400**, **404**
   - Los ejemplos de cada respuesta de error

6. Compara el mensaje de error 400 en la spec con la respuesta real de la API:
   ```bash
   curl http://localhost:3100/users/abc
   ```
   ¿Coincide el mensaje de error con el `example` del campo `error` en la spec?

## Resultado esperado

El panel derecho de Swagger Editor muestra los 9 endpoints del lab organizados por path. Al expandir `GET /users/{id}` ves los tres códigos de respuesta documentados:

- **200** — con el schema `User` (id, name, email)
- **400** — con el ejemplo `El parámetro ":id" debe ser un número entero.`
- **404** — con el ejemplo `Usuario no encontrado.`

La llamada `curl http://localhost:3100/users/abc` devuelve exactamente el mismo mensaje que aparece en el `example` de la respuesta 400 de la spec.

## Reto extra

Localiza en la spec el mensaje de error que devuelve `POST /users` cuando se envía un body sin el campo `name`. Luego compruébalo con curl:

```bash
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

¿El mensaje del `example` en la spec coincide exactamente con la respuesta de la API?
¿Qué ventaja tiene que el contrato y el código estén sincronizados, en lugar de solo tener un README que puede quedarse desactualizado?
