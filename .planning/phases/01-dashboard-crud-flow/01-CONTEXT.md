# Phase 1: Dashboard CRUD Flow - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds browser-visible create, edit, and delete flows to the existing static dashboard. It should use the current Express user CRUD API, keep HTML/CSS/JS vanilla, and make the HTTP mutation flow understandable for beginner students.

In scope:
- Create users from the dashboard.
- Edit users from the dashboard.
- Delete users from the dashboard.
- Show loading, success, and error feedback for CRUD actions.
- Correct the stale dashboard help path.
- Document the browser -> API mutation flow.

Out of scope:
- File persistence; that belongs to Phase 2.
- API tests and package cleanup beyond the stale dashboard help path; those belong to Phase 3.
- Frameworks, routing, auth, or production-style app shell changes.

</domain>

<decisions>
## Implementation Decisions

### CRUD Placement
- **D-01:** Put the CRUD form directly above the users table inside or immediately adjacent to the existing users section.
- **D-02:** Optimize the placement for a visible teaching flow: form input -> API request -> updated table.

### Edit Flow
- **D-03:** Use the same form for both create and edit.
- **D-04:** When the learner clicks edit on a row, load that user's data into the form.
- **D-05:** While editing, show a clear state such as "Editando usuario X" so the learner knows the form has changed mode.

### Delete Flow
- **D-06:** Use native browser `confirm()` before calling `DELETE /users/:id`.
- **D-07:** Keep the delete confirmation simple for this phase; do not add a custom modal or inline confirmation component yet.

### Didactic HTTP Feedback
- **D-08:** After create, edit, or delete, show the HTTP method and endpoint used.
- **D-09:** Example feedback shape: `POST /users -> usuario creado`, `PUT /users/:id -> usuario actualizado`, `DELETE /users/:id -> usuario eliminado`.
- **D-10:** Prefer concise didactic feedback over raw JSON dumps in this phase.

### the agent's Discretion
- The planner may decide exact copy, DOM ids/classes, button labels, and visual styling details as long as they remain clear for beginner learners and consistent with the current dashboard.
- The planner may decide whether successful mutations reload all users with `GET /users` or update the local table state directly, but the resulting UI must make the API flow easy to understand.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Direction
- `.planning/PROJECT.md` — Project value, audience, constraints, and priority order.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements `DASH-01` through `DASH-05` and `QUAL-04`.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and plan split.
- `.planning/STATE.md` — Current project position.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` — Where dashboard, API, docs, and missions live.
- `.planning/codebase/CONVENTIONS.md` — Existing JavaScript naming, DOM, and documentation conventions.
- `.planning/codebase/STACK.md` — Vanilla frontend and Express backend constraints.

### Dashboard and API Implementation
- `dashboard/index.html` — Current dashboard structure, users table, and stale error-help path.
- `dashboard/app.js` — Current `fetchJson`, render, loading, online/offline, and error patterns.
- `dashboard/styles.css` — Existing card/table/button styles to extend.
- `api/index.js` — Existing `GET /users`, `POST /users`, `PUT /users/:id`, and `DELETE /users/:id` contract.

### Learning Material
- `docs/04-dashboard-fetch.md` — Existing explanation of dashboard `fetch()` flow.
- `missions/05-mejorar-dashboard.md` — Existing dashboard improvement mission and rules.
- `NOTEBOOK.md` — Required destination for relevant real errors and learning notes.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dashboard/app.js` has `fetchJson(path)` for GET requests; this phase likely needs an expanded helper that supports method, headers, and JSON body.
- `dashboard/app.js` already centralizes DOM references in an `elements` object; new form, feedback, and action controls should follow that pattern.
- `renderUsers(users)` already owns table row rendering; row-level edit/delete buttons should be added there or through a closely related helper.
- `setLoadingState`, `showError`, `hideError`, `setOnlineState`, and `setOfflineState` provide existing state patterns to reuse.

### Established Patterns
- The dashboard is static HTML/CSS/JS with no build step.
- Existing UI uses cards, table wrapper, endpoint labels, concise hints, and a blue/green/red status palette.
- JavaScript uses camelCase functions, early returns, `async`/`await`, and `replaceChildren()` for DOM updates.
- Documentation and missions are part of the implementation surface; learner-facing behavior changes should update docs/missions.

### Integration Points
- Add form markup near the users table in `dashboard/index.html`.
- Add form state, submit handling, edit button handling, delete button handling, and mutation feedback in `dashboard/app.js`.
- Add CSS for form layout, row actions, and feedback in `dashboard/styles.css`.
- Use existing API endpoints in `api/index.js`; avoid backend changes unless a dashboard bug reveals an API contract issue.
- Update `docs/04-dashboard-fetch.md`, `missions/05-mejorar-dashboard.md` or a new mission, and `NOTEBOOK.md` as needed.

</code_context>

<specifics>
## Specific Ideas

- Use one form above the users table.
- The form starts in create mode.
- Clicking edit loads the user into the same form and changes visible form state to editing mode.
- Provide a way to cancel edit mode and return to create mode.
- Delete uses native `confirm()`.
- Show the method and endpoint used after each successful mutation.

</specifics>

<deferred>
## Deferred Ideas

- Raw JSON display for sent/received payloads is useful but not selected for this phase; consider it later if the lab needs deeper debugging visibility.
- Custom confirmation UI for delete is deferred to avoid adding extra component/state complexity in this beginner phase.
- Framework-based form state is deferred until after the vanilla flow is established.

</deferred>

---

*Phase: 1-Dashboard CRUD Flow*
*Context gathered: 2026-05-26*
