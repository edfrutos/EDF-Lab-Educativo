# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Laboratorio educativo con dos aplicaciones completamente separadas:

- `api/` — API REST mínima en Express (Node.js) con datos en memoria.
- `dashboard/` — Frontend estático en HTML/CSS/JS vanilla que consume la API con `fetch()`.

La separación es intencional y forma parte del objetivo didáctico. No acoples las dos partes salvo que la tarea lo pida explícitamente.

## Comandos

### Arrancar la API (terminal 1)

```bash
cd api
PORT=3100 npm start
```

### Arrancar el dashboard (terminal 2)

```bash
cd dashboard
python3 -m http.server 5173
```

Accede en `http://localhost:5173`.

### Comprobaciones de sintaxis y seguridad

```bash
# Desde api/
node --check index.js
npm audit --audit-level=high

# Desde dashboard/
node --check app.js
```

> `npm test` en `api/` es un placeholder; no hay suite de tests automatizados.

## Arquitectura

```
Navegador
  ↓
dashboard/  →  http://localhost:5173
  ↓ fetch()
api/        →  http://localhost:3100
  ↓
JSON en memoria
```

### `api/index.js`

Único entrypoint del backend. Define todos los endpoints, habilita `cors()` y gestiona un array `users` en memoria con CRUD completo. Usa Lodash solo para ordenar el listado de usuarios antes de responder.

### `dashboard/app.js`

- `API_BASE_URL` está hardcodeada a `http://localhost:3100`.
- Al cargar, llama en paralelo a `/health`, `/` y `/users` con `Promise.all`.
- Todas las referencias DOM están centralizadas en el objeto `elements`.
- La UI se actualiza exclusivamente a través de helpers pequeños: `renderHealth`, `renderApiInfo`, `renderUsers`, y helpers de estado (`setOnlineState`, `setOfflineState`, `setLoadingState`, `showError`).
- Mantén este patrón al ampliar la interfaz.

## Contrato API → Dashboard

Estos contratos están acoplados entre backend y frontend; no los rompas sin actualizar ambos lados:

| Endpoint | Campos requeridos |
|---|---|
| `GET /` | `message`, `version`, `endpoints` |
| `GET /health` | `status`, `timestamp` |
| `GET /users` | array de `{ id, name, email }` |

## Puertos

Los puertos `3100` (API) y `5173` (dashboard) están referenciados en `README.md`, `docs/`, `dashboard/app.js` y el mensaje de error embebido en `dashboard/index.html`. Si cambias uno, actualiza todas esas referencias.

## Convenciones clave

- **CORS es obligatorio**: el dashboard se sirve desde un puerto distinto. No elimines `app.use(cors())`.
- **Documentación como producto**: si cambias comportamiento observable, actualiza también `README.md`, `NOTEBOOK.md`, `docs/` o `missions/` según proceda.
- **Sin dependencias innecesarias**: no añadas paquetes que no aporten valor educativo claro (`AGENTS.md`, regla 5).
- **Errores reales → `NOTEBOOK.md`**: los errores encontrados durante el desarrollo tienen valor didáctico y deben documentarse.

## Planificación (GSD)

Antes de cambios grandes, consulta los artefactos de `.planning/`:

- `.planning/PROJECT.md` — intención, valor central y decisiones.
- `.planning/ROADMAP.md` — fases y criterios de éxito.
- `.planning/STATE.md` — posición actual del proyecto.
- `.planning/codebase/` — mapa técnico generado.

Para iniciar una fase:

```
/gsd-discuss-phase
/gsd-plan-phase
```
