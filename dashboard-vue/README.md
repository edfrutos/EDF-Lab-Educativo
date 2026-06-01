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
- API Express en `http://localhost:3100`

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

- Carga inicial: `GET /health`, `GET /`, `GET /users` en paralelo.
- CRUD con los mismos métodos y cuerpos JSON.
- Email duplicado: **409** con feedback global e inline bajo el email.
- HTTP en `src/api.js` (`fetchJson`, sin axios).

## Estado y reactividad (didáctica)

Tres formas de gestionar el mismo estado de UI en este repo:

| Enfoque | Dónde | Idea clave |
|---------|-------|------------|
| **Vanilla** | `dashboard/app.js` | Variables de módulo + objeto `elements` + DOM manual |
| **React** | `dashboard-react/src/App.jsx` | `useState` — el componente se vuelve a renderizar |
| **Vue** | `dashboard-vue/src/App.vue` | `ref()` — el template reacciona cuando cambia `.value` |

Aquí el estado vive en **`App.vue`** con `ref()` sueltos; los hijos reciben **props** y emiten eventos (`defineEmits`). No usamos Pinia ni Vue Router en v1.4.

La comparación ampliada (formularios, `fetch`, CORS) está en la fase 17: `docs/16-frameworks.md` (cuando se publique).

## CORS

El dashboard Vue se sirve desde `http://localhost:5175`. La API usa `cors()` abierto; no hace falta cambiar `api/index.js` para el laboratorio.

## Verificación manual

Checklist: [`.planning/phases/16-vue-dashboard-parity/16-UAT.md`](../.planning/phases/16-vue-dashboard-parity/16-UAT.md)
