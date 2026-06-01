# Phase 18: Auth API & Protected Routes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `18-CONTEXT.md`.

**Date:** 2026-06-01
**Phase:** 18 — Auth API & Protected Routes
**Areas discussed:** Semilla admin, Estrategia de tests, Rutas públicas, Cookie + CORS

---

## Semilla admin

| Option | Description | Selected |
|--------|-------------|----------|
| Solo env | ADMIN_EMAIL/PASSWORD sin defaults en código | |
| Env + .env.example | Valores de lab documentados | ✓ |
| Fijas en README | Mismas credenciales para todos | |

| Option | Description | Selected |
|--------|-------------|----------|
| Solo si accounts vacía | En initDb | ✓ |
| Recrear si falta email | En cada arranque | |
| Manual/script | API no crea admin | |

| Option | Description | Selected |
|--------|-------------|----------|
| bcrypt cost 10 | Default librería | |
| bcrypt cost 12 | Más lento, didáctico | |
| Tú decides | | ✓ → cost 10 |

| Option | Description | Selected |
|--------|-------------|----------|
| 401 genérico | Credenciales inválidas | |
| 401 específico | Por campo | |
| 403 genérico | | ✓ |

**User's choice:** Env + example defaults; seed when empty; 403 generic; bcrypt cost delegated.

---

## Estrategia de tests

| Option | Description | Selected |
|--------|-------------|----------|
| AUTH_DISABLED=1 | Solo bypass en npm test | |
| Helper login | Cookie reutilizada | |
| Ambos | Bypass + tests login real | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Tests mínimos | 401 + 200 tras login | |
| Tests completos | login/logout/401/cookie/rutas públicas | |
| Tú decides | | ✓ → cobertura completa preferida |

| Option | Description | Selected |
|--------|-------------|----------|
| Ambas suites | SQLite + Postgres | ✓ |
| Solo SQLite | | |
| Módulo compartido | | |

---

## Rutas públicas

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo | Solo auth + / + health | |
| /about y /time públicas | users* protegido | ✓ |
| Todos GET públicos | | |

| Option | Description | Selected |
|--------|-------------|----------|
| /auth/login, /auth/logout | REQUIREMENTS | ✓ (discreción) |
| /login, /logout raíz | | |
| Tú decides | | |

---

## Cookie + CORS

| Option | Description | Selected |
|--------|-------------|----------|
| edf_session | Nombre explícito | ✓ (discreción) |
| token | | |
| Tú decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Puertos fijos 5173–5175 | | |
| CORS_ORIGINS env | | ✓ (discreción) |
| Tú decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| SameSite Lax | | ✓ (discreción, Secure prod) |
| None dev | | |
| Tú decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| 8h JWT | | |
| 24h JWT | | ✓ |
| Tú decides | | |

---

## Claude's Discretion

- bcrypt cost **10**
- Cookie **`edf_session`**
- **`CORS_ORIGINS`** con defaults en `.env.example`
- Rutas **`/auth/*`**
- SameSite **Lax**, Secure en producción
- Auth test suite **completa** (login, logout, 401, cookie inválida, rutas públicas)

## Deferred Ideas

- Dashboard UI, deploy docs, learning material — phases 19–21
- OAuth, refresh tokens — v1.6+
