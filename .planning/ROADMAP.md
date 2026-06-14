# Roadmap: EDF Lab Educativo

**Current Milestone:** v1.6 Framework Auth & CI (planning)

## Milestones

- ✅ **v1.0 Educational Lab MVP** — Phases 1–5 (shipped 2026-05-30)
- ✅ **v1.1 SQLite Persistence** — Phases 6–8 (shipped 2026-05-30)
- ✅ **v1.2 Docker & Compose** — Phases 9–11 (shipped 2026-05-31)
- ✅ **v1.3 PostgreSQL Persistence** — Phases 12–14 (shipped 2026-06-01)
- ✅ **v1.4 Frontend Framework Comparison** — Phases 15–17 (shipped 2026-06-01)
- ✅ **v1.5 Production Auth & Deployment** — Phases 18–21 (shipped 2026-06-02)
- 🚧 **v1.6 Framework Auth & CI** — Phases 22–25 (in progress)

## Phases

### 🚧 v1.6 Framework Auth & CI (Phases 22–25)

**Goal:** Auth parity on React/Vue dashboards, automated CI on push, and basic login rate limiting — completing the three-frontend auth story started in v1.5.

| Phase | Name | Goal | Requirements | Plans |
|-------|------|------|--------------|-------|
| 22 | React Dashboard Auth | Login gate, credentialed fetch, logout, 401 UX on :5174 | FRWK-AUTH-01 … 04 | 0/2 → planned |
| 23 | Vue Dashboard Auth | Same auth parity on :5175 | FRWK-AUTH-05 … 06 | 0/2 |
| 24 | CI & Rate Limiting | GitHub Actions + login rate limit with env config | CI-01 … 02, RATE-01 … 02 | 0/2 |
| 25 | Framework Auth Learning Material | Doc 16 auth section, Mission 15, index, NOTEBOOK | DOCS-01 … 04 | 0/2 |

#### Phase 22: React Dashboard Auth

**Goal:** Learner logs in and out from the React dashboard; CRUD uses `credentials: 'include'`; 401 UX matches vanilla patterns.

**Requirements:** FRWK-AUTH-01, FRWK-AUTH-02, FRWK-AUTH-03, FRWK-AUTH-04

**Success criteria:**
1. Unauthenticated visit to `http://localhost:5174` shows login form; CRUD UI hidden until login succeeds.
2. All React API calls include `credentials: 'include'`; session cookie persists across refresh.
3. Logout clears session and returns to login form without page reload errors.
4. 401 responses show Spanish guidance pointing to login (consistent with vanilla).

**Plans:** 2 (auth UI + api.js integration)

---

#### Phase 23: Vue Dashboard Auth

**Goal:** Vue dashboard achieves the same auth behavior as React and vanilla on port 5175.

**Requirements:** FRWK-AUTH-05, FRWK-AUTH-06

**Success criteria:**
1. Unauthenticated visit to `http://localhost:5175` shows login form; CRUD gated until authenticated.
2. Vue `fetchJson` sends `credentials: 'include'` on every request.
3. Logout works; 401 UX matches React/vanilla Spanish messages.

**Plans:** 2 (auth UI + api.js integration)

---

#### Phase 24: CI & Rate Limiting

**Goal:** Tests run automatically on push; login endpoint resists brute-force attempts with teachable rate limiting.

**Requirements:** CI-01, CI-02, RATE-01, RATE-02

**Success criteria:**
1. GitHub Actions workflow on `main` push runs SQLite test suite and reports pass/fail.
2. README or docs explain optional Postgres CI step for advanced learners.
3. Repeated rapid `POST /auth/login` returns HTTP 429 with JSON error body.
4. Rate limit window/max documented in `api/.env.example` comments (no secret patterns).

**Plans:** 2 (CI workflow + rate limit middleware)

---

#### Phase 25: Framework Auth Learning Material

**Goal:** Documentation and missions complete the v1.6 learning path for three-dashboard auth comparison.

**Requirements:** DOCS-01, DOCS-02, DOCS-03, DOCS-04

**Success criteria:**
1. `docs/16-frameworks.md` includes auth comparison (login gate, credentials, logout) across vanilla/React/Vue.
2. Mission 15 walks login → CRUD → logout on a framework dashboard with DevTools cookie inspection.
3. Index and framework READMEs link auth + CI sections; root README mentions CI workflow.
4. At least two real framework-auth or CI friction points recorded in `NOTEBOOK.md`.

**Plans:** 2 (docs/mission + index/README/NOTEBOOK)

---

<details>
<summary>✅ v1.5 Production Auth & Deployment (Phases 18–21) — SHIPPED 2026-06-02</summary>

- [x] **Phase 18: Auth API & Protected Routes**
- [x] **Phase 19: Vanilla Dashboard Login**
- [x] **Phase 20: Secrets & Deploy Hardening**
- [x] **Phase 21: Auth & Deploy Learning Material**

See [.planning/milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md).

</details>

<details>
<summary>✅ v1.4 Frontend Framework Comparison (Phases 15–17) — SHIPPED 2026-06-01</summary>

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

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 22. React Dashboard Auth | v1.6 | 2/2 | Complete | 2026-06-02 |
| 23. Vue Dashboard Auth | v1.6 | 0/2 | Planned | — |
| 24. CI & Rate Limiting | v1.6 | 0/2 | Not started | — |
| 25. Framework Auth Learning Material | v1.6 | 0/2 | Not started | — |
| 18–21 | v1.5 | 9/9 | Complete | 2026-06-02 |
| 1–17 | v1.0–v1.4 | — | Complete | 2026-05-26 → 2026-06-01 |

---
*Roadmap format: GSD — phase numbering continues across milestones*
