# Dashboard Vue (EDF Lab Educativo)

Variante **opcional y avanzada** del panel de usuarios: misma API que `dashboard/` vanilla, implementada con **Vite + Vue 3 + Tailwind CSS v4**.

El camino principal de aprendizaje sigue siendo el dashboard vanilla en el puerto **5173**.

## Puertos del laboratorio

| App | Carpeta | Puerto |
|-----|---------|--------|
| Vanilla | `dashboard/` | **5173** |
| React | `dashboard-react/` | **5174** |
| Vue | `dashboard-vue/` | **5175** |
| API | `api/` | **3100** |

## Requisitos

- Node.js 18+
- API Express en `http://localhost:3100` (con autenticación activa; sin `AUTH_DISABLED` para el recorrido con login)
- Credenciales del operador del lab en `api/.env` (ver `api/.env.example`)

## Autenticación

Este panel **incluye login** en el puerto **5175**. La sesión es una cookie httpOnly (`edf_session`) que el navegador envía con `credentials: 'include'` en cada `fetch` (ver `src/api.js`).

**Credenciales por defecto del lab:** `admin@lab.local` / `changeme` (mismas que vanilla y React).

Flujo: iniciar sesión → CRUD protegido → cerrar sesión. Narrativa completa en [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

### Patrón Vue: `emit` en LoginGate

A diferencia de React (callback `onLogin`), el formulario vive en **`LoginGate.vue`** y comunica al padre con `defineEmits(['login'])`. `App.vue` escucha `@login="handleLogin"` — patrón idiomático de Vue para hijo → padre.

> `AUTH_DISABLED=1` en `api/.env` es solo para **tests automatizados** de la API, no para el camino didáctico con login.

## Configuración

```bash
cd dashboard-vue
cp .env.example .env   # opcional
npm install
```

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `VITE_API_BASE_URL` | URL base de la API | `http://localhost:3100` |

## Arranque

**Terminal 1 — API:**

```bash
cd ../api
PORT=3100 npm start
```

**Terminal 2 — Vue:**

```bash
cd dashboard-vue
npm run dev
```

Abre **http://localhost:5175**.

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor Vite (`:5175`) |
| `npm run build` | Build en `dist/` |
| `npm run preview` | Previsualizar build |

## Paridad con vanilla y React

- Bootstrap: comprobación de sesión con `GET /users`; si hay cookie válida, carga `GET /health`, `GET /`, `GET /users` en paralelo.
- CRUD con los mismos métodos y cuerpos JSON.
- Email duplicado: **409** con feedback global e inline bajo el email.
- HTTP en `src/api.js` (`fetchJson`, `login`, `logout`; sin axios).

## Estado y reactividad (didáctica)

Tres formas de gestionar el mismo estado de UI en este repo:

| Enfoque | Dónde | Idea clave |
|---------|-------|------------|
| **Vanilla** | `dashboard/app.js` | Variables de módulo + objeto `elements` + DOM manual |
| **React** | `dashboard-react/src/App.jsx` | `useState` — el componente se vuelve a renderizar |
| **Vue** | `dashboard-vue/src/App.vue` | `ref()` — el template reacciona cuando cambia `.value` |

Aquí el estado vive en **`App.vue`** con `ref()` sueltos; los hijos reciben **props** y emiten eventos (`defineEmits`). No usamos Pinia ni Vue Router en v1.6.

Comparación ampliada: [`docs/16-frameworks.md`](../docs/16-frameworks.md).

## CORS y cookies

El dashboard Vue se sirve desde `http://localhost:5175`. La API usa `CORS_ORIGINS` en `.env` (incluye `:5175`) y `fetchJson` envía `credentials: 'include'`. Tras iniciar sesión, las peticiones a `:3100` llevan la cookie `edf_session`.

Si ves **401** en `/users` sin haber iniciado sesión, es el comportamiento esperado: usa el formulario de login. Si ves CORS, comprueba que la API está en `:3100`.

## Verificación manual

Checklist de paridad CRUD: [`.planning/phases/16-vue-dashboard-parity/16-UAT.md`](../.planning/phases/16-vue-dashboard-parity/16-UAT.md)

Checklist de autenticación (fase 23): ver plan `23-02-PLAN.md` — login, cookie en Network tab, logout, 401 tras borrar cookie.

**Misión práctica v1.6:** [`missions/15-framework-auth-login-crud.md`](../missions/15-framework-auth-login-crud.md) — login → CRUD → logout en `:5175`.

**CI:** [`docs/10-tests.md`](../docs/10-tests.md#ci-en-github-actions). Comparar patrón auth con React (`onLogin`) en [`docs/16-frameworks.md`](../docs/16-frameworks.md).
