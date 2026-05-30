# Misión 06: restart y persistencia

> **Nota v1.1:** Esta misión describe el flujo histórico con **`users.json` como almacén en runtime** (Fase 2, v1.0). En la versión actual la persistencia usa **SQLite** (`api/data/users.db`). Para el recorrido actual sigue **[Misión 10: inspeccionar SQLite](./10-inspeccionar-sqlite.md)**.

## Objetivo

Comprobar que los usuarios creados sobreviven un reinicio de la API, observando que el estado se lee desde `api/data/users.json` al arrancar.

## Pasos

1. Arranca la API si no está en marcha:
   ```bash
   cd api && PORT=3100 npm start
   ```

2. Crea un usuario nuevo:
   ```bash
   curl -s -X POST http://localhost:3100/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Alumno Persistente","email":"persistente@example.com"}'
   ```

3. Abre el archivo y comprueba que el usuario aparece:
   ```bash
   cat api/data/users.json
   ```

4. Para la API con `Ctrl+C`.

5. Vuelve a arrancar la API:
   ```bash
   PORT=3100 npm start
   ```

6. Pide la lista de usuarios:
   ```bash
   curl -s http://localhost:3100/users
   ```

## Resultado esperado

El usuario `Alumno Persistente` sigue presente en la respuesta aunque la API se ha reiniciado. El archivo `api/data/users.json` conserva el estado entre sesiones.

## Reto extra

Crea tres usuarios distintos, reinicia la API y comprueba que los tres aparecen en `GET /users`. Después borra uno con `DELETE /users/:id` y reinicia de nuevo — comprueba que solo quedan dos.
