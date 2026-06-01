# Phase 19: Vanilla Dashboard Login - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 19-Vanilla Dashboard Login
**Areas discussed:** Login gate layout, toolbar logout, startup load flow, 401/403 UX, fetchJson refactor, AUTH-12 doc touchpoint

---

## Login gate & layout

| Option | Description | Selected |
|--------|-------------|----------|
| gate_full | Pantalla completa que oculta el panel hasta iniciar sesión | ✓ |
| gate_partial | Mostrar health/API info pero ocultar solo CRUD | |
| inline_card | Formulario de login dentro del grid existente | |

**User's choice:** gate_full
**Notes:** Didactic “session first” experience; no leaked user rows before auth.

---

## Logout placement

| Option | Description | Selected |
|--------|-------------|----------|
| toolbar | Barra superior junto a «Recargar datos» | ✓ |
| hero | Botón en la sección hero | |
| users_header | Junto al título de la tabla de usuarios | |

**User's choice:** toolbar

---

## Startup load flow (before login)

| Option | Description | Selected |
|--------|-------------|----------|
| health_then_login | Comprobar `/health`; si OK, mostrar login (sin flash del panel) | ✓ (Claude discretion) |
| users_probe_only | Intentar `/users` directamente y bifurcar 401/200 | |
| full_parallel_always | Mantener `Promise.all` actual (falla en 401 visible) | |

**User's choice:** Tú decides → **health_then_login** (D-05/D-06 in CONTEXT)
**Notes:** Separates “API caída” (error-box) from “API viva, falta sesión” (login gate).

---

## Startup load flow (after login)

| Option | Description | Selected |
|--------|-------------|----------|
| full_parallel | `Promise.all` de `/health`, `/`, `/users` | ✓ (Claude discretion) |
| users_only | Cargar solo usuarios tras login | |
| sequential | Secuencial para depurar en Network tab | |

**User's choice:** Tú decides → **full_parallel** (preserves existing teaching pattern)

---

## Mensaje 401 (sin sesión)

| Option | Description | Selected |
|--------|-------------|----------|
| api_text | Texto de la API en JSON; fallback en español del lab | ✓ |
| custom_spanish | Mensaje fijo didáctico | |
| you_decide | Claude elige | |

**User's choice:** api_text
**Notes:** Fallback locked: «Inicia sesión para ver y gestionar usuarios».

---

## Error en login (403)

| Option | Description | Selected |
|--------|-------------|----------|
| inline_form | Mensaje bajo el formulario | ✓ |
| mutation_style | Reutilizar `mutation-feedback` | |
| error_box | Reutilizar `error-box` global | |

**User's choice:** inline_form
**Notes:** Global error-box reserved for connectivity/CORS.

---

## fetchJson & credentials

| Option | Description | Selected |
|--------|-------------|----------|
| mirror_react | `credentials: 'include'` + parse `body.error` + `error.status` como `dashboard-react/src/api.js` | ✓ (Claude discretion) |
| minimal | Solo añadir `credentials` sin parsear body | |

**User's choice:** Implicit via phase goal + Claude discretion → **mirror_react** (D-13–D-15)

---

## AUTH-12 documentation

| Option | Description | Selected |
|--------|-------------|----------|
| api_readme | Párrafo en `api/README.md` sección auth | ✓ (Claude discretion) |
| root_readme | Sección en README raíz | |
| defer_21 | Solo Phase 21 | |

**User's choice:** Claude discretion → **api_readme** short subsection; full doc in Phase 21

---

## Claude's Discretion

- Login gate HTML/CSS structure and optional default-credentials hint
- Session probe via `GET /users` after health (D-06)
- 401 mid-CRUD returns to login gate
- No new dashboard npm test suite unless planner adds manual UAT only

## Deferred Ideas

- React/Vue login UI — Phase 21 appendix / out of v1.5 UI scope
- Full authentication guide and Mission 14 — Phase 21
- Production secrets and TLS — Phase 20
