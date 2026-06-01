# Misión 12: PostgreSQL con Docker Compose

## Objetivo

Arrancar el stack Compose con **PostgreSQL**, crear un usuario desde el dashboard (o curl), verificar la fila con **`psql`**, reiniciar el stack y confirmar que los datos persisten en el volumen `postgres_data`.

## Pasos

1. **Libera puertos 3100, 5173 y 5432** si hace falta:

   ```bash
   # Desde la raíz del repo
   npm run compose:down
   docker stop edf-lab-api 2>/dev/null || true
   # Páralo también si tenías npm start o python3 -m http.server (Ctrl+C)
   ```

2. **Arranca el stack** desde la raíz:

   ```bash
   npm run compose:up
   ```

   Espera a que Postgres pase el healthcheck, la API muestre `[db] Using PostgreSQL` y nginx sirva el dashboard.

3. **Abre el dashboard:**

   ```txt
   http://localhost:5173
   ```

   Comprueba que la API responde (estado conectado / health OK).

4. **Crea un usuario** — formulario del dashboard o curl:

   ```bash
   curl -s -X POST http://localhost:3100/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Alumno Postgres","email":"pg-lab@example.com"}'
   ```

5. **Verifica en Postgres** (no uses `sqlite3` como prueba principal en este stack):

   ```bash
   psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab \
     -c "SELECT id, name, email FROM users WHERE email='pg-lab@example.com';"
   ```

   Debes ver la fila del paso 4.

6. **Reinicia el stack** sin borrar volúmenes:

   ```bash
   npm run compose:down
   npm run compose:up
   ```

7. **Comprueba persistencia** vía API:

   ```bash
   curl -s http://localhost:3100/users
   ```

   `Alumno Postgres` debe seguir en la lista JSON.

8. **Opcional — tres servicios en marcha:**

   ```bash
   docker compose ps
   ```

## Resultado esperado

- Dashboard en `:5173` consume la API en `:3100` con almacén **PostgreSQL**.
- Tras el ciclo del paso 6, el usuario del paso 4 **sigue presente**.
- Los logs de la API al arrancar incluyen `[db] Using PostgreSQL`.
- `psql` muestra la fila creada; la persistencia vive en `postgres_data`, no en `users.db` como almacén principal.

## Reto extra

Con Postgres en marcha (`docker compose up -d edf-lab-postgres`):

```bash
npm run test:db:prepare
cd api && npm run test:pg
```

Deben pasar 16 tests contra la base aislada `edf_lab_test`.

## Lectura complementaria

- [`docs/15-postgresql.md`](../docs/15-postgresql.md) — conexión, esquema, tests
- [`docs/14-docker-compose.md`](../docs/14-docker-compose.md) — YAML y volúmenes del stack
- [`NOTEBOOK.md`](../NOTEBOOK.md) — errores reales de integración Postgres
