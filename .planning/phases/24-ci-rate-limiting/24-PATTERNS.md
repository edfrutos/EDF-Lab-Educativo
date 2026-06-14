# Phase 24 Patterns

Maps new CI/rate-limit files to closest analogs in the codebase.

| New artifact | Closest analog | Notes |
|--------------|----------------|-------|
| `auth.js` `createLoginRateLimiter()` | `requireAuth` middleware in `auth.js` | Export factory; compose on route in `index.js` |
| `index.js` route wiring | `app.use('/users', requireAuth)` | Per-route middleware, not global |
| `test-auth-helpers.js` 429 test | Existing `POST /auth/login` 403 test | Same `request(app).post('/auth/login')` pattern |
| `.github/workflows/ci.yml` | None (greenfield) | Standard Node GH Actions; `working-directory: api` |
| `api/.env.example` rate vars | Existing `JWT_EXPIRES_IN`, `CORS_ORIGINS` blocks | Comment-only docs, grouped under `# --- Rate limiting ---` |
| `docs/10-tests.md` CI section | Existing scripts table | Append section; link from README |

## Middleware composition pattern

```
cors → cookieParser → express.json → [routes]
POST /auth/login → loginRateLimiter → loginHandler   ← new
POST /auth/logout → logoutHandler
/users → requireAuth → CRUD handlers
```

## Error response pattern

All API errors use `{ error: "mensaje en español" }`. Rate limit 429 follows same shape (not plain text).

## Test env override pattern

```javascript
const prevMax = process.env.LOGIN_RATE_LIMIT_MAX;
process.env.LOGIN_RATE_LIMIT_MAX = '2';
// ... assertions ...
process.env.LOGIN_RATE_LIMIT_MAX = prevMax;
```

Recreate limiter by re-requiring module OR export factory called at route registration time (app loads once — test sets env **before** app import, or use dynamic limiter reading env on each request). **Recommended:** factory reads `process.env` at call time in `index.js` at startup; for 429 test, set env before `require('../index')` in dedicated test OR add `resetLoginRateLimiterForTests()` — simpler approach: **separate small test file** `rate-limit.test.js` that sets env before requiring app.

**Simplest didactic approach:** Export `createLoginRateLimiter` from auth.js; in `rate-limit.test.js`, set `LOGIN_RATE_LIMIT_MAX=2` before requiring index.js (index.test.js already requires app at top — add 429 test in test-auth-helpers with note that limiter is created at module load). 

**Fix for module-load timing:** `createLoginRateLimiter()` called inside `index.js` at listen time, not at module top — OR read env inside getter on each request via `max: () => Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10` if express-rate-limit supports function max (v7 supports `max` as number only; use `skip` or separate test file that imports fresh app).

**Pragmatic plan decision:** Add `rate-limit.test.js` that:
1. Sets `LOGIN_RATE_LIMIT_MAX=2` and `LOGIN_RATE_LIMIT_WINDOW_MS=60000`
2. Deletes `require.cache` for `./index.js` and `./auth.js`
3. Requires fresh `app` from index
4. Fires 3 login attempts, asserts 429 on third

This matches educational "understand module caching" without over-engineering.
