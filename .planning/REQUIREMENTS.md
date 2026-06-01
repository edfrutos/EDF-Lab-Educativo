# Requirements: EDF Lab Educativo

**Defined:** 2026-06-01
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v1.5 Requirements

Requirements for **Production Auth & Deployment**. Phases start at **18**.

### Authentication (API)

- [ ] **AUTH-01**: `accounts` table (email UNIQUE, password_hash) exists in SQLite and PostgreSQL schemas.
- [ ] **AUTH-02**: Empty database seeds one operator account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.
- [ ] **AUTH-03**: `POST /auth/login` validates credentials with bcrypt and sets httpOnly session cookie (JWT).
- [ ] **AUTH-04**: `POST /auth/logout` clears the session cookie.
- [ ] **AUTH-05**: All `/users` routes require authentication; return 401 with JSON error when missing/invalid.
- [ ] **AUTH-06**: `GET /health` and `GET /` remain public (no auth required).
- [ ] **AUTH-07**: CORS allows credentials and explicit origins for ports 5173, 5174, 5175.

### Authentication (Tests & Dev)

- [ ] **AUTH-08**: API tests pass using documented test-only bypass (`AUTH_DISABLED=1`) plus new tests for 401/200 auth paths.
- [ ] **AUTH-09**: OpenAPI spec documents `/auth/login`, `/auth/logout`, and cookie/bearer security for protected routes.

### Authentication (Dashboard)

- [ ] **AUTH-10**: Vanilla dashboard has login form and logout control; stores session via httpOnly cookie (`credentials: 'include'`).
- [ ] **AUTH-11**: Dashboard handles 401 by showing Spanish guidance and prompting login (consistent with existing error UX).
- [ ] **AUTH-12**: README or auth doc notes React/Vue optional apps need the same `credentials: 'include'` pattern.

### Deployment & Secrets

- [ ] **DEPLOY-01**: `api/.env.example` lists all required secrets (`JWT_SECRET`, `ADMIN_*`, `DATABASE_URL`, etc.) with comments.
- [ ] **DEPLOY-02**: `.env` is gitignored; Compose uses `env_file` for API (no secrets baked into images).
- [ ] **DEPLOY-03**: API refuses to start in production mode without `JWT_SECRET` (fail-fast lesson).
- [ ] **DEPLOY-04**: Documentation explains TLS termination at reverse proxy (nginx) vs Node — suitable for lab self-host.

### Learning Documentation

- [ ] **DOCS-01**: New doc `docs/17-authentication.md` explains passwords, JWT, cookies, CORS credentials, and protected fetch.
- [ ] **DOCS-02**: New mission guides login, protected CRUD, logout, and inspecting auth headers/cookies in DevTools.
- [ ] **DOCS-03**: `docs/00-indice.md` and `README.md` updated; auth path marked **advanced** after frameworks.
- [ ] **DOCS-04**: Real auth/CORS/deploy errors recorded in `NOTEBOOK.md`.

## v1.6+ Requirements (Deferred)

- **PROD-03**: OAuth / social login providers
- **PROD-04**: Refresh token rotation and session revocation lists
- **PROD-05**: Rate limiting and brute-force protection middleware
- **PROD-06**: Automated Let's Encrypt / cert-manager flows

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / Google login | Deferred to v1.6+; keep first auth milestone small |
| JWT in localStorage | Teaches XSS risk; httpOnly cookie only in v1.5 |
| Full RBAC / multi-tenant | Single operator role sufficient for lab |
| Auth required on React/Vue apps in v1.5 | Vanilla primary; frameworks get doc appendix only |
| Kubernetes / cloud-specific IaC | Compose + doc patterns sufficient |
| Removing unauthenticated local dev forever | Tests use documented bypass; prod uses secrets |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 18 | Pending |
| AUTH-02 | Phase 18 | Pending |
| AUTH-03 | Phase 18 | Pending |
| AUTH-04 | Phase 18 | Pending |
| AUTH-05 | Phase 18 | Pending |
| AUTH-06 | Phase 18 | Pending |
| AUTH-07 | Phase 18 | Pending |
| AUTH-08 | Phase 18 | Pending |
| AUTH-09 | Phase 18 | Pending |
| AUTH-10 | Phase 19 | Pending |
| AUTH-11 | Phase 19 | Pending |
| AUTH-12 | Phase 19 | Pending |
| DEPLOY-01 | Phase 20 | Pending |
| DEPLOY-02 | Phase 20 | Pending |
| DEPLOY-03 | Phase 20 | Pending |
| DEPLOY-04 | Phase 20 | Pending |
| DOCS-01 | Phase 21 | Pending |
| DOCS-02 | Phase 21 | Pending |
| DOCS-03 | Phase 21 | Pending |
| DOCS-04 | Phase 21 | Pending |

**Coverage:**

- v1.5 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-01 — milestone v1.5*
*Previous milestone: `.planning/milestones/v1.4-REQUIREMENTS.md`*
