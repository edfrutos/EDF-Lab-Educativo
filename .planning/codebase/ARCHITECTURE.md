# Architecture

**Analysis Date:** 2026-05-26

## Pattern Overview

**Overall:** Educational split frontend/backend lab.

**Key Characteristics:**
- Backend is a single-file Express JSON API in `api/index.js`.
- Frontend is a static dashboard in `dashboard/` using vanilla browser APIs.
- Frontend and backend run on separate local origins to teach CORS and `fetch()`.
- Data is in-memory and intentionally simple for learning.

## Layers

**Documentation Layer:**
- Purpose: Teach concepts, document decisions, and guide exercises.
- Contains: `README.md`, `NOTEBOOK.md`, `ROADMAP.md`, `docs/*.md`, and `missions/*.md`.
- Depends on: The actual behavior of `api/` and `dashboard/` staying aligned.
- Used by: Learners and agents working on the project.

**API Layer:**
- Purpose: Expose REST-style JSON endpoints.
- Contains: Express app setup, middleware, validation helpers, route handlers, and startup in `api/index.js`.
- Depends on: `express`, `cors`, `lodash`, and process environment.
- Used by: Browser dashboard, curl examples, and future API tests.

**Frontend Layer:**
- Purpose: Display API status, metadata, endpoint list, users table, and connection errors.
- Contains: `dashboard/index.html`, `dashboard/styles.css`, and `dashboard/app.js`.
- Depends on: Browser DOM APIs and API availability at `http://localhost:3100`.
- Used by: Learners observing the data flow from API to UI.

**Data Layer:**
- Purpose: Provide sample user data.
- Contains: In-memory `users` array and `nextUserId` counter in `api/index.js`.
- Depends on: Node process lifetime.
- Used by: User route handlers.

## Data Flow

**Dashboard Load:**
1. Learner opens `http://localhost:5173`.
2. `dashboard/app.js` runs `loadDashboardData()`.
3. The browser sends parallel requests to `/health`, `/`, and `/users` on `http://localhost:3100`.
4. Express route handlers in `api/index.js` return JSON.
5. Dashboard render functions update DOM nodes with status, API info, and user rows.
6. If any request fails, the dashboard clears data and shows a connection error.

**API User Mutation:**
1. A client sends `POST`, `PUT`, or `DELETE` to `/users`.
2. Express parses JSON via `express.json()`.
3. Route handlers validate path params and body fields with local helper functions.
4. The in-memory `users` array is modified.
5. JSON response and HTTP status communicate the result.

**State Management:**
- API state is process-local memory only.
- Dashboard state is DOM-only; no client persistence.
- Restarting the API resets users to the seed data in `api/index.js`.

## Key Abstractions

**Express Route Handler:**
- Purpose: Map HTTP method/path to JSON response.
- Examples: `app.get('/users')`, `app.post('/users')`, `app.delete('/users/:id')`.
- Pattern: Inline handlers in `api/index.js`.

**Validation Helper:**
- Purpose: Keep repeated validation logic readable.
- Examples: `parseUserId(value)`, `validateUserPayload(body)`, `findUserIndexById(id)`.
- Pattern: Small pure helper functions near the top of `api/index.js`.

**Dashboard Renderer:**
- Purpose: Convert JSON into visible UI.
- Examples: `renderHealth(health)`, `renderApiInfo(apiInfo)`, `renderUsers(users)`.
- Pattern: DOM updates through cached element references.

## Entry Points

**API Server:**
- Location: `api/index.js`.
- Triggers: `npm start` from `api/`.
- Responsibilities: Configure Express, register routes, and listen on `process.env.PORT || 3000`.

**Dashboard Page:**
- Location: `dashboard/index.html`.
- Triggers: Browser request to the static server.
- Responsibilities: Load CSS, provide DOM structure, load `dashboard/app.js`.

**Dashboard Script:**
- Location: `dashboard/app.js`.
- Triggers: Script load in browser.
- Responsibilities: Fetch API data, render UI, and handle reload/error states.

## Error Handling

**Strategy:** Explicit JSON errors for expected API failures; generic middleware for unexpected Express errors.

**Patterns:**
- Invalid route IDs return `400`.
- Missing users return `404`.
- Invalid user bodies return `400`.
- Unexpected Express errors return `500` with a generic JSON message.
- Dashboard fetch failures show a visible error panel and offline status.

## Cross-Cutting Concerns

**Logging:**
- API uses `console.error()` only in the generic error middleware.
- No structured logging or request logging middleware is present.

**Validation:**
- Manual validation at the API boundary.
- No schema validation library is used, matching the educational rule to avoid dependencies without clear value.

**Authentication:**
- None currently.

**CORS:**
- Global `app.use(cors())` enables the separate dashboard origin to consume the API.

---

*Architecture analysis: 2026-05-26*
*Update when major patterns, boundaries, or entry points change*
