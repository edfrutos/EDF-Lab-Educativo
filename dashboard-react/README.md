# Dashboard React (EDF Lab Educativo)

Variante **opcional y avanzada** del panel de usuarios: misma API que `dashboard/` vanilla, implementada con **Vite + React 18 + Tailwind CSS v4**.

El camino principal de aprendizaje sigue siendo el dashboard vanilla en el puerto **5173**.

## Requisitos

- Node.js 18+ (recomendado: misma versión que `api/`)
- API Express en marcha en `http://localhost:3100` (con autenticación activa; sin `AUTH_DISABLED` para el recorrido con login)
- Credenciales del operador del lab en `api/.env` (ver `api/.env.example`)

## Autenticación

Este panel **incluye login** en el puerto **5174**. La sesión es una cookie httpOnly (`edf_session`) que el navegador envía con `credentials: 'include'` en cada `fetch` (ver `src/api.js`).

**Credenciales por defecto del lab:** `admin@lab.local` / `changeme` (mismas que el dashboard vanilla).

Flujo: iniciar sesión → CRUD protegido → cerrar sesión. Narrativa completa en [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

> `AUTH_DISABLED=1` en `api/.env` es solo para **tests automatizados** de la API, no para el camino didáctico con login.

## Configuración

```bash
cd dashboard-react
cp .env.example .env   # opcional; el valor por defecto ya apunta a :3100
npm install
```

Variable de entorno:

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:3100` |

## Arranque

**Terminal 1 — API:**

```bash
cd ../api
PORT=3100 npm start
```

**Terminal 2 — React:**

```bash
cd dashboard-react
npm run dev
```

Abre **http://localhost:5174** (puerto fijo en `vite.config.js`).

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo Vite (`:5174`) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build |

## Paridad con vanilla

- Carga inicial: `GET /health`, `GET /`, `GET /users` en paralelo.
- CRUD: `POST /users`, `PUT /users/:id`, `DELETE /users/:id`.
- Email duplicado: **409** con mensaje global y error inline bajo el campo email.
- HTTP centralizado en `src/api.js` (`fetchJson`, sin axios).

## CORS y cookies

El dashboard React se sirve desde otro origen (`http://localhost:5174`). La API usa `cors()` con `CORS_ORIGINS` en `.env` (incluye `:5174`). `fetchJson` en `src/api.js` envía `credentials: 'include'`; tras iniciar sesión, las peticiones a `:3100` llevan la cookie `edf_session`.

Si ves **401** en `/users` sin haber iniciado sesión, es el comportamiento esperado: usa el formulario de login. Si ves CORS, comprueba que la API está en `:3100`.

## Verificación manual

Checklist de paridad CRUD: [`.planning/phases/15-react-dashboard-parity/15-UAT.md`](../.planning/phases/15-react-dashboard-parity/15-UAT.md)

Checklist de autenticación (fase 22): ver plan `22-02-PLAN.md` — login, cookie en Network tab, logout, 401 tras borrar cookie.

**Misión práctica v1.6:** [`missions/15-framework-auth-login-crud.md`](../missions/15-framework-auth-login-crud.md) — login → CRUD → logout en `:5174`.

**CI:** badge y workflow en [`docs/10-tests.md`](../docs/10-tests.md#ci-en-github-actions). Comparar patrón auth con Vue (`emit`) en [`docs/16-frameworks.md`](../docs/16-frameworks.md).
