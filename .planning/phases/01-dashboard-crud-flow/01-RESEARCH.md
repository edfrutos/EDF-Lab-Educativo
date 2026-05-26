# Phase 1: Dashboard CRUD Flow - Research

**Date:** 2026-05-26
**Phase:** 1 - Dashboard CRUD Flow
**Status:** Complete

## Research Question

What do we need to know to plan browser-visible CRUD for the existing vanilla dashboard without adding unnecessary complexity?

## Sources Read

- `.planning/phases/01-dashboard-crud-flow/01-CONTEXT.md`
- `.planning/phases/01-dashboard-crud-flow/01-UI-SPEC.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/codebase/STACK.md`
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/STRUCTURE.md`
- `dashboard/index.html`
- `dashboard/app.js`
- `dashboard/styles.css`
- `api/index.js`
- `docs/04-dashboard-fetch.md`
- `missions/05-mejorar-dashboard.md`
- `NOTEBOOK.md`

## Findings

### Existing API Contract

The API already supports all needed backend operations:

- `GET /users` returns users sorted by name.
- `POST /users` creates a user with `{ name, email }` and returns `201`.
- `PUT /users/:id` replaces an existing user.
- `DELETE /users/:id` deletes a user and returns confirmation.

No backend feature work is needed for this phase unless implementation discovers a mismatch between dashboard needs and API behavior.

### Dashboard Implementation Pattern

The dashboard currently follows a small, readable pattern:

- Cache DOM nodes in an `elements` object.
- Fetch data with `fetchJson(path)`.
- Render JSON into the DOM with small `renderX()` functions.
- Use explicit state helpers for loading, online/offline, and errors.

Phase 1 should extend this style rather than introduce a module system, framework, or new dependency.

### CRUD Fetch Pattern

The current `fetchJson(path)` only supports GET. The planner should ask the executor to generalize it to accept an options object:

- `method`
- `headers`
- `body`

The helper should still throw an error when `response.ok` is false and should parse JSON responses.

### Form State Pattern

The simplest teachable state is one variable:

- `editingUserId = null` for create mode.
- `editingUserId = user.id` for edit mode.

The form can derive its button copy and mode text from that variable. This avoids a larger state management abstraction.

### Mutation Feedback Pattern

The UI-SPEC locks concise feedback such as:

- `POST /users -> usuario creado`
- `PUT /users/:id -> usuario actualizado`
- `DELETE /users/:id -> usuario eliminado`

This feedback should live near the form and use `aria-live="polite"` so screen readers receive updates.

### Documentation Pattern

This phase is not complete unless the docs explain non-GET `fetch()`. The current `docs/04-dashboard-fetch.md` only shows a GET flow. The mission file already has a dashboard improvement mission that can be upgraded to include CRUD.

## Recommended Plan Shape

Use three sequential plans:

1. Create-user vertical slice:
   - fix stale dashboard path,
   - add form markup,
   - add POST support and create mode,
   - add basic styling and feedback.

2. Edit/delete vertical slice:
   - add row actions,
   - load row data into the shared form,
   - add PUT and DELETE flows,
   - add native delete confirmation and error states.

3. Documentation slice:
   - explain non-GET fetch,
   - update/add the learner mission,
   - record the stale path and CRUD learning in `NOTEBOOK.md`.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| DOM code grows hard to read | Keep helpers small and name them by behavior: `setFormMode`, `handleUserSubmit`, `handleEditUser`, `handleDeleteUser`. |
| Table actions break responsive layout | Keep actions compact and preserve the existing horizontal table scroll. |
| Feedback becomes too noisy | Show method and endpoint only for the latest mutation. Do not add raw JSON in this phase. |
| Docs drift from implementation | Plan documentation after implementation files are planned, and include exact endpoint/method examples. |

## Out of Scope

- File persistence.
- Automated tests.
- Frontend frameworks.
- Custom delete modal.
- Raw JSON request/response display.

## Research Complete

This research is sufficient for planning. The phase can be implemented with existing API routes, current dashboard patterns, and no new dependencies.
