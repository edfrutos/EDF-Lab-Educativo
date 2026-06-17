# Express API Demo Learning Lab

[![CI](https://github.com/edfrutos/EDF-Lab-Educativo/actions/workflows/ci.yml/badge.svg)](https://github.com/edfrutos/EDF-Lab-Educativo/actions/workflows/ci.yml)

Laboratorio educativo para aprender, de forma aplicada, cómo funciona una arquitectura web moderna separando un **backend API** y un **frontend consumidor**.

El proyecto está compuesto por:

- `api/`: API REST con Node.js, Express, Lodash y CORS.
- `dashboard/`: frontend estático en HTML, CSS y JavaScript vanilla que consume la API con `fetch()`.
- `dashboard-react/` *(opcional, v1.4)*: misma API con Vite + React + Tailwind en el puerto **5174**.
- `dashboard-vue/` *(opcional, v1.4)*: misma API con Vite + Vue 3 + Tailwind en el puerto **5175**.

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
├── dashboard/
├── dashboard-react/   # opcional (v1.4)
└── dashboard-vue/     # opcional (v1.4)
```

---

## Puesta en marcha rápida

### Terminal 1: API

```bash
cd api
cp .env.example .env   # primera vez
PORT=3100 npm start
```

### Terminal 2: dashboard

```bash
cd dashboard
python3 -m http.server 5173
```

Abre:

```txt
http://localhost:5173
```

### Opcional: Docker Compose (avanzado)

Antes de levantar el stack, prepara secretos en la API:

```bash
cp api/.env.example api/.env
# Edita api/.env: define JWT_SECRET y descomenta DATABASE_URL para Compose
```

Desde la raíz del repositorio:

```bash
npm run compose:up
# equivalente: docker compose up --build
```

Para parar el stack:

```bash
npm run compose:down
```

### Modo prod (un solo origen HTTPS)

Perfil **`prod`**: nginx edge (`edf-lab-proxy`) en **`:443`**, dashboard en `/` y API en **`/api`** (strip en el proxy). El modo dev en host (`:3100` + `:5173`) no cambia.

```bash
./scripts/generate-dev-tls.sh   # certs autofirmados en deploy/certs/ (una vez)
npm run compose:prod            # levanta stack sin publicar :3100/:5173
./scripts/smoke-prod-proxy.sh   # curl -k contra https://localhost/api/health
```

Abre https://localhost en el navegador (acepta la advertencia del certificado de laboratorio). Detalle: [`docs/18-production-deploy.md`](./docs/18-production-deploy.md).

Dashboard: http://localhost:5173 — API: http://localhost:3100 — PostgreSQL: `localhost:5432`

En **v1.3**, `npm run compose:up` levanta **tres servicios** (Postgres + API + dashboard). La API usa **PostgreSQL** vía `DATABASE_URL`; los datos persisten en el volumen Docker `postgres_data`. En el host, `cd api && npm start` **sin** `DATABASE_URL` sigue usando SQLite en `api/data/users.db`.

Guías: [`docs/14-docker-compose.md`](./docs/14-docker-compose.md), [`docs/15-postgresql.md`](./docs/15-postgresql.md), [`docs/18-production-deploy.md`](./docs/18-production-deploy.md) (secretos y TLS). Misiones: [`missions/11-arrancar-con-compose.md`](./missions/11-arrancar-con-compose.md), [`missions/12-postgres-compose-crud.md`](./missions/12-postgres-compose-crud.md).

Tests: `npm run test:db:prepare` (desde la raíz) y luego `npm test` — **47 tests** si Postgres está en marcha (24 en SQLite + 23 en Postgres). Solo SQLite: `npm run test:sqlite --prefix api` (**24 tests**). **CI:** cada push o PR a `main` ejecuta cuatro jobs en paralelo (`test-sqlite`, `test-postgres`, `e2e-smoke` con Chromium+Firefox, `e2e-postgres`) — ver [`docs/10-tests.md`](./docs/10-tests.md#ci-en-github-actions).

Autenticación: las rutas `/users` requieren login de operador. Guía: [`docs/17-autenticacion.md`](./docs/17-autenticacion.md). Misión práctica: [`missions/14-auth-vanilla-login-crud.md`](./missions/14-auth-vanilla-login-crud.md). En el dashboard vanilla usa `admin@lab.local` / `changeme` por defecto (`api/.env`).

El camino principal de aprendizaje sigue siendo `npm start` + `python3 -m http.server`.

### Ruta avanzada: autenticación y despliegue (v1.5)

Orden sugerido cuando ya dominas el recorrido vanilla (y opcionalmente frameworks):

1. [`docs/16-frameworks.md`](./docs/16-frameworks.md) *(opcional)* — comparar vanilla, React y Vue.
2. [`docs/17-autenticacion.md`](./docs/17-autenticacion.md) — operador, bcrypt, cookie JWT, CORS con credenciales.
3. [`missions/14-auth-vanilla-login-crud.md`](./missions/14-auth-vanilla-login-crud.md) — práctica guiada con DevTools.
4. [`docs/18-production-deploy.md`](./docs/18-production-deploy.md) — secretos, Compose `env_file`, TLS en nginx.
5. Docker Compose — sección [Opcional: Docker Compose](#opcional-docker-compose-avanzado) arriba (requiere `api/.env`).

### Ruta avanzada v1.6 (auth en frameworks y CI)

Tras v1.5, con React/Vue opcionales:

1. [`docs/16-frameworks.md`](./docs/16-frameworks.md) — auth en vanilla, React (`onLogin`) y Vue (`emit`).
2. [`missions/15-framework-auth-login-crud.md`](./missions/15-framework-auth-login-crud.md) — práctica en `:5174` o `:5175`.
3. [`docs/10-tests.md`](./docs/10-tests.md#ci-en-github-actions) — CI: sqlite + postgres + E2E smoke (tres jobs en PRs).

### Ruta avanzada v2.0 (Quality & CI)

Tras v1.6:

1. [`docs/10-tests.md`](./docs/10-tests.md#smoke-e2e-playwright) — E2E local y matriz de jobs CI.
2. [`missions/16-smoke-e2e-playwright.md`](./missions/16-smoke-e2e-playwright.md) — práctica smoke y lectura de fallos.
3. [`NOTEBOOK.md`](./NOTEBOOK.md) — sección Quality & CI (v2.0).

### Ruta avanzada v2.1 (Advanced E2E)

Tras v2.0:

1. [`docs/10-tests.md`](./docs/10-tests.md#matriz-de-navegadores-local-vs-ci) — CRUD E2E, Postgres y multi-browser (Chromium/Firefox en CI).
2. [`missions/17-crud-e2e-playwright.md`](./missions/17-crud-e2e-playwright.md) — CRUD E2E, trace y Network.
3. [`NOTEBOOK.md`](./NOTEBOOK.md) — sección Advanced E2E (v2.1).

### Ruta avanzada v2.2 (Visual Regression)

Tras v2.1:

1. [`docs/10-tests.md`](./docs/10-tests.md#regresión-visual-tres-dashboards-fase-35) — flujo visual local/CI, baseline update y troubleshooting.
2. [`missions/18-visual-regression-playwright.md`](./missions/18-visual-regression-playwright.md) — práctica guiada de snapshot mismatch, diff review y actualización intencional.
3. [`NOTEBOOK.md`](./NOTEBOOK.md) — sección Visual Regression (v2.2) con fricciones reales y aprendizajes.

Índice completo: [`docs/00-indice.md`](./docs/00-indice.md).

### Opcional (avanzado): dashboard React

Misma API, stack React para comparar estado y componentes con vanilla:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/dashboard-react
npm install
npm run dev
```

Abre **http://localhost:5174**. Detalle: [`dashboard-react/README.md`](./dashboard-react/README.md).

### Opcional (avanzado): dashboard Vue

Misma API, stack Vue para comparar `ref()` y reactividad del template:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/dashboard-vue
npm install
npm run dev
```

Abre **http://localhost:5175**. Detalle: [`dashboard-vue/README.md`](./dashboard-vue/README.md).

Comparativa de estado y formularios entre los tres paneles: [`docs/16-frameworks.md`](./docs/16-frameworks.md). Misión práctica con pestaña Network: [`missions/13-frameworks-network-tab.md`](./missions/13-frameworks-network-tab.md).

---

## Qué aprenderás

- Qué es una API REST.
- Cómo Express expone endpoints HTTP.
- Cómo un frontend consume JSON con `fetch()`.
- Cómo la API persiste usuarios en SQLite (`users.db`) y migra la semilla desde `users.json` — ver [`docs/13-sqlite.md`](./docs/13-sqlite.md).
- Qué es CORS y por qué aparece al separar frontend/backend.
- Cómo funciona la sesión del operador (cookie, `/auth/login`, rutas protegidas).
- Cómo depurar errores de conexión, puertos y rutas.
- Cómo documentar decisiones técnicas.
- Cómo evolucionar una demo hacia un proyecto educativo completo.

---

## Documentación principal

- [`NOTEBOOK.md`](./NOTEBOOK.md): diario vivo de decisiones, errores y aprendizajes.
- [`ROADMAP.md`](./ROADMAP.md): plan histórico resumido del repo.
- [`.planning/ROADMAP.md`](./.planning/ROADMAP.md): roadmap GSD actual (milestones v1.x).
- [`AGENTS.md`](./AGENTS.md): roles de trabajo y reglas del laboratorio.
- [`CHANGELOG.md`](./CHANGELOG.md): cambios relevantes del proyecto.
- [`docs/`](./docs): documentación conceptual.
- [`missions/`](./missions): ejercicios prácticos guiados.

---

## Endpoints actuales

```txt
GET /
GET /health
POST /auth/login
POST /auth/logout
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
