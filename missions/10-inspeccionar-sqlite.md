# Misión 10: inspeccionar SQLite

## Objetivo

Inspeccionar la base de datos SQLite del laboratorio, observar la migración automática desde `users.json` y comprobar que los datos persisten tras reiniciar la API.

## Pasos

1. Arranca la API si no está en marcha:

   ```bash
   cd api && PORT=3100 npm start
   ```

2. Lista los usuarios directamente en SQLite (no uses `cat` sobre el `.db` — es binario):

   ```bash
   sqlite3 api/data/users.db "SELECT id, name, email FROM users;"
   ```

   Deberías ver al menos John Doe y Jane Smith si acabas de migrar o usas la semilla.

3. **Cold start — migración desde JSON.** Para la API (`Ctrl+C`), borra la base y arranca de nuevo:

   ```bash
   rm -f api/data/users.db
   PORT=3100 npm start
   ```

   En consola busca:

   ```txt
   Migrados 2 usuarios desde users.json
   ```

4. Crea un usuario nuevo:

   ```bash
   curl -s -X POST http://localhost:3100/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Alumno SQLite","email":"sqlite@example.com"}'
   ```

5. Comprueba que aparece en la base:

   ```bash
   sqlite3 api/data/users.db "SELECT * FROM users WHERE email='sqlite@example.com';"
   ```

6. Para la API (`Ctrl+C`) y vuelve a arrancar:

   ```bash
   PORT=3100 npm start
   ```

7. Verifica persistencia vía API:

   ```bash
   curl -s http://localhost:3100/users
   ```

   El usuario `Alumno SQLite` debe seguir en la lista.

## Resultado esperado

- Has leído filas con `sqlite3` en lugar de abrir JSON con un editor.
- Tras borrar `users.db`, la API recrea la base y migra desde `users.json`.
- Tras crear un usuario y reiniciar, el usuario sigue presente en `GET /users` y en `SELECT` sobre SQLite.

## Reto extra

1. Desde el dashboard (`http://localhost:5173`) o con curl, intenta crear un usuario con email `john@example.com` (ya existente).
2. Observa que la API responde **409** y el dashboard muestra un error de conexión/operación.
3. Confirma con SQL que no hay fila duplicada:

   ```bash
   sqlite3 api/data/users.db "SELECT COUNT(*) FROM users WHERE email='john@example.com';"
   ```

   El resultado debe ser `1`.

Lectura complementaria: [`docs/13-sqlite.md`](../docs/13-sqlite.md).
