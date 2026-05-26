# Technology Stack

**Analysis Date:** 2026-05-26

## Languages

**Primary:**
- JavaScript - Backend application code in `api/index.js` and browser code in `dashboard/app.js`.
- HTML - Static dashboard markup in `dashboard/index.html`.
- CSS - Static dashboard styling in `dashboard/styles.css`.
- Markdown - Educational project documentation in `README.md`, `NOTEBOOK.md`, `docs/`, and `missions/`.

**Secondary:**
- JSON - Node package manifests in `api/package.json`, `api/package-lock.json`, and `skills-lock.json`.

## Runtime

**Environment:**
- Node.js - Required for the Express API in `api/index.js`.
- Browser runtime - Required for the static dashboard and `fetch()` calls in `dashboard/app.js`.
- Python 3 - Used only as a simple local static file server for `dashboard/`.

**Package Manager:**
- npm - Used for API dependencies and scripts.
- Lockfile: `api/package-lock.json` is present.

## Frameworks

**Core:**
- Express `^4.18.2` - HTTP routing and JSON API server.
- Vanilla browser APIs - The dashboard uses `fetch()`, DOM APIs, and static HTML/CSS.

**Testing:**
- No test framework is installed.
- `api/package.json` has a placeholder `npm test` script that exits with status 1.

**Build/Dev:**
- No build tool is used for the dashboard.
- Nodemon `^3.1.14` is installed as a dev dependency but no `dev` script currently uses it.

## Key Dependencies

**Critical:**
- `express` - Defines the API server, middleware, and route handlers in `api/index.js`.
- `cors` - Enables cross-origin browser requests from the dashboard.
- `lodash` - Used by `getSortedUsers()` in `api/index.js` to sort users by name.

**Infrastructure:**
- Node.js built-ins - `process.env.PORT` configures the API port.
- Browser `fetch()` - Connects the dashboard to `http://localhost:3100`.

## Configuration

**Environment:**
- API port is configured through `PORT`; documentation expects `PORT=3100 npm start`.
- If `PORT` is not set, `api/index.js` falls back to `3000`.
- The dashboard API base URL is hardcoded as `http://localhost:3100` in `dashboard/app.js`.

**Build:**
- No compiler, bundler, lint config, or formatter config is present.
- Static dashboard files can be served directly with `python3 -m http.server 5173`.

## Platform Requirements

**Development:**
- macOS/Linux/Windows should work if Node.js, npm, and Python 3 are available.
- Ports `3100` and `5173` should be free for the documented local setup.

**Production:**
- No production deployment target is defined.
- The project is framed as a local educational lab, not a production service.

---

*Stack analysis: 2026-05-26*
*Update after major dependency, runtime, or tooling changes*
