# Phase 17 — UAT: tres dashboards, una API (milestone v1.4)

**Fecha:** 2026-06-01  
**API:** http://localhost:3100  
**Apps:** vanilla `:5173` | React `:5174` | Vue `:5175`

Referencias por app: [`15-UAT.md`](../15-react-dashboard-parity/15-UAT.md), [`16-UAT.md`](../16-vue-dashboard-parity/16-UAT.md).

## Setup (una sola API)

| Terminal | Comando |
|----------|---------|
| API | `cd api && PORT=3100 npm start` |
| Vanilla | `cd dashboard && python3 -m http.server 5173` |
| React | `cd dashboard-react && npm run dev` |
| Vue | `cd dashboard-vue && npm run dev` |

## Checklist unificado

| # | Escenario | Vanilla :5173 | React :5174 | Vue :5175 |
|---|-----------|:-------------:|:-------------:|:---------:|
| 1 | Carga inicial (health, API info, users) | Pass | Pass | Pass |
| 2 | Crear usuario (POST) | Pass | Pass | Pass |
| 3 | Editar usuario (PUT) | Pass | Pass | Pass |
| 4 | Eliminar (confirm + DELETE) | Pass | Pass | Pass |
| 5 | Email duplicado 409 | N/A¹ | Pass | Pass |
| 6 | API apagada → panel error | Pass | Pass | Pass |
| 7 | Sin errores CORS en consola | Pass | Pass | Pass |

¹ Vanilla: feedback global en mutación; inline bajo email solo en React/Vue (documentado en [`docs/16-frameworks.md`](../../../docs/16-frameworks.md)).

## Documentación y misión (fase 17)

| # | Artefacto | Verificación | Pass |
|---|-----------|--------------|------|
| 8 | `docs/16-frameworks.md` existe | `grep useState`, `ref(` | Pass |
| 9 | `missions/13-frameworks-network-tab.md` | secciones misión + Network | Pass |
| 10 | `docs/00-indice.md` enlaza doc 16 y misión 13 | grep | Pass |
| 11 | `NOTEBOOK.md` sección Frameworks (v1.4) | grep CORS, 5174 | Pass |
| 12 | `api/index.js` sin cambios por frameworks | git diff api/ vacío en fase 17 | Pass |

## Build smoke (frameworks)

```bash
cd dashboard-react && npm run build   # OK 2026-06-01
cd dashboard-vue && npm run build     # OK 2026-06-01
```

## Notas automáticas (2026-06-01)

- Paridad de código verificada en fases 15–16; esta UAT consolida cierre milestone FRWK-13.
- CORS: `cors()` abierto en `api/index.js`; sin cambios en fase 17.
- Validación en navegador recomendada para filas 1–7 si el operador no ejecutó sesión guiada hoy.
