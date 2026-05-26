---
phase: 1
slug: dashboard-crud-flow
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-26
approved: 2026-05-26
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for adding dashboard CRUD flows. This contract preserves the current vanilla dashboard style while making create, edit, and delete actions visible and teachable.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none required |
| Font | Existing system stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |

**Register:** Product UI. The interface is a learning dashboard, so design serves repeated inspection and task completion.

**Scene:** A beginner learner is running API and dashboard side by side on a laptop, reading the UI while also watching DevTools or terminal output. The UI should feel calm, explicit, and instructional without looking like a slide deck.

---

## Layout Contract

### Placement

- Add the CRUD form above the users table, inside the existing users area or immediately before the table wrapper.
- Keep the form visually connected to `GET /users`; the learner should see that form actions change the table below.
- Do not move the hero, health/API cards, or existing explanation sections as part of this phase.

### Structure

The users section should read in this order:

1. Users card header: endpoint label, `GET /users`, short hint.
2. CRUD form block: create/edit fields and primary actions.
3. HTTP feedback line: method and endpoint used after mutations.
4. Users table with row actions.

### Responsive Behavior

- Desktop: form fields may sit in a compact grid, with actions aligned to the end.
- Mobile: form fields and actions stack vertically. Buttons must remain full-width or comfortably tappable.
- Table remains horizontally scrollable with `min-width` preserved.
- Row actions must not force narrow cells to wrap into unreadable text.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Help text, inline status gaps |
| sm | 8px | Label/input gaps, row action gaps |
| md | 16px | Field groups, compact form padding |
| lg | 24px | Card padding, form/table separation |
| xl | 32px | Section gaps when needed |
| 2xl | 48px | Existing page-level spacing |
| 3xl | 64px | Reserved for existing hero/page rhythm |

Exceptions: none.

### Required Spacing

- Form block must have at least `16px` gap from the users header and `16px` from the table.
- Inputs must have at least `8px` vertical separation from labels or helper text.
- Action buttons must have at least `8px` gap between them.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 12px to 13px | 800 | 1.2 |
| Form input | 15px to 16px | 500 | 1.4 |
| Card heading | existing `1.25rem` | 700 to 800 | 1.2 |
| Feedback/code | 13px to 14px | 700 | 1.4 |

### Rules

- Do not add another font family.
- Avoid viewport-scaled type inside the CRUD form.
- Keep labels short and literal: `Nombre`, `Email`, `Acciones`.
- Button text must fit on mobile without truncation.

---

## Color

Use the existing palette and do not introduce a new dominant hue family.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#f4f7fb`, `#f8fbff` | Page background |
| Secondary (30%) | `#ffffff`, `rgba(255, 255, 255, 0.88)` | Cards and form surfaces |
| Soft surface | `#eef4ff` | Code chips, subtle form/feedback backgrounds |
| Text | `#172033` | Headings and primary text |
| Muted | `#667085` | Hints, labels, secondary copy |
| Border | `#d9e2ef` | Cards, inputs, table wrappers |
| Accent | `#2563eb`, `#1d4ed8` | Primary submit action, focused affordances, endpoint chips |
| Success | `#16a34a` | Successful mutation feedback |
| Warning | `#f59e0b` | Editing mode indicator if needed |
| Destructive | `#dc2626` | Delete action and destructive error feedback |

Accent reserved for:
- Primary create/save action.
- Focus ring or focused border.
- Endpoint/method feedback emphasis.
- Existing connection status vocabulary.

Destructive reserved for:
- Delete button or link.
- Error state text/border.

### Visual Tone

- Keep restrained product UI styling.
- Avoid decorative gradients, glass effects, nested cards, or modal-first patterns.
- The form can be a bordered panel or unframed block within the users card. It must not become a card inside a card.

---

## Component Contract

### CRUD Form

Fields:
- `name`: required text input.
- `email`: required text input with `type="email"` acceptable.

States:
- Create mode: primary CTA is `Crear usuario`.
- Edit mode: primary CTA is `Guardar cambios`; visible state text says `Editando usuario {id}` or `Editando usuario: {name}`.
- Edit mode includes secondary action `Cancelar edición`.
- Submitting disables relevant form controls until the request finishes.

Behavior:
- On create, call `POST /users`.
- On edit, call `PUT /users/:id`.
- On success, reset to create mode unless the planner has a clear reason not to.
- On success, refresh the users table so sorting remains backend-driven.

### Table Row Actions

Each row should include an `Acciones` column with:
- `Editar`: loads user into the shared form.
- `Eliminar`: runs native `confirm()` before `DELETE /users/:id`.

Button style:
- Row actions should be smaller than the primary form action.
- `Editar` may use a quiet/secondary style.
- `Eliminar` must use destructive color or text treatment.

### Feedback

Add a visible feedback region near the form.

Required success examples:
- `POST /users -> usuario creado`
- `PUT /users/:id -> usuario actualizado`
- `DELETE /users/:id -> usuario eliminado`

Required error behavior:
- Show problem and recovery path in plain Spanish.
- Include HTTP status when available.
- Keep the existing global connection error behavior for startup/CORS/API-down failures.

### Empty State

If there are no users:
- Keep a table row or clear empty state that says `No hay usuarios disponibles.`
- The form remains available so the learner can create the first user.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Form heading | `Gestionar usuarios` |
| Form helper | `Crea un usuario nuevo o edita uno existente desde el mismo formulario.` |
| Primary CTA create | `Crear usuario` |
| Primary CTA edit | `Guardar cambios` |
| Cancel edit | `Cancelar edición` |
| Edit state | `Editando usuario {id}` or `Editando usuario: {name}` |
| Row edit action | `Editar` |
| Row delete action | `Eliminar` |
| Feedback success | `{METHOD} {endpoint} -> {resultado}` |
| Error state | `No se ha podido completar la operación. Revisa la API y vuelve a intentarlo.` |
| Destructive confirmation | `Eliminar usuario`: `¿Seguro que quieres eliminar este usuario?` |

### Copy Rules

- Use Spanish UI copy to match the existing dashboard and docs.
- Keep HTTP method and endpoint exact enough to teach the API contract.
- Avoid raw JSON in this phase unless used internally for debugging.

---

## Accessibility Contract

- Every input must have a visible `<label>`.
- Feedback region should use `aria-live="polite"` or an equivalent accessible update pattern.
- Buttons must be reachable and usable with keyboard only.
- Focus styles must remain visible on inputs and buttons.
- Disabled state must not be communicated by color alone.
- Native `confirm()` is acceptable for delete confirmation in this phase.
- Table headers must include the new `Acciones` column.

---

## Interaction States

Required states:

- Initial loading: current dashboard loading behavior remains.
- Form idle: create mode with empty fields.
- Form submitting: submit button disabled and clear busy text or disabled affordance.
- Mutation success: feedback shows method and endpoint.
- Mutation error: feedback shows readable error and no silent failure.
- Edit mode: fields prefilled, edit state visible, cancel action available.
- Delete confirmation: native confirmation shown before delete request.
- API offline: existing offline card/error path remains.

---

## Documentation Hooks

This phase must update learning material so the UI is not just functional.

Required docs or mission updates:
- `docs/04-dashboard-fetch.md`: explain non-GET `fetch()` with method, headers, body, and response handling.
- `missions/05-mejorar-dashboard.md` or a new mission: teach create/edit/delete from the dashboard.
- `NOTEBOOK.md`: record the stale path fix and any real implementation/debugging lesson.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

No third-party UI blocks, component registries, icon libraries, or CSS frameworks are allowed for this phase.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-26
