# Coding Conventions

**Analysis Date:** 2026-05-26

## Naming Patterns

**Files:**
- Root project docs use uppercase conventional names: `README.md`, `NOTEBOOK.md`, `ROADMAP.md`, `AGENTS.md`.
- Educational docs and missions use numbered kebab-case: `docs/03-api-express.md`, `missions/04-romper-y-arreglar-cors.md`.
- Runtime files use simple lowercase names: `api/index.js`, `dashboard/app.js`, `dashboard/styles.css`.

**Functions:**
- JavaScript functions use camelCase.
- API helpers are named by intent: `getSortedUsers`, `parseUserId`, `findUserIndexById`, `validateUserPayload`.
- Dashboard render functions use `renderX` naming: `renderHealth`, `renderApiInfo`, `renderUsers`.
- Dashboard state helpers use verb phrases: `setLoadingState`, `setOnlineState`, `showError`.

**Variables:**
- Variables use camelCase.
- Constants use UPPER_SNAKE_CASE when they represent fixed config, such as `API_BASE_URL`.
- DOM references are grouped under an `elements` object in `dashboard/app.js`.

**Types:**
- No TypeScript, interfaces, enums, or explicit type aliases are present.

## Code Style

**Formatting:**
- Two-space indentation in JavaScript, HTML, CSS, and JSON.
- Single quotes in JavaScript.
- Semicolons are used consistently in JavaScript.
- Route handlers and helper functions are separated by blank lines for readability.

**Linting:**
- No ESLint or formatter configuration is present.
- Validation currently relies on syntax checks: `node --check api/index.js` and `node --check dashboard/app.js`.

## Import Organization

**Order:**
1. External packages at the top of `api/index.js`: `express`, `cors`, `lodash`.
2. Local constants and in-memory data.
3. Middleware.
4. Helper functions.
5. Routes.
6. Error middleware and server startup.

**Grouping:**
- `require()` statements are grouped at the top.
- There are no internal module imports because the API is still single-file.

**Path Aliases:**
- None.

## Error Handling

**Patterns:**
- API returns JSON errors for expected client failures.
- Guard clauses return early from route handlers.
- Express error middleware handles unexpected errors at the end of `api/index.js`.
- Dashboard catches failed fetches in `loadDashboardData()` and renders an offline state.

**Error Types:**
- Invalid route parameter: `400`.
- Missing user: `404`.
- Invalid body fields: `400`.
- Unexpected backend error: `500`.

## Logging

**Framework:**
- Console only.
- `console.error(err.stack)` is used by Express error middleware.

**Patterns:**
- Startup message logs the selected API port.
- No request logging or frontend logging pattern is established.

## Comments

**When to Comment:**
- Existing comments mark broad sections like middleware, routes, error handling, and server startup.
- Prefer short educational comments when they clarify a new concept.
- Avoid comments that duplicate obvious code.

**JSDoc/TSDoc:**
- Not used currently.

**TODO Comments:**
- No explicit TODO convention is present.
- Roadmap tasks are tracked in `ROADMAP.md` instead.

## Function Design

**Size:**
- Helpers are small and focused.
- Route handlers are readable but all live in one file; extraction may become useful as the API grows.

**Parameters:**
- Helper functions take simple primitive or object inputs.
- Route handlers use the standard Express `(req, res)` signature.

**Return Values:**
- API helpers return simple values or error strings.
- Route handlers return JSON responses and use early returns for error cases.

## Module Design

**Exports:**
- `api/index.js` exports `app`, which would allow future tests to import the Express app.
- Dashboard files do not use modules.

**Barrel Files:**
- None.

---

*Convention analysis: 2026-05-26*
*Update when patterns change*
