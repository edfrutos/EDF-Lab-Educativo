# CHANGELOG

Registro de cambios relevantes del laboratorio.

---

## v1.6 · Framework Auth & CI (2026-06-14)

**Tag:** `v1.6` · **Shipped:** merge PR #6

### Implementado (fases 22–24)

- Login en **React** (`:5174`) y **Vue** (`:5175`) con paridad al vanilla: `LoginGate`, cookie `edf_session`, bootstrap de sesión.
- **Rate limiting** en `POST /auth/login` (`express-rate-limit`).
- **CI** en GitHub Actions (`.github/workflows/ci.yml`) con `npm run test:sqlite` (24 tests).

### Documentado (fase 25)

- [`docs/16-frameworks.md`](./docs/16-frameworks.md): comparativa auth en tres paneles (`onLogin` vs `emit`).
- Nueva misión [`missions/15-framework-auth-login-crud.md`](./missions/15-framework-auth-login-crud.md).
- [`missions/13-frameworks-network-tab.md`](./missions/13-frameworks-network-tab.md) actualizada (v1.6).
- [`docs/00-indice.md`](./docs/00-indice.md): ruta avanzada v1.6; badge CI en [`README.md`](./README.md).
- [`NOTEBOOK.md`](./NOTEBOOK.md): sección Framework Auth & CI (v1.6).

---

## v1.5 · Material didáctico auth y despliegue (2026-06)

### Documentado

- [`docs/17-autenticacion.md`](./docs/17-autenticacion.md) ampliado: bcrypt, JWT httpOnly, producción → doc 18.
- Nueva misión [`missions/14-auth-vanilla-login-crud.md`](./missions/14-auth-vanilla-login-crud.md).
- [`docs/00-indice.md`](./docs/00-indice.md): ruta avanzada v1.5 tras frameworks; doc 18 y misión 14.
- [`README.md`](./README.md): subsección ruta v1.5; endpoints `/auth/*`.
- [`NOTEBOOK.md`](./NOTEBOOK.md): sección Autenticación y despliegue (v1.5).

---

## Documentación · sincronización auth y tests (2026-06)

### Documentado

- Nuevo [`docs/17-autenticacion.md`](./docs/17-autenticacion.md): sesión del operador, cookies, curl, React/Vue y tests.
- Actualizados índice, puesta en marcha, API, dashboard, debugging, tests (46), frameworks y READMEs.
- Aviso en `ROADMAP.md` raíz apuntando a `.planning/ROADMAP.md`.

### Ajustado en código (clientes)

- `credentials: 'include'` en `dashboard-react/src/api.js` y `dashboard-vue/src/api.js`.

---

## 0.2.0 · API CRUD y sincronizacion documental

### Añadido

- Endpoints `GET /users/:id`, `POST /users`, `PUT /users/:id` y `DELETE /users/:id`.
- Endpoints auxiliares `GET /about` y `GET /time`.
- Validacion basica de `:id`, `name` y `email`.
- Ejemplos ejecutables con `curl` para lectura, creacion, actualizacion, borrado y errores.

### Documentado

- Estado real de Fase 1, Fase 2 y parte de Fase 3 en `ROADMAP.md`.
- README interno de la API actualizado al proyecto `EDF-Lab-Educativo`.
- Rutas locales corregidas desde `express-api-demo` a `EDF-Lab-Educativo`.
- Proximas misiones del dashboard conectadas con `/about`, `/time` y CRUD.

### Pendiente

- Crear formularios en el dashboard para consumir `POST`, `PUT` y `DELETE`.
- Añadir persistencia en `data/users.json`.
- Añadir tests de API.

---

## 0.1.0 · Laboratorio base

### Añadido

- API Express con endpoints `GET /`, `GET /users` y `GET /health`.
- Dashboard externo en HTML, CSS y JavaScript.
- Consumo de la API con `fetch()`.
- CORS en la API.
- Estructura global inicial.
- Documentación educativa base.
- `NOTEBOOK.md`, `ROADMAP.md`, `AGENTS.md` y `CHANGELOG.md`.
- Carpetas `docs/` y `missions/`.

### Corregido

- Error inicial de sintaxis en `index.js`.
- Vulnerabilidades altas asociadas a versión antigua de Nodemon.
- Conflicto de puerto usando `3100` para la API.
- Conflicto de entorno Node/npm mediante `nvm`.

### Decisiones

- Mantener frontend vanilla para reducir complejidad.
- Usar `3100` para API y `5173` para dashboard.
- Usar `NOTEBOOK.md` como diario vivo del aprendizaje.
