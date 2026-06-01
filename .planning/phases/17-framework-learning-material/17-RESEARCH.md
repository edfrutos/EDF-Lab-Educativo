# Phase 17 Research: Framework Learning Material

**Phase:** 17-framework-learning-material  
**Researched:** 2026-06-01  
**Status:** Ready for planning

## Summary

Phase 17 is **docs-only**: no dashboard code changes. Deliver `docs/16-frameworks.md`, Mission 13, navigation updates, NOTEBOOK section, and unified `17-UAT.md` to close milestone v1.4 (FRWK-09–13).

## Excerpt sources (verified in repo)

| Topic | Vanilla | React | Vue |
|-------|---------|-------|-----|
| State / load | `dashboard/app.js` — `elements`, `loadDashboardData` | `dashboard-react/src/App.jsx` — `useState`, `useEffect` | `dashboard-vue/src/App.vue` — `ref`, `onMounted` |
| HTTP | `fetchJson` inline in app.js | `dashboard-react/src/api.js` | `dashboard-vue/src/api.js` (same logic) |
| Forms / 409 | `handleUserFormSubmit`, mutation feedback | `UserForm.jsx` + `handleMutationError` | `UserForm.vue` + emits |
| Styling | `dashboard/styles.css` | Tailwind in `index.css` | Tailwind in `index.css` |

## Doc writing pattern

Follow `docs/13-sqlite.md`:

- Spanish, H2 sections, code fences with bash or js
- Links to related docs (`04-dashboard-fetch`, `05-cors-explicado`)
- “Qué no incluimos” closing scope fence

## Mission 13 pattern

Follow `missions/12-postgres-compose-crud.md`:

- Numbered steps with commands
- Clear expected outcomes
- Reto extra for deeper practice
- DevTools Network: filter Fetch/XHR, inspect Request URL, Method, Status, Response

## NOTEBOOK pattern

Follow `2026-06-01 · PostgreSQL v1.3` block:

- `### Title` per error
- **Síntoma** / **Causa** / **Solución** / **Aprendizaje**
- Label entries from PITFALLS as “patrón documentado” when not from live session

## 17-UAT structure

Consolidate from `15-UAT.md` and `16-UAT.md`:

| Block | Apps |
|-------|------|
| Setup | One API :3100; three terminals or sequential |
| Matrix | Rows per scenario; columns 5173 / 5174 / 5175 or checkboxes per app |
| Milestone sign-off | All three pass |

## Out of scope

- Editing `dashboard-react/` or `dashboard-vue/` source (except broken link fix)
- `api/index.js` CORS changes unless UAT finds regression
- New npm dependencies

## Confidence

HIGH — all source material exists; phase is synthesis and navigation.
