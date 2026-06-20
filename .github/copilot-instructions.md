# Instrucciones de Copilot para este repositorio

## Comandos reales del proyecto

### Backend API

```bash
cd api
PORT=3100 npm start
```

### Dashboard estático

```bash
cd dashboard
python3 -m http.server 5173
```

### Comprobaciones disponibles

```bash
cd api
node --check index.js
```

```bash
cd dashboard
node --check app.js
```

```bash
cd api
npm audit --audit-level=high
```

### Tests

```bash
cd api
npm run test:sqlite   # 36 tests — suite usada en CI
npm test              # SQLite + Postgres (47 si PG disponible)
```

La suite SQLite (`index.test.js` + `rate-limit.test.js`) cubre CRUD, autenticación y rate limit de login. GitHub Actions ejecuta `test:sqlite` en cada push/PR a `main` (ver `.github/workflows/ci.yml`).

## Arquitectura de alto nivel

Este repositorio es un laboratorio educativo con dos aplicaciones separadas:

- `api/` contiene una API REST mínima en Express.
- `dashboard/` contiene un frontend estático en HTML, CSS y JavaScript vanilla.

El flujo principal es:

```txt
Navegador -> dashboard/ -> fetch() -> API Express -> JSON -> renderizado en el dashboard
```

Detalles importantes que se entienden leyendo varias partes del repo:

- `api/index.js` es el único entrypoint del backend. Define `GET /`, `GET /health` y `GET /users`, habilita `cors()` y devuelve datos JSON en memoria.
- `dashboard/app.js` hace `fetch()` en paralelo contra `GET /health`, `GET /` y `GET /users` usando una URL fija: `http://localhost:3100`.
- `dashboard/index.html` ya contiene todos los nodos que `app.js` espera por `id`; la lógica de UI no genera la estructura base, solo rellena estado, metadatos y tabla.
- `README.md` y `docs/` describen el laboratorio como una arquitectura deliberadamente separada para enseñar API REST, `fetch()`, CORS, puertos y debugging.

## Convenciones clave del código

- La separación `api/` + `dashboard/` es intencional y forma parte del objetivo didáctico. No conviertas el proyecto en una app full-stack acoplada salvo que la tarea lo pida explícitamente.
- CORS en `api/index.js` no es opcional: el dashboard se sirve desde otro puerto y depende de `app.use(cors())` para funcionar en navegador.
- Los puertos de trabajo del laboratorio son `3100` para la API y `5173` para el dashboard. Están reflejados en `README.md`, `docs/`, `dashboard/app.js` y el mensaje de error embebido en `dashboard/index.html`. Si cambias uno, actualiza todas esas referencias.
- El contrato entre backend y frontend está acoplado a la demo:
  - `GET /` debe seguir devolviendo `message`, `version` y `endpoints`.
  - `GET /health` debe seguir devolviendo `status` y `timestamp`.
  - `GET /users` debe seguir devolviendo un array de objetos con `id`, `name` y `email`.
- En el dashboard, el patrón actual es centralizar referencias DOM en `elements` y actualizar la UI mediante helpers pequeños (`renderHealth`, `renderApiInfo`, `renderUsers`, estados de carga/conexión/error). Mantén ese patrón al ampliar la interfaz.
- `GET /users` ordena los datos en el backend con Lodash antes de responder. Si cambias el origen o la forma de esos datos, conserva el orden explícito o actualiza la documentación que lo promete.
- Este repo trata la documentación como parte del producto educativo. Si cambias el comportamiento, revisa también `README.md`, `NOTEBOOK.md`, `docs/` o `missions/` cuando el cambio afecte a lo que se enseña o a los pasos de uso.
- `AGENTS.md` fija dos restricciones relevantes para cambios futuros: mantener el enfoque didáctico y no añadir dependencias sin valor educativo claro.
