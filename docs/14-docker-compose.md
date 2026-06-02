# Docker Compose: orquestar API, dashboard y PostgreSQL

¿Ya conoces un contenedor Docker con la [Misión 09](../missions/09-arrancar-con-docker.md)? Bien. **Docker Compose** arranca **varios contenedores** con un solo comando desde la raíz del repositorio: **PostgreSQL** + API Express + dashboard nginx.

En **v1.3**, el stack Compose usa Postgres como almacén runtime de la API (`DATABASE_URL`). El desarrollo en host con `npm start` **sin** esa variable sigue usando SQLite en `api/data/users.db`.

El camino principal de aprendizaje sigue siendo `npm start` + `python3 -m http.server`. Compose es la ruta **avanzada opcional** cuando quieres practicar orquestación multi-contenedor y persistencia cliente-servidor.

> Profundizar en Postgres: [`docs/15-postgresql.md`](./15-postgresql.md). Misión guiada Postgres: [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md). La [Misión 11](../missions/11-arrancar-con-compose.md) sigue siendo válida para entender el bind mount y el flujo CRUD; en v1.3 la persistencia principal del stack es el volumen `postgres_data`.

> Contraste rápido con contenedor único: [`docs/12-docker.md`](./12-docker.md) — tabla de tres modos de arranque (host / `docker run` / Compose).

> **Secretos y despliegue en producción (v1.5):** la API lee `api/.env` vía `env_file` en Compose. Guía completa: [`docs/18-production-deploy.md`](./18-production-deploy.md).

---

## ¿Qué es Docker Compose?

Compose es una herramienta que lee un archivo YAML (`docker-compose.yml`) y crea, arranca y conecta varios contenedores como un **stack** coherente.

| Concepto | Un contenedor (Misión 09) | Compose v1.2 (2 servicios) | Compose v1.3 (este doc) |
|----------|---------------------------|------------------------------|-------------------------|
| Comando | `docker run …` | `docker compose up` | `docker compose up` |
| Servicios | Solo API | API + dashboard | **Postgres** + API + dashboard |
| Datos runtime | Efímeros (sin volumen) | SQLite (bind mount) | PostgreSQL (volumen `postgres_data`) |
| Archivo clave | `api/Dockerfile` | `docker-compose.yml` | `docker-compose.yml` |

---

## Arquitectura del stack

El navegador corre en tu Mac (host). Los contenedores publican puertos al host; el dashboard llama a la API con `fetch()` usando URLs absolutas:

```txt
[Navegador en localhost]
        |
        |  http://localhost:5173
        v
[Contenedor edf-lab-dashboard]
   nginx:alpine → index.html, app.js, styles.css
        |
        |  fetch('http://localhost:3100/...')
        v
[Contenedor edf-lab-api]
   Node.js 22 → api/index.js
   DATABASE_URL → postgresql://...@edf-lab-postgres:5432/edf_lab
        |
        |  bind mount ./api/data (users.json semilla)
        v
[Contenedor edf-lab-postgres]
   postgres:16-alpine → volumen postgres_data
        |
        v
[Datos en volumen Docker postgres_data]
```

Puertos publicados (igual que en desarrollo local):

- Dashboard: **5173**
- API: **3100**
- PostgreSQL: **5432** (para `psql` desde el host)

---

## Servicios en `docker-compose.yml`

El stack completo vive en la raíz del repo:

```yaml
services:
  edf-lab-postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: edf_lab
      POSTGRES_PASSWORD: edf_lab_dev
      POSTGRES_DB: edf_lab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edf_lab -d edf_lab"]
      interval: 5s
      timeout: 5s
      retries: 5

  edf-lab-api:
    build: ./api
    ports:
      - "3100:3100"
    environment:
      DATABASE_URL: postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
    volumes:
      - ./api/data:/usr/src/app/data
    depends_on:
      edf-lab-postgres:
        condition: service_healthy

  edf-lab-dashboard:
    build: ./dashboard
    ports:
      - "5173:5173"
    depends_on:
      - edf-lab-api

volumes:
  postgres_data:
```

### `edf-lab-postgres`

- **`image: postgres:16-alpine`** — servidor Postgres sin Dockerfile propio.
- **`environment`** — usuario `edf_lab`, contraseña `edf_lab_dev`, base `edf_lab` (credenciales de laboratorio).
- **`volumes: postgres_data`** — datos persistentes en volumen nombrado Docker.
- **`healthcheck`** — la API no arranca hasta que Postgres acepta conexiones.

### `edf-lab-api`

- **`build: ./api`** — construye la imagen con el `Dockerfile` existente (Node 22, `npm ci`, `node index.js`).
- **`ports: "3100:3100"`** — publica la API en el host.
- **`environment: DATABASE_URL`** — activa `db-pg.js`; en logs verás `[db] Using PostgreSQL`.
- **`volumes`** — bind mount de `./api/data` para `users.json` (semilla), no como almacén principal en Compose.
- **`depends_on`** — espera a que `edf-lab-postgres` esté healthy.

### `edf-lab-dashboard`

- **`build: ./dashboard`** — imagen nginx con los ficheros estáticos (`index.html`, `app.js`, `styles.css`).
- **`ports: "5173:5173"`** — mismo puerto que `python3 -m http.server 5173`.
- **`depends_on: edf-lab-api`** — Compose arranca la API (y Postgres) antes que el dashboard.

El dashboard **no** monta volúmenes: solo sirve ficheros estáticos copiados en la imagen.

---

## Redes

Compose crea una **red interna** por defecto. Los servicios pueden resolverse por nombre (`edf-lab-api`) dentro de esa red.

En este laboratorio el navegador **no** usa esos nombres. `dashboard/app.js` tiene:

```javascript
const API_BASE_URL = 'http://localhost:3100';
```

El fetch sale del navegador (host) hacia el puerto **publicado** 3100. Por eso no necesitas configurar un proxy inverso en nginx para el flujo básico — aunque es un reto avanzado interesante (ver final del doc).

`cors()` en la API ya permite peticiones desde `http://localhost:5173`.

---

## Volúmenes: dos tipos en el stack

### Volumen nombrado `postgres_data` (Postgres)

```yaml
volumes:
  postgres_data:
```

Los datos de la tabla `users` en modo Compose viven aquí. Sobreviven a `docker compose down` **sin** `-v`.

### Bind mount en la API (`./api/data`)

```yaml
volumes:
  - ./api/data:/usr/src/app/data
```

Significado:

- **Host (izquierda):** `./api/data` — carpeta con `users.json` (y `users.db` si desarrollas en host con SQLite).
- **Contenedor (derecha):** `/usr/src/app/data` — ruta por defecto de `DB_FILE` en modo SQLite.
- **En Compose con `DATABASE_URL`:** el runtime CRUD usa Postgres; el bind mount sigue útil para la **semilla** `users.json` al arrancar con tabla vacía.

El dashboard no necesita volumen: no guarda estado.

| Almacén | Mecanismo | ¿Dónde inspeccionar? |
|---------|-----------|------------------------|
| Postgres (Compose) | `postgres_data` | `psql` → ver [`15-postgresql.md`](./15-postgresql.md) |
| SQLite (host `npm start`) | archivo `users.db` | `sqlite3` → ver [`13-sqlite.md`](./13-sqlite.md) |

---

## Flujo ejecutable

Desde la **raíz del repositorio** (no desde `api/`):

```bash
# 1. Arrancar el stack (construye imágenes si hace falta)
npm run compose:up
# equivalente: docker compose up --build

# 2. Verificar la API
curl http://localhost:3100/health

# 3. Abrir el dashboard
# http://localhost:5173

# 4. Crear un usuario (curl de ejemplo)
curl -X POST http://localhost:3100/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Compose User","email":"compose@example.com"}'

# 5. Comprobar en Postgres (almacén runtime en Compose)
psql postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab \
  -c "SELECT id, name, email FROM users WHERE email='compose@example.com';"

# 5b. (Opcional) Si desarrollas en host con SQLite, el bind mount sigue siendo users.db:
# sqlite3 api/data/users.db "SELECT ..."

# 6. Parar el stack (Ctrl+C en la terminal de compose:up, o en otra terminal)
npm run compose:down

# 7. Volver a arrancar — los datos persisten
npm run compose:up

curl -s http://localhost:3100/users
# "Compose User" debe seguir en la lista
```

Scripts auxiliares en el `package.json` raíz:

| Script | Acción |
|--------|--------|
| `npm run compose:up` | `docker compose up --build` |
| `npm run compose:down` | `docker compose down` |
| `npm run compose:logs` | `docker compose logs -f` |

**Importante:** `compose:down` **sin** `-v` conserva el volumen `postgres_data`. Los usuarios creados en Compose siguen en Postgres tras reiniciar el stack.

Revisa los logs de la API al arrancar: debe aparecer `[db] Using PostgreSQL`.

---

## Tres modos de arranque

La tabla canónica está en [`docs/12-docker.md`](./12-docker.md). Resumen actualizado:

| Modo | Comando | Almacén runtime |
|------|---------|-----------------|
| Host | `npm start` + `python3 -m http.server` | SQLite (`users.db`) |
| Contenedor único | `npm run docker:start` (Misión 09) | Efímero |
| Compose v1.3 | `npm run compose:up` | PostgreSQL (`postgres_data`) |

---

## Reto avanzado: proxy inverso nginx (solo concepto)

Hoy el dashboard llama a `http://localhost:3100` directamente. Una arquitectura alternativa:

```txt
Navegador → localhost:5173 → nginx → /api/* → edf-lab-api:3100
```

Ventajas: un solo origen para el navegador, URLs relativas (`/api/users`), menos fricción CORS en despliegues reales.

**En este lab no está implementado** — es material de reflexión. Requeriría cambiar `dashboard/nginx.conf`, `dashboard/app.js` y posiblemente CORS. Si lo intentas, documenta el experimento en [`NOTEBOOK.md`](../NOTEBOOK.md).

---

## Enlaces

- **Misión 12** — Postgres + Compose + `psql`: [`missions/12-postgres-compose-crud.md`](../missions/12-postgres-compose-crud.md)
- **Misión 11** — flujo Compose y bind mount: [`missions/11-arrancar-con-compose.md`](../missions/11-arrancar-con-compose.md)
- **PostgreSQL** — [`docs/15-postgresql.md`](./15-postgresql.md)
- **Docker contenedor único** — [`docs/12-docker.md`](./12-docker.md), [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md)
- **SQLite** — [`docs/13-sqlite.md`](./13-sqlite.md)
- **README** — sección *Opcional: Docker Compose*
