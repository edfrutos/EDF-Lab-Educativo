# Pitfalls Research

**Domain:** Adding auth + deploy to open CORS multi-frontend lab  
**Researched:** 2026-06-01  
**Confidence:** HIGH

## Critical Pitfalls

| Pitfall | Warning sign | Prevention | Phase |
|---------|--------------|------------|-------|
| CORS without `credentials: true` | Login succeeds but `/users` 401 | Update `cors({ credentials: true, origin: [...] })` | 18 |
| JWT in localStorage | XSS steals token | httpOnly cookie only in v1.5 | 18–19 |
| `cors()` origin `*` + cookies | Browser blocks Set-Cookie | Explicit origin allowlist | 18 |
| Forgetting to update tests | CI green but no auth coverage | `AUTH_DISABLED=1` in test only + new auth tests | 18 |
| Weak/default `JWT_SECRET` | Token forgery in “prod” | Fail boot if missing when `NODE_ENV=production` | 20 |
| Secrets in git | Keys in compose committed | `.env.example` + gitignore `.env` | 20 |
| Breaking beginner flow | Can't run lab without reading auth doc | Document seed admin + first-login mission step | 21 |

## Integration Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Postgres vs SQLite schema drift | Mirror `accounts` in both schema files |
| Compose nginx still static-only | API env_file mounted; dashboard unchanged |
| OpenAPI out of sync | Update `openapi.yaml` in same phase as routes |

## Operational Pitfalls

| Pitfall | Prevention |
|---------|------------|
| TLS in Node directly | Teach termination at nginx — simpler certs |
| Over-scoping OAuth | Explicit out-of-scope in REQUIREMENTS |

---
*Research for milestone v1.5*
