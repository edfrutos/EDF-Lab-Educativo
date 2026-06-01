# PostgreSQL en el laboratorio

A partir de **v1.3**, la API puede guardar usuarios en **PostgreSQL** — un motor cliente-servidor — cuando defines la variable de entorno `DATABASE_URL`. Sin esa variable, el comportamiento por defecto sigue siendo **SQLite** en `api/data/users.db` (ideal para `npm start` en el host).

Este capítulo explica la cadena de conexión, el esquema, el código en `api/` y cómo inspeccionar y persistir datos con Compose.

> Si vienes de SQLite, lee primero [`13-sqlite.md`](./13-sqlite.md) (incluye la sección [Hacia PostgreSQL](./13-sqlite.md#hacia-postgresql)) y luego vuelve aquí para el recorrido completo.

---

## ¿Qué cambia respecto a SQLite?

| Aspecto | SQLite (`npm start` sin env) | PostgreSQL (`DATABASE_URL` / Compose) |
|---------|------------------------------|----------------------------------------|
| Proceso | Ninguno aparte de Node | Servidor Postgres en contenedor o en el Mac |
| Almacén | Archivo `users.db` | Base de datos `edf_lab` en el servidor |
| En Compose | Bind mount solo para `users.json` | Volumen nombrado `postgres_data` |
| Cliente Node | `node:sqlite` (built-in) | Paquete `pg` + Pool |
| Inspección | `sqlite3` CLI | `psql` CLI |

La API y el dashboard **no cambian de contrato HTTP**: mismos endpoints, mismos JSON, mismos códigos 409 para email duplicado.

---

## Cadena de conexión (`DATABASE_URL`)

En Docker Compose, la API recibe:

```txt
postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
```

Desglose:

| Parte | Valor en el lab | Significado |
|-------|-----------------|-------------|
| Usuario | `edf_lab` | Rol de conexión |
| Contraseña | `edf_lab_dev` | Credencial ficticia de laboratorio |
| Host | `edf-lab-postgres` | Nombre del servicio en la red Compose |
| Puerto | `5432` | Puerto estándar de Postgres |
| Base de datos | `edf_lab` | BD de desarrollo del stack |

Desde tu Mac (fuera de la red Docker), el mismo servidor se alcanza en `localhost:5432`:

```bash
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab
```

> **No uses estas credenciales en producción.** Solo sirven para aprender en local.

El router en `api/db.js` elige el backend:

```javascript
// Sin DATABASE_URL → db-sqlite.js
// Con DATABASE_URL    → db-pg.js
```

---

## Esquema: `api/schema.pg.sql`

PostgreSQL usa `SERIAL` en lugar de `AUTOINCREMENT` de SQLite, pero las columnas visibles para el dashboard son las mismas:

```sql
CREATE TABLE IF NOT EXISTS users (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

Al arrancar, `initDb()` en `db-pg.js` ejecuta este archivo contra el Pool. Si la tabla está vacía, **`api/seed.js`** inserta los mismos usuarios que en SQLite (desde `users.json` o semilla por defecto) y ajusta la secuencia con `setval` para que los siguientes `INSERT` sin `id` sigan la numeración correcta.

---

## Código en la API

| Archivo | Rol |
|---------|-----|
| `api/db.js` | Router: `DATABASE_URL` → Postgres, si no → SQLite |
| `api/db-pg.js` | Pool `pg`, CRUD con `$1`, `$2`, … |
| `api/db-sqlite.js` | SQLite con `node:sqlite` |
| `api/seed.js` | `populateIfEmpty` compartido (mensajes de migración idénticos) |

Al arrancar con Postgres verás en consola:

```txt
[db] Using PostgreSQL
Migrados 2 usuarios desde users.json
```

(solo si la tabla estaba vacía y existía `users.json` válido).

Consultas parametrizadas (nunca concatenar strings de usuario):

```javascript
await pool.query(
  'SELECT id, name, email FROM users WHERE id = $1',
  [id]
);
```

---

## Inspección con `psql`

Instala el cliente si no lo tienes (`brew install libpq` en macOS; el binario suele llamarse `psql`).

Listar usuarios:

```bash
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab \
  -c "SELECT id, name, email FROM users ORDER BY name;"
```

Modo interactivo:

```bash
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab
# edf_lab=# SELECT * FROM users;
# edf_lab=# \q
```

---

## Arranque con Docker Compose

Desde la **raíz del repositorio**:

```bash
npm run compose:up
```

El stack levanta **tres** servicios:

1. **`edf-lab-postgres`** — Postgres 16 Alpine, puerto 5432, volumen `postgres_data`
2. **`edf-lab-api`** — Express con `DATABASE_URL` apuntando al servicio postgres
3. **`edf-lab-dashboard`** — nginx en 5173

Comprueba que los tres están en marcha:

```bash
docker compose ps
```

Abre el dashboard: `http://localhost:5173` — la API en `http://localhost:3100` ya usa Postgres como almacén runtime.

Detalle del YAML y redes: [`14-docker-compose.md`](./14-docker-compose.md).

---

## Persistencia: volumen nombrado

Los datos de Postgres viven en el volumen Docker **`postgres_data`**, no en `api/data/users.db`.

```bash
# Crear usuario vía API
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alumno PG","email":"pg@example.com"}'

# Verificar en Postgres
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab \
  -c "SELECT id, name, email FROM users WHERE email='pg@example.com';"

# Reiniciar stack sin borrar volúmenes
npm run compose:down
npm run compose:up

curl -s http://localhost:3100/users
# El usuario debe seguir en el JSON
```

`compose:down` **sin** `-v` conserva `postgres_data`. Eso es lo que diferencia persistencia real en servidor frente a un contenedor efímero sin volumen.

El bind mount `./api/data` en la API sigue existiendo para que `users.json` esté disponible como **semilla**, no como almacén principal en modo Postgres.

---

## Tests automáticos

Los tests de Postgres usan una base **aislada** `edf_lab_test`, nunca `edf_lab` de desarrollo.

```bash
# Postgres debe estar en marcha
docker compose up -d edf-lab-postgres

# Crear BD de test (una vez)
npm run test:db:prepare

# Suite completa: 16 SQLite + 16 Postgres
cd api && npm test

# Solo Postgres
npm run test:pg
```

Variable opcional:

```bash
TEST_DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_test npm run test:pg --prefix api
```

Más contexto: sección [Hacia PostgreSQL](./13-sqlite.md#hacia-postgresql) en el doc de SQLite.

---

## Tres modos de arranque (resumen)

| Modo | Comando | Almacén runtime |
|------|---------|-----------------|
| Host | `npm start` + `python3 -m http.server` | SQLite (`users.db`) |
| Compose v1.3 | `npm run compose:up` | PostgreSQL (`edf_lab`) |
| Tests PG | `npm run test:pg` | PostgreSQL (`edf_lab_test`) |

---

## Enlaces

- **Misión 12** — recorrido guiado Compose + Postgres: [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md)
- **Compose (tres servicios)** — [`14-docker-compose.md`](./14-docker-compose.md)
- **SQLite y evolución** — [`13-sqlite.md`](./13-sqlite.md)
- **Tests** — [`10-tests.md`](./10-tests.md), [`api/README.md`](../api/README.md)
- **Errores reales** — [`NOTEBOOK.md`](../NOTEBOOK.md)
