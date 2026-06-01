# Misión 11: arrancar con Docker Compose

## Objetivo

Arrancar el stack Compose (API + dashboard), verificar CRUD end-to-end, reiniciar el stack y confirmar persistencia tras el reinicio.

> **v1.3:** El stack Compose incluye **PostgreSQL** como almacén runtime de la API. Esta misión sigue enseñando el flujo Compose y el bind mount `./api/data`. Para persistencia en Postgres y verificación con **`psql`**, usa [Misión 12](12-postgres-compose-crud.md).

## Pasos

1. **Libera los puertos 3100 y 5173.** Para servidores host y contenedores previos:

   ```bash
   # Desde la raíz del repo
   npm run compose:down
   docker stop edf-lab-api 2>/dev/null || true
   # Si tenías npm start o python3 -m http.server, páralos con Ctrl+C
   ```

2. **Arranca el stack** desde la raíz del repositorio:

   ```bash
   npm run compose:up
   ```

   Espera a ver logs de API y nginx. Equivalente: `docker compose up --build`.

3. **Abre el dashboard** en el navegador:

   ```txt
   http://localhost:5173
   ```

   Comprueba que el estado de la API aparece como conectado (health OK).

4. **Crea un usuario** — con el formulario del dashboard o con curl:

   ```bash
   curl -s -X POST http://localhost:3100/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Alumno Compose","email":"compose@example.com"}'
   ```

5. **Inspecciona SQLite en el host** (el bind mount hace visible el archivo):

   ```bash
   sqlite3 api/data/users.db "SELECT id, name, email FROM users WHERE email='compose@example.com';"
   ```

   Debes ver la fila creada en el paso 4.

6. **Reinicia el stack** (sin borrar volúmenes):

   ```bash
   npm run compose:down
   npm run compose:up
   ```

7. **Verifica persistencia** vía API:

   ```bash
   curl -s http://localhost:3100/users
   ```

   `Alumno Compose` debe seguir en la lista.

8. **Opcional — logs del stack:**

   ```bash
   npm run compose:logs
   ```

## Resultado esperado

- El dashboard en `:5173` consume la API en `:3100` y puedes crear usuarios.
- Tras el ciclo `compose:down` → `compose:up` del paso 6, el usuario del paso 4 **sigue presente**.
- `api/data/users.db` en tu Mac contiene los datos — no solo dentro del contenedor.

**Contraste con Misión 09:** allí un contenedor único **sin volumen** pierde los datos al pararse. Compose con bind mount **persiste** igual que `npm start` en el host.

## Reto extra

1. En una terminal, arranca la API en el host: `cd api && PORT=3100 npm start`.
2. En otra, intenta `npm run compose:up` desde la raíz.
3. Observa `EADDRINUSE` en el puerto 3100. Consulta [`NOTEBOOK.md`](../NOTEBOOK.md) para la solución.

Lectura complementaria: [`docs/14-docker-compose.md`](../docs/14-docker-compose.md).
