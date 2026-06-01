# Research Summary — v1.5 Production Auth & Deployment

**Synthesized:** 2026-06-01  
**Milestone:** v1.5  
**Recommendation:** Proceed with JWT + httpOnly cookie + bcrypt; 4 phases (18–21)

## Executive Summary

Add a teachable **operator login** (separate `accounts` table) protecting existing **users CRUD**, using **bcrypt** + **jsonwebtoken** in an **httpOnly cookie** with **CORS credentials** for ports 5173–5175. Follow with **env/secrets discipline** and **TLS-at-nginx** deployment documentation. Keep `AUTH_DISABLED=1` test-only escape hatch; never in production.

## Stack Additions

- `bcrypt`, `jsonwebtoken`, `cookie-parser` (3 deps — justified educational value)
- CORS: explicit origins + `credentials: true`

## Feature Scope for Requirements

**In milestone:** login/logout, protected `/users`, vanilla login UI, env example, compose env_file, auth tests, doc 17, mission 14, NOTEBOOK.

**Out:** OAuth, refresh tokens, RBAC, K8s, localStorage JWT.

## Watch Out For

1. CORS/cookie misconfiguration — #1 learner breakage  
2. Test suite regression — update supertest with cookie or `AUTH_DISABLED`  
3. Secret leakage — `.env` gitignored, example only in repo  

## Suggested Phases

| Phase | Focus |
|-------|--------|
| 18 | Auth API + schema + middleware + tests |
| 19 | Vanilla dashboard login + credentials fetch |
| 20 | Deploy, secrets, Compose env, TLS doc |
| 21 | Learning material (doc, mission, index, NOTEBOOK) |

---
*Feeds REQUIREMENTS.md and gsd-roadmapper*
