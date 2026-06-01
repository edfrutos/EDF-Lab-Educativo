# Dashboard React (EDF Lab Educativo)

Variante **opcional y avanzada** del panel de usuarios: misma API que `dashboard/` vanilla, implementada con **Vite + React 18 + Tailwind CSS v4**.

El camino principal de aprendizaje sigue siendo el dashboard vanilla en el puerto **5173**.

## Requisitos

- Node.js 18+ (recomendado: misma versión que `api/`)
- API Express en marcha en `http://localhost:3100`

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

## CORS

El dashboard React se sirve desde otro origen (`http://localhost:5174`). La API ya usa `cors()` sin lista restrictiva; no hace falta cambiar `api/index.js` para el laboratorio.

Si ves errores CORS en la consola del navegador, comprueba que la API está en `:3100` y que abres la URL correcta del dev server.

## Verificación manual

Checklist: [`.planning/phases/15-react-dashboard-parity/15-UAT.md`](../.planning/phases/15-react-dashboard-parity/15-UAT.md)
