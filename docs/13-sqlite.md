# SQLite en el laboratorio

A partir de la versión **v1.1**, la API guarda los usuarios en una base de datos **SQLite** (`api/data/users.db`), no en un archivo JSON que se reescribe en cada operación. El JSON (`api/data/users.json`) sigue existiendo como **fuente de semilla** cuando la base arranca vacía.

Este capítulo explica qué es SQLite en este proyecto, cómo inspeccionar la base y cuándo tiene sentido frente a un archivo JSON plano.

> Si vienes de la Fase 2 (persistencia en JSON), lee primero [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md) para el contexto memoria vs disco, y luego vuelve aquí para el detalle SQLite.

---

## ¿Qué es SQLite?

SQLite es un motor de base de datos relacional embebido en un **único archivo** (`.db`). No necesitas instalar un servidor aparte: Node.js abre el archivo y ejecuta SQL.

En este laboratorio:

```txt
api/data/users.db   ← almacén en runtime (lecturas/escrituras CRUD)
api/data/users.json ← semilla/migración (solo si la tabla está vacía al arrancar)
api/schema.sql      ← definición legible de la tabla users
api/db.js           ← conexión y consultas SQL
```

---

## El archivo `.db` no es JSON

A diferencia de `users.json`, **`users.db` es binario**. Si haces `cat api/data/users.db` verás caracteres ilegibles. Para ver los datos usa la herramienta `sqlite3` (CLI) o un visor gráfico opcional como [DB Browser for SQLite](https://sqlitebrowser.org/).

```bash
# Desde la raíz del repo, con la API parada o en marcha
sqlite3 api/data/users.db "SELECT id, name, email FROM users;"
```

Resultado esperado (semilla o tras migración):

```txt
1|John Doe|john@example.com
2|Jane Smith|jane@example.com
```

---

## El esquema: `api/schema.sql`

Abre `api/schema.sql` para ver la estructura sin leer JavaScript:

```sql
CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

Conceptos clave:

| Columna | Rol |
|---------|-----|
| `id` | Identificador autoincremental |
| `name` | Nombre obligatorio |
| `email` | Email obligatorio y **único** en toda la tabla |

La restricción **`UNIQUE`** en `email` hace que la base rechace duplicados. La API traduce ese error a **HTTP 409** con el mensaje `Ya existe un usuario con ese email.`

---

## Flujo al arrancar la API

```txt
npm start (PORT=3100)
  │
  ▼
initDb() en api/db.js
  │
  ├── Crea data/ si no existe
  ├── Abre users.db (o ruta en DB_FILE)
  ├── Ejecuta schema.sql (CREATE TABLE IF NOT EXISTS)
  │
  └── ¿Tabla users vacía?
        ├── Sí + users.json válido → INSERT preservando ids
        │         log: "Migrados N usuarios desde users.json"
        ├── Sí + JSON vacío/ausente → semilla John/Jane
        └── Sí + JSON corrupto → [warn] + semilla John/Jane
        └── No (ya hay filas) → no migra (protege datos del alumno)
  │
  ▼
Servidor escucha en :3100
```

### Ejemplo: cold start con migración

```bash
cd api
rm -f data/users.db
PORT=3100 npm start
```

En consola deberías ver:

```txt
Migrados 2 usuarios desde users.json
Servidor arrancado en http://localhost:3100
```

Comprueba con curl:

```bash
curl -s http://localhost:3100/users
```

---

## Consultas que usa la API

En `api/db.js` las operaciones CRUD usan **prepared statements** (consultas preparadas con `?` como marcadores):

| Operación | SQL (simplificado) |
|-----------|-------------------|
| Listar | `SELECT id, name, email FROM users ORDER BY name` |
| Leer uno | `SELECT ... WHERE id = ?` |
| Crear | `INSERT INTO users (name, email) VALUES (?, ?)` |
| Actualizar | `UPDATE users SET name = ?, email = ? WHERE id = ?` |
| Borrar | `DELETE FROM users WHERE id = ?` |

Ejemplo ejecutable — crear y verificar en la base:

```bash
curl -s -X POST http://localhost:3100/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alumno SQLite","email":"sqlite@example.com"}'

sqlite3 api/data/users.db "SELECT * FROM users WHERE email='sqlite@example.com';"
```

---

## Variable de entorno `DB_FILE`

Por defecto la base vive en `api/data/users.db`. Puedes apuntar a otra ruta:

```bash
DB_FILE=/tmp/mi-lab.db PORT=3100 npm start
```

Los tests automáticos usan `data/users.test.db` para no tocar tu base de desarrollo. Detalle en [`10-tests.md`](./10-tests.md).

---

## JSON vs SQLite: cuándo usar cada uno

| Criterio | Archivo JSON | SQLite |
|----------|--------------|--------|
| Datos y procesos | Pocos registros, un solo proceso | Reglas en esquema, consultas SQL |
| Inspección | `cat`, editor de texto | `sqlite3` o visor GUI |
| Reglas (UNIQUE, etc.) | Solo en código de aplicación | En la base (constraints) |
| Concurrencia | Limitada | Mejor preparado (aunque este lab es didáctico) |
| En este repo | **Semilla/migración** | **Runtime** |

Un JSON basta para aprender “guardar en disco”. SQLite entra cuando quieres enseñar **esquema**, **integridad** y el camino hacia bases más grandes (PostgreSQL más adelante).

---

## `node:sqlite` vs `better-sqlite3`

Este laboratorio usa el módulo incorporado **`node:sqlite`** (Node.js 22+), sin dependencias npm extra.

| | `node:sqlite` (este lab) | `better-sqlite3` |
|---|--------------------------|------------------|
| Instalación | Incorporado en Node 22+ | `npm install better-sqlite3` (addon nativo) |
| Dependencias npm | **Cero** | Sí (compilación nativa en algunos entornos) |
| API en este proyecto | `DatabaseSync` (síncrono) | API síncrona muy usada en producción |
| Madurez / aviso | Puede mostrar `ExperimentalWarning` al arrancar | Paquete estable y muy popular |
| Objetivo didáctico | Ver SQL sin añadir paquetes | Comparación documental; no lo implementamos aquí |

**Decisión del proyecto (v1.1):** priorizar cero dependencias nuevas y SQL explícito. En un proyecto real de producción muchos equipos eligen `better-sqlite3` o un ORM; aquí aprendes el concepto con lo que trae Node.

---

## Herramientas de inspección

### CLI `sqlite3` (recomendada)

```bash
# Listar tablas
sqlite3 api/data/users.db ".tables"

# Modo interactivo
sqlite3 api/data/users.db
# sqlite> SELECT * FROM users;
# sqlite> .quit
```

En macOS, si no tienes `sqlite3`: `brew install sqlite`.

### DB Browser for SQLite (opcional)

Interfaz gráfica para abrir `users.db`, ver filas y ejecutar SQL. No es necesaria para completar las misiones del lab.

---

## Persistencia tras reinicio

1. Crea un usuario con curl o desde el dashboard (`http://localhost:5173`).
2. Para la API (`Ctrl+C`) y vuelve a arrancar: `PORT=3100 npm start`.
3. Comprueba que el usuario sigue en `GET /users` y en `sqlite3 ... SELECT`.

Pasos guiados en **[`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md)**.

---

## Hacia PostgreSQL

A partir de **v1.3**, la API puede usar **PostgreSQL** cuando defines `DATABASE_URL` (por ejemplo en Docker Compose). Sin esa variable, el comportamiento de este capítulo sigue siendo SQLite en `users.db`.

| Aspecto | SQLite (host `npm start`) | PostgreSQL (Compose / `DATABASE_URL`) |
|---------|---------------------------|----------------------------------------|
| Almacén | Archivo `api/data/users.db` | Servidor Postgres + volumen nombrado `postgres_data` |
| En Compose | Bind mount `./api/data` (mismo path que en host) | Servicio `edf-lab-postgres`; datos en volumen Docker |
| Semilla | `users.json` si la tabla está vacía | Misma lógica (`api/seed.js`) al arrancar con tabla vacía |
| Tests automáticos | `users.test.db` (archivo aislado) | Base `edf_lab_test` (nunca la BD `edf_lab` de desarrollo) |

**Cuándo usar cada uno en el lab**

- **SQLite:** desarrollo rápido en el Mac, `cd api && npm start`, sin instalar Postgres.
- **PostgreSQL:** stack completo con `npm run compose:up`, persistencia cliente-servidor y preparación para producción real.

### Comandos ejecutables

Arrancar solo Postgres (desde la raíz del repo):

```bash
docker compose up -d edf-lab-postgres
```

Crear la base de datos de tests (una vez, o cuando falte):

```bash
npm run test:db:prepare
```

Inspeccionar datos en la BD de desarrollo:

```bash
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab -c "SELECT id, name, email FROM users;"
```

Suite completa (16 tests SQLite + 16 Postgres). **Postgres debe estar escuchando en `localhost:5432`**; si no, la segunda mitad falla (no hay skip silencioso):

```bash
cd api && npm test
```

Solo tests Postgres:

```bash
npm run test:pg --prefix api
```

Variable opcional para otra URL de test:

```bash
TEST_DATABASE_URL=postgresql://usuario:clave@localhost:5432/otra_bd npm run test:pg --prefix api
```

> Guía completa: [`docs/15-postgresql.md`](./15-postgresql.md). Misión paso a paso: [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md).

---

## Resumen

- **Runtime:** `users.db` con SQL explícito en `db.js` y esquema en `schema.sql`.
- **Semilla:** `users.json` solo cuando la tabla está vacía al arrancar (SQLite y Postgres comparten `api/seed.js`).
- **Inspección:** `sqlite3` CLI; el `.db` no se lee con `cat` como JSON.
- **Duplicados:** constraint `UNIQUE` → API responde 409.
- **PostgreSQL:** ver sección [Hacia PostgreSQL](#hacia-postgresql) y [`api/README.md`](../api/README.md).
- **Tests y docs relacionados:** [`10-tests.md`](./10-tests.md), [`api/README.md`](../api/README.md).
