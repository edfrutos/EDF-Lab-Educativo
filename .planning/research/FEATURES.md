# Research: Features — v1.4 Framework Dashboards

**Researched:** 2026-06-01

## Baseline (vanilla `dashboard/app.js`)

| Feature | Vanilla pattern |
|---------|-----------------|
| Initial load | `Promise.all` → `/health`, `/`, `/users` |
| List users | Table render from `currentUsers` |
| Create | POST `/users` + reload |
| Edit | PUT `/users/:id`, form mode |
| Delete | DELETE with confirm |
| States | loading, online/offline, error box, mutation feedback |
| Contract | Same JSON shapes as API docs |

## Table stakes (must match in React + Vue)

- FRWK parity: all CRUD operations visible in UI
- Health + API metadata panel (or equivalent sections)
- Explicit error when API unreachable (CORS, EADDRINUSE, wrong port)
- Reload / refresh data control
- Duplicate email shows API error (409) to user

## Differentiators (educational value)

- Side-by-side doc: "same fetch, different state container"
- Highlight: vanilla DOM vs virtual DOM vs reactivity
- DevTools-friendly component boundaries in frameworks

## Anti-features (out of scope v1.4)

- Auth, routing libraries, i18n, design systems
- Shared component library between React and Vue
- Replacing vanilla dashboard as default entry in README
- E2E Playwright matrix across three frontends (manual mission sufficient)

## FRWK mapping

- **FRWK-01 (introduce comparison):** Two framework apps + doc index entry
- **FRWK-02 (state/forms):** Dedicated doc section with code excerpts from all three dashboards
