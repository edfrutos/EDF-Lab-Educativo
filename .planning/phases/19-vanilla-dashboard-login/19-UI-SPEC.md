# Phase 19: Vanilla Dashboard Login — UI Design Contract

**Created:** 2026-06-01  
**Status:** Ready for planning  
**Source:** CONTEXT.md D-01–D-04, D-09

## Design system state

**Existing tokens** in `dashboard/styles.css`: `--surface`, `--primary`, `--danger`, `--border`, `.card`, `.toolbar`, `.hero`, `.connection-card`.

No new design system — extend existing lab dashboard aesthetic.

## Screens & states

### State A — API unreachable (unchanged)

- `connection-card` shows offline; `error-box` may show CORS/network message.
- Login gate **not** shown until health succeeds (D-05).

### State B — Login gate (session absent)

- **Visible:** `hero` + `connection-card` (health OK) + `#login-gate` card.
- **Hidden:** `.dashboard-panel` wrapper (toolbar with CRUD, grid cards, users table, user form).
- Login gate is a centered `.card` with:
  - Heading: «Iniciar sesión»
  - Fields: `email` (type email, required), `password` (type password, required)
  - Submit: «Entrar»
  - Optional hint (discretion): small muted text referencing lab defaults
  - `#login-error` region below form for **403** and network errors (D-09) — `role="alert"`, not `error-box`

### State C — Dashboard (session valid)

- **Hidden:** `#login-gate`
- **Visible:** full existing shell inside `.dashboard-panel`
- Toolbar row: API base + **«Cerrar sesión»** (`#logout-button`) + **«Recargar datos»** (D-03)

## Component specs

| Element | ID | Notes |
|---------|-----|-------|
| Login gate section | `#login-gate` | `hidden` attribute or `.is-hidden` class toggled by JS |
| Dashboard panel | `.dashboard-panel` | Wraps toolbar + grid + users sections |
| Login form | `#login-form` | `preventDefault` on submit |
| Login error | `#login-error` | Empty when hidden; Spanish API text for 403 |
| Logout button | `#logout-button` | `type="button"`, secondary/outline style |

## Interaction

- **Focus:** First field focused when gate shown (accessibility).
- **Loading:** Disable submit + show «Comprobando…» on login submit; reuse `setLoadingState` only for dashboard data load, not login (avoid conflating connection card).
- **403:** Inline `#login-error` with `body.error` from API.
- **401:** Hide panel, show gate, message in `#login-error` or dedicated `#session-message` — prefer reusing `#login-error` for resumed-session loss (D-10, D-11).

## Responsive

- Login card: `max-width: 420px`, centered below hero; same padding as existing `.card`.

## Accessibility

- Form labels visible (not placeholder-only).
- `aria-live="polite"` on `#login-error`.
- Logout button accessible name: «Cerrar sesión».

## Out of scope

- React/Vue login UI (AUTH-12 doc only).
- Dark mode, animations beyond existing lab style.

---

*Phase 19 UI-SPEC — derived from discuss-phase CONTEXT*
