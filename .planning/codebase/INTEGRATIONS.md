# External Integrations

**Analysis Date:** 2026-05-26

## APIs & External Services

**Local Express API:**
- The dashboard consumes a local API at `http://localhost:3100`.
  - Client: browser `fetch()` in `dashboard/app.js`.
  - Auth: none.
  - Endpoints used by dashboard: `GET /health`, `GET /`, `GET /users`.

**External APIs:**
- None currently.
- The API data is in memory inside `api/index.js`; it does not call third-party services.

## Data Storage

**Databases:**
- None currently.
- User records are stored in the `users` array in `api/index.js`.
- Data resets when the Node process restarts.

**File Storage:**
- None currently.
- The future roadmap mentions `data/users.json`, but it is not implemented yet.

**Caching:**
- None currently.
- No Redis, in-process cache abstraction, browser storage, or service worker is present.

## Authentication & Identity

**Auth Provider:**
- None currently.
- All API routes are public and unauthenticated.

**OAuth Integrations:**
- None currently.

## Monitoring & Observability

**Error Tracking:**
- None currently.
- The Express error middleware logs unexpected errors with `console.error(err.stack)`.

**Analytics:**
- None currently.

**Logs:**
- Local console logging only.
- API startup logs `Server is running on port ${PORT}` from `api/index.js`.

## CI/CD & Deployment

**Hosting:**
- None configured.
- Local API server is started with `PORT=3100 npm start`.
- Local dashboard server is started with `python3 -m http.server 5173`.

**CI Pipeline:**
- No GitHub Actions or other CI pipeline is configured.
- `.github/copilot-instructions.md` exists, but no workflow files are present.

## Environment Configuration

**Development:**
- Required env vars: none strictly required.
- Recommended env vars: `PORT=3100` to match documentation and dashboard.
- Secrets location: no secrets are required.
- Mock/stub services: not needed; all data is local and in memory.

**Staging:**
- Not defined.

**Production:**
- Not defined.

## Webhooks & Callbacks

**Incoming:**
- None currently.

**Outgoing:**
- None currently.

---

*Integration audit: 2026-05-26*
*Update when adding external APIs, persistence, auth, deployment, or CI*
