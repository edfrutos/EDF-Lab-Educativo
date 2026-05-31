# Express API Demo Learning Lab

Laboratorio educativo para aprender, de forma aplicada, cómo funciona una arquitectura web moderna separando un **backend API** y un **frontend consumidor**.

El proyecto está compuesto por:

- `api/`: API REST con Node.js, Express, Lodash y CORS.
- `dashboard/`: frontend estático en HTML, CSS y JavaScript vanilla que consume la API con `fetch()`.

---

## Arquitectura

```txt
Navegador
  ↓
Dashboard en http://localhost:5173
  ↓ fetch()
API Express en http://localhost:3100
  ↓
JSON
  ↓
Interfaz visual
```

---

## Estructura

```txt
EDF-Lab-Educativo/
├── README.md
├── NOTEBOOK.md
├── ROADMAP.md
├── AGENTS.md
├── CHANGELOG.md
├── docs/
├── missions/
├── api/
└── dashboard/
```

---

## Puesta en marcha rápida

### Terminal 1: API

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

### Terminal 2: dashboard

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/dashboard
python3 -m http.server 5173
```

Abre:

```txt
http://localhost:5173
```

### Opcional: Docker Compose (avanzado)

Desde la raíz del repositorio:

```bash
npm run compose:up
# equivalente: docker compose up --build
```

Para parar el stack:

```bash
npm run compose:down
```

Dashboard: http://localhost:5173 — API: http://localhost:3100

SQLite persiste en `api/data/users.db` gracias al bind mount de Compose — ver [`docs/12-docker.md`](./docs/12-docker.md).

El camino principal de aprendizaje sigue siendo `npm start` + `python3 -m http.server`. La documentación completa de Compose llegará en una fase posterior.

---

## Qué aprenderás

- Qué es una API REST.
- Cómo Express expone endpoints HTTP.
- Cómo un frontend consume JSON con `fetch()`.
- Cómo la API persiste usuarios en SQLite (`users.db`) y migra la semilla desde `users.json` — ver [`docs/13-sqlite.md`](./docs/13-sqlite.md).
- Qué es CORS y por qué aparece al separar frontend/backend.
- Cómo depurar errores de conexión, puertos y rutas.
- Cómo documentar decisiones técnicas.
- Cómo evolucionar una demo hacia un proyecto educativo completo.

---

## Documentación principal

- [`NOTEBOOK.md`](./NOTEBOOK.md): diario vivo de decisiones, errores y aprendizajes.
- [`ROADMAP.md`](./ROADMAP.md): plan de evolución por fases.
- [`AGENTS.md`](./AGENTS.md): roles de trabajo y reglas del laboratorio.
- [`CHANGELOG.md`](./CHANGELOG.md): cambios relevantes del proyecto.
- [`docs/`](./docs): documentación conceptual.
- [`missions/`](./missions): ejercicios prácticos guiados.

---

## Endpoints actuales

```txt
GET /
GET /health
GET /users
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id
GET /about
GET /time
```

Ejemplos:

```bash
curl http://localhost:3100/
curl http://localhost:3100/health
curl http://localhost:3100/users
curl http://localhost:3100/users/1
curl http://localhost:3100/about
curl http://localhost:3100/time
```

---

## Validaciones recomendadas

Desde `api/`:

```bash
node --check index.js
npm audit --audit-level=high
```

Desde `dashboard/`:

```bash
node --check app.js
```

---

## Filosofía del laboratorio

Este proyecto no busca ocultar la complejidad, sino convertirla en aprendizaje:

```txt
leer → ejecutar → romper → observar → arreglar → documentar
```

Cada problema real encontrado debe registrarse en `NOTEBOOK.md` para que el proyecto sea cada vez más útil didácticamente.
