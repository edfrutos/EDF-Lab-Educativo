# Phase 18 Pattern Map

**Mapped:** 2026-06-10

## New Files → Closest Analogs

| New file | Analog | Pattern to reuse |
|----------|--------|------------------|
| `api/auth.js` | `api/db.js` | Separate concern module; exported functions; env-driven behaviour |
| `api/index.auth.test.js` | `api/index.test.js` | Env vars **before** `require('./index')`; supertest; `beforeEach` + `initDb` |
| `api/.env.example` | `docker-compose.yml` env blocks | Document fictional lab credentials with warnings |

## Existing Assets

- `api/index.js` — route handlers, Spanish `{ error }` responses, `module.exports = app`
- `api/index.test.js` — 16 tests; `process.env.DB_FILE` before require; `delete DATABASE_URL`
- `api/openapi.yaml` — paths/responses pattern for new `/auth/login`
- `api/package.json` — `test:sqlite` script to extend

## Integration Points

```
index.js
  ├── cors() + express.json() (unchanged)
  ├── POST /auth/login → auth.loginHandler
  ├── GET /, /health, /about, /time (public)
  └── app.use('/users', auth.requireAuth, usersRouter)
        ├── GET /
        ├── GET /:id
        ├── POST /
        ├── PUT /:id
        └── DELETE /:id

startServer()
  ├── auth.validateAuthConfig()  // fail-fast if AUTH_ENABLED=true
  └── initDb() → listen
```

## Code Excerpt — isAuthEnabled

```javascript
function isAuthEnabled() {
  return process.env.AUTH_ENABLED === 'true';
}
```

## Code Excerpt — requireAuth

```javascript
function requireAuth(req, res, next) {
  if (!isAuthEnabled()) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o caducado.' });
  }
}
```

## Code Excerpt — Test env isolation

```javascript
// index.auth.test.js — BEFORE require('./index')
process.env.AUTH_ENABLED = 'true';
process.env.AUTH_USER = 'admin';
process.env.AUTH_PASSWORD = 'lab-dev-only';
process.env.JWT_SECRET = 'test-secret-min-32-chars-for-jwt!!';
```

## Code Excerpt — index.test.js guard (regression)

```javascript
delete process.env.AUTH_ENABLED;
```
