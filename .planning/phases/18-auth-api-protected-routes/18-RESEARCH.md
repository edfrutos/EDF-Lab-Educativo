# Phase 18 Research: Auth API & Protected Routes

**Researched:** 2026-06-01
**Phase:** 18-auth-api-protected-routes
**Focus:** accounts table, JWT httpOnly cookie, CORS credentials, dual-backend auth, test bypass

## Summary

Phase 18 adds **operator authentication** without changing the `users` CRUD contract. A new **`accounts`** table stores bcrypt hashes; **`POST /auth/login`** sets cookie **`edf_session`** (JWT); **`requireAuth`** guards all `/users` routes. Milestone research (`.planning/research/SUMMARY.md`) applies; this file adds **file-level** guidance for this repo.

## Key Findings

### 1. Module layout (D-16, discretion)

| Module | Responsibility |
|--------|----------------|
| `api/auth.js` | JWT sign/verify, cookie options, `requireAuth`, `loginHandler`, `logoutHandler` |
| `api/seed.js` | `seedAdminIfEmptyAccounts(db)` — called from both `initDb` paths |
| `api/db-sqlite.js` / `api/db-pg.js` | `findAccountByEmail`, `countAccounts` (minimal SQL) |
| `api/index.js` | Wire CORS, `cookie-parser`, public vs protected routes |

Keep **`db.js` exports** for user CRUD only; export account helpers from `db-sqlite`/`db-pg` and require directly in `auth.js` OR re-export from `db.js` as `findAccountByEmail` — planner chose explicit requires in `auth.js` from backend modules to avoid bloating `db.js`.

### 2. Environment variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Sign JWT | long random string in `.env` |
| `JWT_EXPIRES_IN` | Token TTL | `24h` (CONTEXT D-12) |
| `ADMIN_EMAIL` | Seed operator | `admin@lab.local` |
| `ADMIN_PASSWORD` | Seed plaintext (hashed at insert) | `changeme` |
| `CORS_ORIGINS` | Comma-separated origins | `http://localhost:5173,...` |
| `AUTH_DISABLED` | **Test only** — skip `requireAuth` | `1` in `npm test` |

Phase 18: if `JWT_SECRET` unset in dev, use documented dev default with `console.warn` (fail-fast in production → Phase 20).

### 3. HTTP semantics (CONTEXT)

| Situation | Status | Body |
|-----------|--------|------|
| Missing/invalid session on `/users` | **401** | `{ error: '...' }` Spanish |
| Wrong email/password on login | **403** | `{ error: 'Credenciales inválidas' }` |
| Success login | **200** | `{ message, email }` + Set-Cookie |

### 4. CORS (D-14, D-15)

```javascript
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Cookie: `{ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: ... }`

### 5. Tests (D-05, D-06, D-07)

- `package.json` `"test"` prefix: `AUTH_DISABLED=1` (cross-platform: use `cross-env` only if already in project — **avoid new dep**; document `AUTH_DISABLED=1 npm test` for Windows or set in test files at top).

**macOS/Linux:** `AUTH_DISABLED=1 node --test ...`

**Pattern:** At top of `index.test.js` / `index.pg.test.js`:
```javascript
process.env.AUTH_DISABLED = '1';
```

New `describe('Autenticación API', ...)` block **deletes** `AUTH_DISABLED` in `before` and restores in `after`.

Auth tests use `request(app).post('/auth/login').send({ email, password })` then `.set('Cookie', res.headers['set-cookie'])` on subsequent requests.

### 6. OpenAPI (D-18)

- Paths: `/auth/login`, `/auth/logout`
- `components.securitySchemes.cookieAuth` type apiKey in cookie `edf_session`
- Apply `security: [{ cookieAuth: [] }]` on `/users` operations
- Responses: 401 on protected routes, 403 on login failure

## Dependencies

```bash
cd api && npm install bcrypt jsonwebtoken cookie-parser
```

Versions: `bcrypt@^5`, `jsonwebtoken@^9`, `cookie-parser@^1`.

## Out of Scope (Phase 18)

- `dashboard/app.js` changes
- `JWT_SECRET` production fail-fast (Phase 20)
- `docs/17-authentication.md` (Phase 21)

---
*Phase 18 research — feeds 18-01..03 plans*
