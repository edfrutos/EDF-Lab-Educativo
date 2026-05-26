# Phase 1: Dashboard CRUD Flow - Pattern Map

**Date:** 2026-05-26
**Status:** Complete

## Files in Scope

| File | Role | Existing Pattern |
|------|------|------------------|
| `dashboard/index.html` | Markup | Static sections with IDs consumed by `dashboard/app.js` |
| `dashboard/app.js` | Behavior | `elements` object, `fetchJson()`, `renderX()`, state helpers |
| `dashboard/styles.css` | Styling | Card/table/button vocabulary, responsive breakpoint at 820px |
| `docs/04-dashboard-fetch.md` | Concept doc | Explains `fetch()` and JSON rendering |
| `missions/05-mejorar-dashboard.md` | Learner mission | Dashboard improvement rules |
| `NOTEBOOK.md` | Learning log | Real decisions, errors, and learning |

## Existing Data Flow

Current dashboard load:

1. `loadDashboardData()` sets loading state.
2. `Promise.all()` fetches `/health`, `/`, and `/users`.
3. Render helpers update DOM.
4. Errors clear dashboard data and show the global error box.

Mutation flow should mirror this:

1. User submits form or clicks row action.
2. UI sets a mutation/loading state.
3. `fetchJson()` sends `POST`, `PUT`, or `DELETE`.
4. UI shows method/endpoint feedback.
5. `loadDashboardData()` refreshes table data.

## Existing UI Vocabulary

Reusable CSS concepts:

- `.card` for framed content.
- `.card-header` for title/hint layout.
- `.small-label` for endpoint/section labels.
- `.hint` for supporting copy.
- `.table-wrapper` for scrollable tables.
- Button base style for primary actions.
- `--success`, `--danger`, and `--warning` semantic colors.

Avoid:

- Adding a nested card inside `.users-card`.
- Adding a modal.
- Adding a new dominant color family.

## Suggested New DOM Hooks

Add IDs following existing style:

- `user-form`
- `user-form-title`
- `user-form-helper`
- `user-name-input`
- `user-email-input`
- `user-submit-button`
- `cancel-edit-button`
- `form-mode-message`
- `mutation-feedback`

Row action buttons can use `data-action="edit"` / `data-action="delete"` and `data-user-id`.

## Suggested JavaScript Helpers

Keep helpers small:

- `fetchJson(path, options = {})`
- `handleUserFormSubmit(event)`
- `handleUsersTableClick(event)`
- `startEditingUser(user)`
- `resetUserForm()`
- `setUserFormLoading(isLoading)`
- `showMutationFeedback(method, endpoint, message, type)`

## Verification Anchors

Executor can verify implementation with:

- `node --check dashboard/app.js`
- `rg -n "user-form|mutation-feedback|Acciones|Crear usuario|Guardar cambios" dashboard`
- Manual flow with API and dashboard running:
  - create user,
  - edit user,
  - delete user,
  - observe method/endpoint feedback.

## Pattern Mapping Complete
