# Phase 15 — UAT: React Dashboard Parity

**Fecha:** 2026-06-01  
**App:** `dashboard-react/` en **http://localhost:5174**  
**API:** `http://localhost:3100`  
**Referencia vanilla:** `dashboard/` en **http://localhost:5173**

## Setup

| Paso | Comando |
|------|---------|
| API | `cd api && PORT=3100 npm start` |
| React | `cd dashboard-react && npm install && npm run dev` |
| Vanilla (regresión) | `cd dashboard && python3 -m http.server 5173` |

Opcional: copiar `dashboard-react/.env.example` → `.env` si cambias la URL de la API.

## Checklist

| # | Escenario | Pasos | Resultado esperado | Pass |
|---|-----------|-------|-------------------|------|
| 1 | Carga inicial | Abrir `:5174` con API en marcha | Health, info API (`GET /`) y tabla de usuarios visibles; estado «API conectada» | ☐ |
| 2 | Crear usuario | Rellenar nombre + email únicos → «Crear usuario» | Mensaje `POST /users -> usuario creado`; fila nueva en tabla | ☐ |
| 3 | Editar usuario | «Editar» en una fila → cambiar datos → «Guardar cambios» | Modo «Editando usuario N»; mensaje `PUT /users/:id -> usuario actualizado` | ☐ |
| 4 | Eliminar usuario | «Eliminar» → confirmar | Mensaje `DELETE /users/:id -> usuario eliminado`; fila desaparece | ☐ |
| 5 | Email duplicado (409) | Crear o editar con email ya existente | Feedback global de error **y** texto rojo bajo el campo email | ☐ |
| 6 | API apagada | Parar la API; recargar `:5174` | Panel de error; estado «API no disponible»; datos en «-» | ☐ |
| 7 | CORS | Con API + React en marcha, abrir DevTools → Consola | Sin errores CORS al cargar o mutar usuarios | ☐ |
| 8 | Regresión vanilla | Con API en marcha, abrir `:5173` | Dashboard vanilla carga y CRUD funciona igual que antes | ☐ |

## Build de producción (smoke)

```bash
cd dashboard-react && npm run build
```

Debe terminar sin errores (`dist/` generado).

## Notas de verificación automática (2026-06-01)

- `npm run build` en `dashboard-react/`: OK
- `GET /health` con API en `:3100`: OK
- Preflight CORS desde origen `:5174`: HTTP 204
- Sin cambios en `api/index.js` para CORS (D-16)
