# Requirements: EDF Lab Educativo

**Defined:** 2026-06-10 (v1.5)
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.5 Requirements

Requirements for the **Authentication & Production Readiness** milestone. Phases start at **18**.

### API Authentication

- [x] **AUTH-01**: `POST /auth/login` accepts `username` and `password` JSON body; returns JWT and expiry on success.
- [x] **AUTH-02**: Credentials validated against `AUTH_USER` and `AUTH_PASSWORD` environment variables (documented as lab-only).
- [x] **AUTH-03**: `AUTH_ENABLED` environment variable (default `false`) toggles auth middleware without code changes.
- [x] **AUTH-04**: When `AUTH_ENABLED=true`, all `/users` routes require valid `Authorization: Bearer <token>`; missing/invalid token returns **401**.
- [x] **AUTH-05**: When `AUTH_ENABLED=true`, `GET /health` and `GET /` remain **public** (no token required).
- [x] **AUTH-06**: JWT signed with `JWT_SECRET` from environment; invalid/expired tokens return **401**.
- [x] **AUTH-07**: Automated tests cover login success/failure and protected routes with auth on/off (`test:sqlite` minimum).

### Dashboard Login

- [x] **AUTH-08**: Vanilla dashboard shows login form when API requires auth and no valid token is stored.
- [x] **AUTH-09**: Successful login stores JWT in `sessionStorage`; logout clears token and returns to login state.
- [x] **AUTH-10**: `fetchJson` (or equivalent) sends `Authorization: Bearer` header when a token exists.
- [x] **AUTH-11**: Dashboard handles **401** from API by clearing stale token and showing login (visible Spanish feedback).
- [x] **AUTH-12**: With `AUTH_ENABLED=false`, dashboard works without login (backward compatible with missions 01–13).

### Production & Learning Material

- [ ] **DEPLOY-01**: `docs/17-autenticacion.md` explains JWT flow, public vs protected routes, 401, and token storage with repo excerpts.
- [ ] **DEPLOY-02**: `docs/18-despliegue.md` covers env vars, secrets, CORS hardening, TLS overview (reverse proxy), and a production checklist.
- [ ] **DEPLOY-03**: `missions/14-login-y-token.md` — login, CRUD with token, Network tab inspection of Bearer header; reto extra for React/Vue.
- [x] **DEPLOY-04**: `api/.env.example` documents `AUTH_ENABLED`, `AUTH_USER`, `AUTH_PASSWORD`, `JWT_SECRET` with security warnings.
- [ ] **DEPLOY-05**: Real auth/deploy integration errors recorded in `NOTEBOOK.md` (CORS + Authorization, wrong secret, expired token).
- [ ] **DEPLOY-06**: OpenAPI spec updated with `/auth/login` and `securitySchemes` for Bearer JWT on protected routes.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 18 | Complete |
| AUTH-02 | Phase 18 | Complete |
| AUTH-03 | Phase 18 | Complete |
| AUTH-04 | Phase 18 | Complete |
| AUTH-05 | Phase 18 | Complete |
| AUTH-06 | Phase 18 | Complete |
| AUTH-07 | Phase 18 | Complete |
| AUTH-08 | Phase 19 | Complete |
| AUTH-09 | Phase 19 | Complete |
| AUTH-10 | Phase 19 | Complete |
| AUTH-11 | Phase 19 | Complete |
| AUTH-12 | Phase 19 | Complete |
| DEPLOY-01 | Phase 20 | Pending |
| DEPLOY-02 | Phase 20 | Pending |
| DEPLOY-03 | Phase 20 | Pending |
| DEPLOY-04 | Phase 18 | Complete |
| DEPLOY-05 | Phase 20 | Pending |
| DEPLOY-06 | Phase 20 | Pending |

**Coverage:** 13/18 requirements complete (Phases 18–19 shipped)

## Out of Scope (v1.5)

| Feature | Reason |
|---------|--------|
| OAuth2 / OIDC / social login | Single-user lab; focus on JWT fundamentals |
| Refresh tokens | Document as next step in doc 18 |
| RBAC / multi-role | CRUD lab does not need roles yet |
| React/Vue login UI (required) | Reto extra in Mission 14; vanilla is primary |
| Real TLS certificates in repo | Conceptual documentation only |
| Kubernetes / cloud PaaS deploy | Compose remains orchestration ceiling |
| `AUTH_ENABLED=true` as default | Would break existing beginner missions |

## Deferred to v1.6+

| Item | Notes |
|------|-------|
| Framework dashboard auth parity | Optional stretch after vanilla ships |
| Rate limiting / brute-force protection | Mention in doc 18 checklist |
| User accounts in database | Lab uses env admin; DB users is a future phase |

---
*Previous milestone requirements archived in `.planning/milestones/v1.4-REQUIREMENTS.md`*
