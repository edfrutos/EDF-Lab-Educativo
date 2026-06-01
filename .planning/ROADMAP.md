# Roadmap: EDF Lab Educativo

**Current Milestone:** v1.5 Production Auth & Deployment (phases 18–21)

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)
- 🚧 **v1.5 Production Auth & Deployment** — Phases 18–21 (planning)

## Phase Details (v1.5)

### Phase 18: Auth API & Protected Routes

**Goal:** Operator can log in via API; all `/users` endpoints require a valid session; tests and OpenAPI updated.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09

**Success criteria:**

1. `POST /auth/login` with valid admin credentials returns 200 and sets httpOnly cookie.
2. `GET /users` without cookie returns 401; with cookie returns user list as today.
3. `GET /health` and `GET /` work without authentication.
4. `npm test` passes (32 existing + new auth tests) with documented test env.
5. OpenAPI lists auth routes and security on protected endpoints.

**Plans:** 3 plans in 3 waves

| Wave | Plan | Focus |
|------|------|-------|
| 1 | 18-01 | accounts schema, seed, deps |
| 2 | 18-02 | auth.js, index.js, .env.example |
| 3 | 18-03 | tests, OpenAPI, README |

---

### Phase 19: Vanilla Dashboard Login

**Goal:** Learner logs in and out from the primary dashboard; CRUD uses `credentials: 'include'`; 401 UX in Spanish.

**Requirements:** AUTH-10, AUTH-11, AUTH-12

**Success criteria:**

1. Login form submits to `/auth/login`; successful login loads dashboard data.
2. Logout clears session; subsequent `/users` fetch shows login prompt.
3. Network tab shows `Cookie` on API requests after login.
4. README/auth doc mentions React/Vue `credentials` requirement.

**Plans:** TBD (via `/gsd-plan-phase 19`)

---

### Phase 20: Secrets & Deploy Hardening

**Goal:** Learner configures secrets via `.env`, runs Compose with `env_file`, and understands TLS at the proxy.

**Requirements:** DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04

**Success criteria:**

1. Copying `.env.example` → `.env` and setting `JWT_SECRET` allows API start in production mode.
2. API exits with clear error if `JWT_SECRET` missing when `NODE_ENV=production`.
3. `docker compose` stack reads secrets from env file (not committed).
4. Deploy doc describes nginx TLS termination pattern for the lab stack.

**Plans:** TBD (via `/gsd-plan-phase 20`)

---

### Phase 21: Auth & Deploy Learning Material

**Goal:** Doc, mission, index, README, and NOTEBOOK complete the v1.5 learning path.

**Requirements:** DOCS-01, DOCS-02, DOCS-03, DOCS-04

**Success criteria:**

1. `docs/17-authentication.md` published and linked from index.
2. New mission walks login → CRUD → logout → cookie inspection.
3. `NOTEBOOK.md` has at least one real auth/CORS/deploy error entry from implementation.
4. Manual UAT checklist covers vanilla auth path end-to-end.

**Plans:** TBD (via `/gsd-plan-phase 21`)

---

<details>
<summary>✅ v1.4 Frontend Framework Comparison (Phases 15–17) — SHIPPED 2026-06-01</summary>

- [x] **Phase 15: React Dashboard Parity** — `dashboard-react/` on :5174
- [x] **Phase 16: Vue Dashboard Parity** — `dashboard-vue/` on :5175
- [x] **Phase 17: Framework Learning Material** — `docs/16-frameworks.md`, Mission 13

See [.planning/milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md).

</details>

<details>
<summary>✅ v1.3 PostgreSQL Persistence (Phases 12–14) — SHIPPED 2026-06-01</summary>

See [.planning/milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md).

</details>

<details>
<summary>✅ v1.2 Docker & Compose (Phases 9–11) — SHIPPED 2026-05-31</summary>

See [.planning/milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md).

</details>

<details>
<summary>✅ v1.1 SQLite Persistence (Phases 6–8) — SHIPPED 2026-05-30</summary>

See [.planning/milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md).

</details>

<details>
<summary>✅ v1.0 Educational Lab MVP (Phases 1–5) — SHIPPED 2026-05-30</summary>

See [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

## Progress

**Overall (v1.5):** 0/4 phases

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 18. Auth API & Protected Routes | v1.5 | 0/3 | Planned | — |
| 19. Vanilla Dashboard Login | v1.5 | 0/? | Not started | — |
| 20. Secrets & Deploy Hardening | v1.5 | 0/? | Not started | — |
| 21. Auth & Deploy Learning Material | v1.5 | 0/? | Not started | — |

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1–17 | v1.0–v1.4 | Complete | 2026-05-26 → 2026-06-01 |

---
*Roadmap format: GSD v1.5 — phases continue from v1.4 (last: 17)*
