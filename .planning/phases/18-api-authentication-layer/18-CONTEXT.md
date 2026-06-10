# Phase 18: API Authentication Layer - Context

**Gathered:** 2026-06-10
**Status:** Ready for discussion / planning

<domain>
## Phase Boundary

Add **optional JWT authentication** to the Express API. When `AUTH_ENABLED=true`, `/users` routes require a valid Bearer token; when `false` (default), behaviour matches v1.4 exactly.

Deliver: `POST /auth/login`, auth middleware, env configuration, tests, and phase UAT. **No dashboard changes** in this phase (Phase 19).

**Requirements:** AUTH-01 through AUTH-07.

</domain>

<decisions>
## Implementation Decisions (proposed)

### Login endpoint — AUTH-01, AUTH-02
- **D-01:** `POST /auth/login` body: `{ "username": "...", "password": "..." }`.
- **D-02:** Compare against `process.env.AUTH_USER` and `process.env.AUTH_PASSWORD`.
- **D-03:** On success: `{ "token": "<jwt>", "expiresIn": "<seconds or ISO>" }` with HTTP 201 or 200 (pick one in plan; document in OpenAPI).
- **D-04:** On failure: HTTP 401 with Spanish error message (consistent with existing API style).

### JWT — AUTH-06
- **D-05:** Use `jsonwebtoken` package (educational dependency; document in NOTEBOOK).
- **D-06:** Sign with `JWT_SECRET` from env; reasonable expiry (e.g. 1h for lab).
- **D-07:** Payload minimal: `{ sub: username }` — no roles in v1.5.

### Middleware — AUTH-03, AUTH-04, AUTH-05
- **D-08:** `AUTH_ENABLED` parsed as boolean; default `false` when unset.
- **D-09:** When enabled, apply middleware to all `/users` routes (GET list, GET :id, POST, PUT, DELETE).
- **D-10:** When enabled, **do not** protect `GET /health`, `GET /`, `GET /about`, `GET /time`.
- **D-11:** Missing header → 401 `{ error: "..." }`; invalid/expired token → 401.

### Configuration — DEPLOY-04 (partial)
- **D-12:** Add `api/.env.example` with all auth vars and prominent "solo laboratorio" warning.
- **D-13:** Document loading `.env` — if not using dotenv package, document `export VAR=...` in shell (prefer **no** dotenv dep unless plan justifies it).

### Tests — AUTH-07
- **D-14:** Extend `index.test.js` with auth-off regression (existing 16 tests pass).
- **D-15:** Auth-on suite: login ok/fail, GET /users without token → 401, with token → 200.
- **D-16:** Use env override in test setup (same pattern as `DB_FILE` isolation).

### Claude's Discretion
- Exact file split (`auth.js` middleware module vs inline in `index.js`).
- Whether `GET /auth/me` is added as teaching endpoint (optional, not required).
- HTTP status for successful login (200 vs 201).

</decisions>

<constraints>
## Constraints

- No breaking changes when `AUTH_ENABLED=false`.
- CORS must continue to work; plan must note `Authorization` header for Phase 19.
- SQLite and Postgres test paths both pass with auth off.
- Keep Spanish error messages for learner-facing responses.

</constraints>
