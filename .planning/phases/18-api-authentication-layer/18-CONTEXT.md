# Phase 18: API Authentication Layer - Context

**Gathered:** 2026-06-10  
**Discussed:** 2026-06-10 (`18-DISCUSSION-LOG.md`)  
**Planned:** 2026-06-10 (`18-01-PLAN.md` … `18-03-PLAN.md`)  
**Status:** Ready for execution

<domain>
## Phase Boundary

Add **optional JWT authentication** to the Express API. When `AUTH_ENABLED=true`, `/users` routes require a valid Bearer token; when `false` (default), behaviour matches v1.4 exactly.

Deliver: `POST /auth/login`, auth middleware, env configuration, tests, and phase UAT. **No dashboard changes** in this phase (Phase 19).

**Requirements:** AUTH-01 through AUTH-07.

</domain>

<decisions>
## Implementation Decisions

### Module layout
- **D-01:** New **`api/auth.js`** — `isAuthEnabled()`, `requireAuth`, `loginHandler`, JWT sign/verify helpers (mirror `db.js` separation).
- **D-02:** Export test helpers from `auth.js` if needed (`signToken`); keep `index.js` changes minimal.

### Login endpoint — AUTH-01, AUTH-02
- **D-03:** `POST /auth/login` body: `{ "username": "...", "password": "..." }`.
- **D-04:** Compare against `process.env.AUTH_USER` and `process.env.AUTH_PASSWORD` (plaintext lab only).
- **D-05:** Success: HTTP **200** with `{ "token": "<jwt>", "expiresIn": 3600 }` (seconds).
- **D-06:** Wrong credentials: HTTP **401** `{ "error": "Credenciales incorrectas." }`.
- **D-07:** Missing fields: HTTP **400** with Spanish validation message.
- **D-08:** When `AUTH_ENABLED=false`: HTTP **404** `{ "error": "La autenticación no está activada (AUTH_ENABLED=false)." }`.

### JWT — AUTH-06
- **D-09:** Dependency **`jsonwebtoken`** in `dependencies`.
- **D-10:** Sign with `JWT_SECRET`; expiry **1 hour** (`expiresIn: '1h'` in `jwt.sign`).
- **D-11:** Payload minimal: `{ sub: username }` — no roles in v1.5.

### Middleware — AUTH-03, AUTH-04, AUTH-05
- **D-12:** `AUTH_ENABLED` true only when `process.env.AUTH_ENABLED === 'true'`; default false when unset.
- **D-13:** `requireAuth` no-op when auth disabled.
- **D-14:** When enabled: mount **`usersRouter`** at `/users` behind `requireAuth` (all CRUD routes).
- **D-15:** When enabled, keep **public**: `GET /`, `GET /health`, `GET /about`, `GET /time`, `POST /auth/login`.
- **D-16:** Missing Bearer → **401** `{ "error": "Token no proporcionado." }`; invalid/expired → **401** `{ "error": "Token inválido o caducado." }`.

### Startup & configuration — DEPLOY-04 (partial)
- **D-17:** **Fail-fast** on `startServer()` when `AUTH_ENABLED=true` and any of `JWT_SECRET`, `AUTH_USER`, `AUTH_PASSWORD` is missing.
- **D-18:** Add **`api/.env.example`** with all auth vars and "solo laboratorio" warning.
- **D-19:** **No `dotenv`** — document `export VAR=...` in shell and README/api docs.

### CORS
- **D-20:** No CORS code change unless `18-UAT` proves otherwise; verify `Authorization` header in manual checklist.

### Tests — AUTH-07
- **D-21:** New **`api/index.auth.test.js`**; chain in `npm run test:sqlite`.
- **D-22:** Set `AUTH_*` env in `beforeEach`/`afterEach` **before** `require('./index')` in auth suite (or re-require pattern documented in plan).
- **D-23:** Cases: login ok/fail, `/users` 401 without token, `/users` 200 with Bearer; existing **16/16** pass unchanged with auth off.
- **D-24:** Postgres auth tests **out of scope** for Phase 18.

### OpenAPI & discovery
- **D-25:** Update **`GET /` endpoints list** to include `POST /auth/login`.
- **D-26:** Plan **18-03**: draft `/auth/login` in `openapi.yaml`; full `securitySchemes` deferred to Phase 20 (DEPLOY-06).

### Explicitly out of scope (Phase 18)
- **D-27:** No `GET /auth/me` (reto extra in doc 17).
- **D-28:** No `bcryptjs`; no dashboard changes; no NOTEBOOK section yet.

### Claude's Discretion
- Exact `usersRouter` refactor vs per-route middleware.
- Whether auth tests use `delete require.cache` to reload app per file.
- Wording of fail-fast console message on startup.

</decisions>

<constraints>
## Constraints

- No breaking changes when `AUTH_ENABLED=false`.
- SQLite and Postgres test paths both pass with auth off.
- Keep Spanish error messages for learner-facing responses.
- CORS must continue to work; `Authorization` noted for Phase 19.

</constraints>
