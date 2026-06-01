# Phase 18: Auth API & Protected Routes - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add API-side authentication for **dashboard operators**: `accounts` table, `POST /auth/login` and `POST /auth/logout`, JWT in an **httpOnly** cookie, middleware protecting all **`/users`** routes. Update CORS for `credentials: true`, extend SQLite/Postgres schemas and seeds, add auth tests to **both** test suites, update OpenAPI.

**Not in this phase:** vanilla dashboard login UI (Phase 19), `.env` production hardening doc (Phase 20), `docs/17-authentication.md` / Mission 14 (Phase 21).

</domain>

<decisions>
## Implementation Decisions

### Milestone baseline (locked — do not re-litigate)

- **D-00a:** Separate **`accounts`** table (operator login) vs existing **`users`** CRUD data.
- **D-00b:** **JWT** stored in **httpOnly** cookie — not `localStorage`.
- **D-00c:** Dependencies: **`bcrypt`**, **`jsonwebtoken`**, **`cookie-parser`** (educational value documented).
- **D-00d:** Phase 18 is **API + tests + OpenAPI only** — no `dashboard/app.js` changes.

### Admin seed

- **D-01:** Initial operator from **`ADMIN_EMAIL`** + **`ADMIN_PASSWORD`** env vars; **`.env.example`** documents lab defaults (`admin@lab.local` / `changeme`).
- **D-02:** Insert admin **only when `accounts` is empty** during `initDb` (same pattern as user seeding).
- **D-03:** Failed login returns **403** with generic Spanish message **«Credenciales inválidas»** (do not reveal whether email exists).
- **D-04:** **bcrypt cost factor 10** (Claude discretion — standard default, note in code comment).

### Tests

- **D-05:** **`AUTH_DISABLED=1`** in `npm test` so existing 32 CRUD tests keep working without per-test login; **document as test-only**, never for production.
- **D-06:** **Additional auth tests** use real login flow (cookie via supertest); cover login success, logout, 401 without cookie, invalid cookie, public routes still 200 (Claude discretion on exact count).
- **D-07:** New auth tests run in **both** `index.test.js` and `index.pg.test.js` (mirror current dual-suite pattern).

### Public vs protected routes

- **D-08:** **Public:** `GET /`, `GET /health`, `GET /about`, `GET /time`, `POST /auth/login`, `POST /auth/logout`.
- **D-09:** **Protected:** all **`/users`** routes (GET list, GET :id, POST, PUT, DELETE).
- **D-10:** Auth routes at **`/auth/login`** and **`/auth/logout`** (Claude discretion — aligns with REQUIREMENTS AUTH-03/04 and OpenAPI).

### Cookie, JWT, CORS

- **D-11:** Cookie name **`edf_session`** (Claude discretion).
- **D-12:** **`JWT_EXPIRES_IN=24h`** for lab sessions.
- **D-13:** **`CORS_ORIGINS`** env var (comma-separated); **`.env.example`** defaults to `http://localhost:5173,http://localhost:5174,http://localhost:5175`.
- **D-14:** `cors({ origin: [...], credentials: true })` — replace bare `cors()`.
- **D-15:** Cookie flags: **`httpOnly: true`**, **`SameSite: 'lax'`**, **`Secure: false`** in development; **`Secure: true`** when `NODE_ENV=production` (Phase 20 may extend TLS story). Rely on same-site `localhost` behavior for cross-port credentialed fetch (Claude discretion — verify in UAT).

### Data layer

- **D-16:** Add `accounts` to **`api/schema.sql`** and **`api/schema.pg.sql`**; auth DB functions in sqlite/pg backends or thin `auth.js` module — planner chooses; **`db.js` router** unchanged for user CRUD exports.
- **D-17:** Seed admin in both backends when `accounts` empty; reuse **`seed.js`** patterns where practical.

### OpenAPI

- **D-18:** Update **`api/openapi.yaml`** with auth paths, `cookieAuth` security scheme, 401/403 on `/users`.

### Claude's Discretion

- File layout (`auth.js` vs inline in `index.js`) — keep `index.js` readable for learners.
- Exact auth test cases beyond minimum (prefer full coverage per D-06).
- JWT payload shape: `{ sub, email }` only.
- Logging on auth failure (single line, no password in logs).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 18 goal and success criteria
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-09
- `.planning/PROJECT.md` — v1.5 milestone intent
- `.planning/research/SUMMARY.md` — stack and pitfall summary
- `.planning/research/PITFALLS.md` — CORS/cookie/test pitfalls

### API & persistence patterns
- `api/index.js` — routes, `parseUserId`, `validateUserPayload`, `module.exports` for tests
- `api/db.js` — SQLite/Postgres router (extend backends, not necessarily this file's exports)
- `api/schema.sql` / `api/schema.pg.sql` — add `accounts` parallel to `users`
- `api/seed.js` — empty-DB seed pattern for users
- `api/index.test.js` / `api/index.pg.test.js` — supertest + `beforeEach` + `initDb`
- `api/openapi.yaml` — contract to update

### Prior phase patterns
- `.planning/phases/12-postgresql-persistence-layer/12-CONTEXT.md` — dual-schema, `DuplicateEmailError`, initDb boundaries

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`parseUserId` / `validateUserPayload`** — unchanged for `/users`; auth is orthogonal middleware.
- **`DuplicateEmailError`** pattern — map auth failures to stable HTTP codes/messages.
- **`module.exports = app`** + **`module.exports.initDb`** — tests call `initDb()` in `beforeEach`; auth seed must run inside `initDb`.
- **`seed.js` + `populateIfEmpty`** — template for “seed only when empty”.

### Established Patterns
- Spanish JSON errors: `{ error: '...' }` with 400/404/409/500 already used.
- Dual persistence: any `accounts` SQL must exist in **both** SQLite and Postgres paths.
- No new abstraction layers unless didactic — match Phase 12 `db.js` router style.

### Integration Points
- Replace `app.use(cors())` with configured CORS before auth routes.
- Register `cookie-parser` before login handler.
- Apply `requireAuth` on `/users` router or per-route after public routes defined.
- `package.json` test script: set `AUTH_DISABLED=1`; auth-specific tests unset or override locally.

</code_context>

<specifics>
## Specific Ideas

- Login failure: user chose **403** (not 401) with generic message — keep consistent in API and future dashboard (Phase 19).
- Tests: **both** bypass flag and real login tests — teaches difference between convenience and verification.
- Public **/about** and **/time** — learners can still demo metadata without logging in.

</specifics>

<deferred>
## Deferred Ideas

- Dashboard login form and `credentials: 'include'` in `fetch()` — **Phase 19**
- `JWT_SECRET` fail-fast in production, Compose `env_file`, TLS nginx doc — **Phase 20**
- `docs/17-authentication.md`, Mission 14, NOTEBOOK auth section — **Phase 21**
- React/Vue login UI — out of v1.5 scope (doc appendix only in Phase 21)
- Password change API, refresh tokens, OAuth — v1.6+ / out of scope

</deferred>

---

*Phase: 18-Auth API & Protected Routes*
*Context gathered: 2026-06-01*
