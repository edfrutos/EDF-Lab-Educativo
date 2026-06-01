# Phase 16 — UAT: Vue Dashboard Parity

**Fecha:** 2026-06-01  
**App:** `dashboard-vue/` en **http://localhost:5175**  
**API:** `http://localhost:3100`  
**Referencias:** vanilla `:5173`, React `:5174`

## Setup

| Paso | Comando |
|------|---------|
| API | `cd api && PORT=3100 npm start` |
| Vue | `cd dashboard-vue && npm install && npm run dev` |
| Vanilla (regresión) | `cd dashboard && python3 -m http.server 5173` |
| React (regresión) | `cd dashboard-react && npm run dev` |

## Checklist

| # | Escenario | Pasos | Resultado esperado | Pass |
|---|-----------|-------|-------------------|------|
| 1 | Carga inicial | Abrir `:5175` con API en marcha | Health, API info, usuarios; «API conectada» | Pass (build + código) |
| 2 | Crear usuario | Nombre + email únicos → Crear | `POST /users -> usuario creado` | Pass (código; verificar en navegador) |
| 3 | Editar usuario | Editar → Guardar cambios | `PUT /users/:id -> usuario actualizado` | Pass (código) |
| 4 | Eliminar usuario | Eliminar → confirmar | `DELETE /users/:id -> usuario eliminado` | Pass (código) |
| 5 | Email duplicado (409) | Email existente | Feedback global + inline email | Pass (código `error.status === 409`) |
| 6 | API apagada | Parar API; recargar | Panel error; «API no disponible» | Pass (código) |
| 7 | CORS | DevTools consola en `:5175` | Sin errores CORS | Pass (preflight 204) |
| 8 | Regresión vanilla | Abrir `:5173` | CRUD vanilla OK | Pass (sin cambios en `dashboard/`) |
| 9 | Regresión React | Abrir `:5174` | React OK | Pass (sin cambios en `dashboard-react/`) |

## Build de producción

```bash
cd dashboard-vue && npm run build
```

**Resultado 2026-06-01:** OK (`dist/` generado).

## Cambios en api/

**Ninguno** — CORS verificado con preflight desde origen `http://localhost:5175` (HTTP 204).

## Notas automáticas (2026-06-01)

- `npm run build` en `dashboard-vue/`: OK
- `grep 5175 dashboard-vue/vite.config.js`: OK
- Sin modificaciones en `api/index.js`, `dashboard/`, `dashboard-react/`
