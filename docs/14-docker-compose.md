# Docker Compose: orquestar API y dashboard

¿Ya conoces un contenedor Docker con la [Misión 09](../missions/09-arrancar-con-docker.md)? Bien. **Docker Compose** arranca **varios contenedores** con un solo comando desde la raíz del repositorio: API Express + dashboard nginx.

El camino principal de aprendizaje sigue siendo `npm start` + `python3 -m http.server`. Compose es la ruta **avanzada opcional** cuando quieres practicar orquestación multi-contenedor.

> Contraste rápido con contenedor único: [`docs/12-docker.md`](./12-docker.md) — tabla de tres modos de arranque (host / `docker run` / Compose).

---

## ¿Qué es Docker Compose?

Compose es una herramienta que lee un archivo YAML (`docker-compose.yml`) y crea, arranca y conecta varios contenedores como un **stack** coherente.

| Concepto | Un contenedor (Misión 09) | Compose (este doc) |
|----------|---------------------------|---------------------|
| Comando | `docker run …` | `docker compose up` |
| Servicios | Solo API | API + dashboard |
| Datos | Efímeros (sin volumen) | SQLite persistente (bind mount) |
| Archivo clave | `api/Dockerfile` | `docker-compose.yml` + Dockerfiles |

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
   Node.js 22 → api/index.js → SQLite users.db
        |
        |  bind mount ./api/data
        v
[Host: api/data/users.db]
```

Puertos publicados (igual que en desarrollo local):

- Dashboard: **5173**
- API: **3100**

---

## Servicios en `docker-compose.yml`

El stack completo vive en la raíz del repo:

```yaml
services:
  edf-lab-api:
    build: ./api
    ports:
      - "3100:3100"
    volumes:
      - ./api/data:/usr/src/app/data

  edf-lab-dashboard:
    build: ./dashboard
    ports:
      - "5173:5173"
    depends_on:
      - edf-lab-api
```

### `edf-lab-api`

- **`build: ./api`** — construye la imagen con el `Dockerfile` existente (Node 22, `npm ci`, `node index.js`).
- **`ports: "3100:3100"`** — publica la API en el host.
- **`volumes`** — bind mount de `./api/data` (ver sección Volúmenes).

### `edf-lab-dashboard`

- **`build: ./dashboard`** — imagen nginx con los ficheros estáticos (`index.html`, `app.js`, `styles.css`).
- **`ports: "5173:5173"`** — mismo puerto que `python3 -m http.server 5173`.
- **`depends_on: edf-lab-api`** — Compose arranca la API antes que el dashboard (sin healthcheck; arranque simple).

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

## Volúmenes: bind mount en la API

Solo el servicio API monta datos:

```yaml
volumes:
  - ./api/data:/usr/src/app/data
```

Significado:

- **Host (izquierda):** `./api/data` — la carpeta que ya conoces con `npm start`.
- **Contenedor (derecha):** `/usr/src/app/data` — ruta por defecto de `DB_FILE` en `api/db.js`.
- **Efecto:** cuando la API escribe `users.db` dentro del contenedor, el archivo aparece en tu Mac en `api/data/users.db`.

El dashboard no necesita volumen: no guarda estado.

Para profundizar en SQLite: [`docs/13-sqlite.md`](./13-sqlite.md).

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

# 5. Comprobar en SQLite en el host (bind mount visible)
sqlite3 api/data/users.db "SELECT id, name, email FROM users WHERE email='compose@example.com';"

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

**Importante:** `compose:down` **sin** `-v` no borra `api/data/users.db` en el host. Eso es la persistencia que diferencia Compose de la Misión 09.

---

## Tres modos de arranque

La tabla canónica está en [`docs/12-docker.md`](./12-docker.md) (sección *Compose con persistencia SQLite*). Resumen:

| Modo | Comando | ¿Persiste `users.db`? |
|------|---------|------------------------|
| Host | `npm start` + `python3 -m http.server` | Sí |
| Contenedor único | `npm run docker:start` (Misión 09) | No — efímero |
| Compose | `npm run compose:up` | Sí — bind mount |

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

- **Misión 11** — recorrido guiado: [`missions/11-arrancar-con-compose.md`](../missions/11-arrancar-con-compose.md)
- **Docker contenedor único** — [`docs/12-docker.md`](./12-docker.md), [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md)
- **SQLite** — [`docs/13-sqlite.md`](./13-sqlite.md)
- **README** — sección *Opcional: Docker Compose*
