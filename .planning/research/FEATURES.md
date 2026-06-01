# Features Research

**Domain:** Auth + production deploy for beginner full-stack lab  
**Researched:** 2026-06-01  
**Confidence:** HIGH

## Table Stakes (must have)

| Feature | Expected behavior | Complexity |
|---------|-------------------|------------|
| Login endpoint | `POST /auth/login` with email/password → 200 + httpOnly cookie | Medium |
| Logout | `POST /auth/logout` clears cookie | Low |
| Protected CRUD | All `/users` routes return 401 without valid session | Medium |
| Public health | `GET /health`, `GET /` stay public for ops checks | Low |
| Password hashing | Never store plaintext; bcrypt cost factor documented | Low |
| Env secrets | `JWT_SECRET`, admin seed creds via env — `.env.example` only | Low |
| Dashboard login UI | Form on vanilla dashboard; redirect/guard when 401 | Medium |
| Test matrix update | Existing 32 tests pass with test auth bypass flag | Medium |

## Differentiators (educational value)

| Feature | Why include |
|---------|-------------|
| Dual feedback on 401 | Dashboard shows Spanish message + link to login (mirrors 409 pattern) |
| `credentials: 'include'` lesson | Makes CORS + cookies visible in Network tab |
| AUTH_DISABLED dev escape hatch | Teaches why prod must not use it |
| Framework appendix | Short section in auth doc: React/Vue same cookie rules |

## Anti-features (defer / out of scope)

| Feature | Reason |
|---------|--------|
| Refresh tokens / rotation | Too much for first auth milestone |
| RBAC / roles | Single admin role sufficient |
| Rate limiting | Mention in deploy doc, don't implement |
| mTLS | Out of beginner scope |
| Full Let's Encrypt automation | Document manual/cert paths only |

## Dependencies on Existing Features

- OpenAPI spec must gain `/auth/login`, `/auth/logout`, security scheme
- Missions 01–02 still valid; new mission chains after login
- Compose stack: pass `JWT_SECRET` via `env_file`

---
*Research for milestone v1.5*
