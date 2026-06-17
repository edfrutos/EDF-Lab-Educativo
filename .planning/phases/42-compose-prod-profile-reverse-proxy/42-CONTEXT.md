# Phase 42: Compose prod profile & reverse proxy - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a **Compose `prod` profile** with a dedicated **edge nginx** (`edf-lab-proxy`) as the single public entry point on **`:443`**, serving the static dashboard and proxying **`/api/*`** to Express with prefix stripping. Preserve the existing **host dev path** (`PORT=3100` API + `python3 -m http.server 5173` with `http://localhost:3100`).

Phase 42 establishes **proxy structure** and **same-origin `/api`** for the dashboard. **TLS hardening**, **`trust proxy`**, and **Secure cookie verification** belong to phase 43. **Let's Encrypt scripts** belong to phase 44. **Full docs/mission/NOTEBOOK** closure belongs to phase 45.

Requirements in scope: **PROD-02**, **PROD-04**, **PROD-06**.

</domain>

<decisions>
## Implementation Decisions

### Edge topology (Compose prod)
- **D-01:** Add a **new service** `edf-lab-proxy` — dedicated nginx edge. Do **not** fold `/api` proxy into `edf-lab-dashboard` nginx (keeps static vs edge responsibilities teachable).
- **D-02:** Canonical command: **`docker compose --profile prod up`** (Compose `profiles: [prod]` on proxy and related prod-only wiring).
- **D-03:** In **`prod` profile**, **do not publish** `:3100` or `:5173` on the host — only the proxy **`:443`** is exposed. API and dashboard remain reachable on the Docker internal network.
- **D-04:** Proxy listens on **`:443`** in phase 42 with a **minimal self-signed / placeholder** certificate so the stack is runnable; phase 43 replaces/hardens TLS material and documents browser trust warnings.

### API routing (`/api` → Express)
- **D-05:** Use **prefix strip** at nginx: `/api/health` → `http://edf-lab-api:3100/health`. **No changes** to Express route paths in phase 42.
- **D-06:** Auth and OAuth paths follow the **same strip rule** (`/api/auth/login`, `/api/auth/oauth/start`, etc.).
- **D-07:** Phase 42 sends **basic headers** only: `Host`, `X-Forwarded-Proto` (and whatever nginx needs for proxy_pass). Full **`trust proxy`** in Express is **phase 43**.
- **D-08:** Prod dashboard is **same-origin** via `/api` — learners should not rely on cross-origin CORS in prod mode (dev host path keeps existing CORS whitelist).

### Dashboard `API_BASE_URL`
- **D-09:** Prod dashboard uses **`API_BASE_URL = '/api'`** (relative base for `fetchJson`).
- **D-10:** **Host dev unchanged:** `dashboard/app.js` default remains **`http://localhost:3100`** when served via `python3 -m http.server 5173` (PROD-04).
- **D-11:** Implement prod `/api` via **prod dashboard image/build** (e.g. Docker build arg or prod-stage file) without breaking the host-dev file learners edit daily.
- **D-12:** UI label `#api-base-url` shows **`/api`** in prod (didactic honesty about same-origin routing).
- **D-13:** **OAuth mock** must work in prod profile via **`/api/auth/oauth/...`** (same fetch pattern as login).

### Phase 42 vs 43 (HTTP/TLS)
- **D-14:** Phase 42 = **structure + minimal TLS on :443**; phase 43 = **TLS trust story + `Secure` cookies + `NODE_ENV=production` verification**.
- **D-15:** Do **not** block phase 42 on full cookie-`Secure` E2E — smoke in 42 focuses on **routing and same-origin API reachability**; auth Secure verification moves to 43.

### Out of scope (phase 42)
- **D-16:** certbot / Let's Encrypt scripts (phase 44).
- **D-17:** Kubernetes, WAF, rate limiting at edge.
- **D-18:** React/Vue prod proxy parity (vanilla + Compose prod only).
- **D-19:** Mounting Express under `/api` in application code (rejected — strip at nginx).

### Claude's Discretion
- Exact nginx config file layout (`deploy/nginx/` vs `proxy/` folder naming).
- Whether prod dashboard is a separate Dockerfile stage or build-arg on existing `dashboard/Dockerfile`.
- Minimal self-signed cert generation approach (script vs checked-in dev-only cert with clear warnings).
- Phase 42 smoke test surface (curl through proxy vs lightweight Playwright) as long as success criteria are met.
- How much of `docs/18-production-deploy.md` to touch in 42 vs deferring bulk updates to phase 45.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 42 goal and success criteria
- `.planning/REQUIREMENTS.md` — PROD-02, PROD-04, PROD-06
- `.planning/PROJECT.md` — v2.5 dual-mode constraint

### Compose & nginx baseline
- `docker-compose.yml` — current three-service stack (`edf-lab-postgres`, `edf-lab-api`, `edf-lab-dashboard`)
- `dashboard/Dockerfile` — dashboard image build
- `dashboard/nginx.conf` — static file server only today (port 5173 internal)
- `docs/14-docker-compose.md` — Compose learning path
- `docs/18-production-deploy.md` — TLS termination diagram, deferred LE/proxy notes

### Dashboard ↔ API contract
- `dashboard/app.js` — `API_BASE_URL`, `fetchJson`, auth/OAuth paths
- `api/index.js` — route list, CORS middleware
- `api/auth.js` — `getAllowedOrigins`, cookie options (`Secure` when production)

### Prior phase constraints
- `.planning/phases/41-oauth-dashboard-integration-foundation/41-CONTEXT.md` — OAuth handoff via fetch (no redirect to :3100 JSON)

### Validation
- `docs/10-tests.md` — existing test matrix
- `.planning/codebase/CONCERNS.md` — hardcoded `localhost:3100` fragility

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- `docker-compose.yml` — extend with `profiles: [prod]` and new `edf-lab-proxy` service.
- `dashboard/Dockerfile` + `dashboard/nginx.conf` — static serving pattern; keep for internal dashboard container.
- `dashboard/app.js` — single `API_BASE_URL` constant drives all `fetchJson` calls; prod needs `/api` without forking fetch logic.

### Established patterns
- Dev ports **3100** (API) and **5173** (dashboard) are documented everywhere — prod must be additive.
- CORS whitelist in `api/auth.js` — relevant for dev; prod same-origin should avoid depending on it.
- OAuth mock completes via **fetch + credentials**, not navigation — proxy must forward cookies on `/api/auth/*`.

### Integration points
- New nginx `location /api/` → `edf-lab-api:3100` with rewrite/strip.
- New nginx `location /` → `edf-lab-dashboard:5173` (or static upstream).
- Prod dashboard build injects `API_BASE_URL='/api'`.
- Phase 43 will add `app.set('trust proxy', …)` in `api/index.js` — do not fully implement in 42 unless needed for smoke.

</code_context>

<specifics>
## Specific Ideas

- Learners run **`docker compose --profile prod up`** and open **`https://localhost`** (or documented host) — one origin, API at `/api`.
- Dev learners keep the familiar two-terminal flow unchanged.
- nginx strip keeps Express didactically identical to dev — only the edge changes.

</specifics>

<deferred>
## Deferred Ideas

- Publishing `:3100`/`:5173` on host in prod for debugging — rejected for teaching single entry point; document `docker compose exec` / internal curl instead.
- Mounting Express at `/api` in application code — rejected; nginx strip preferred.
- Full TLS/Let's Encrypt automation — phases 43–44.
- OAuth UI on React/Vue prod builds — future milestone item.

</deferred>

---

*Phase: 42-Compose prod profile & reverse proxy*
*Context gathered: 2026-06-17*
