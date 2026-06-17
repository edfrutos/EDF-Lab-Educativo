# Phase 43: TLS local & proxy trust - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the **prod Compose profile** so the operator can verify **HTTPS login with `Secure` cookies** under **`NODE_ENV=production`**, with Express **trusting the nginx edge** (`trust proxy`, `X-Forwarded-Proto`). Phase 42 delivered proxy structure, self-signed certs, and routing smoke; phase 43 closes the **auth/TLS trust loop**.

**In scope:** PROD-03, PROD-05.

**Out of scope (later phases):** Let's Encrypt / certbot automation (phase 44), full docs/mission/NOTEBOOK closure (phase 45), React/Vue prod parity, Kubernetes.

</domain>

<decisions>
## Implementation Decisions

### NODE_ENV=production (prod profile only)
- **D-01:** Set **`NODE_ENV=production`** on **`edf-lab-api`** only when running **`npm run compose:prod`** (via `docker-compose.prod.yml` override). Do **not** require production mode for host dev (`PORT=3100` + `python3 -m http.server 5173`).
- **D-02:** **`JWT_SECRET`** remains loaded from **`api/.env`** via existing `env_file` — operator must define it before `compose:prod` (fail-fast already in `api/index.js` / `api/auth.js`). No secrets in compose YAML.

### Cookie `Secure` verification
- **D-03:** Extend **`scripts/smoke-prod-proxy.sh`** to prove login over HTTPS: `POST https://localhost/api/auth/login` with credentials, capture cookies, then **`GET https://localhost/api/users`** with session cookie (200 + array). This is the primary automated proof of `Secure` + same-origin prod.
- **D-04:** Do **not** add a new Playwright prod suite or CI job in phase 43 — keep verification lightweight (bash + curl). Optional manual browser checklist may be a one-liner in docs, not a gate.
- **D-05:** OAuth mock Secure verification is **nice-to-have** in smoke if trivial after login; not a blocker if cookie jar complexity grows — login + CRUD read is the must-have.

### TLS trust story (learners)
- **D-06:** Keep **`scripts/generate-dev-tls.sh`** (openssl self-signed) as the **only** cert path in phase 43. Document browser warning and `curl -k` clearly in `docs/18-production-deploy.md`.
- **D-07:** Do **not** introduce mkcert or certbot in phase 43 (certbot → phase 44).

### Express `trust proxy`
- **D-08:** Enable **`app.set('trust proxy', 1)`** in `api/index.js` when behind the prod proxy (single nginx hop). Rely on existing nginx `X-Forwarded-Proto https` from `proxy/nginx.conf`.
- **D-09:** Phase 43 does **not** add rate-limit-by-real-IP or advanced forwarded-header parsing — minimal trust for cookie `Secure` semantics and future HTTPS-aware logic only.
- **D-10:** Host dev path (`compose:up` without prod override, or bare `npm start`) must **not** break — gate `trust proxy` on env flag (e.g. `TRUST_PROXY=1` in prod compose only) or equivalent so local HTTP dev stays unchanged.

### Phase 42 carry-forward (locked)
- **D-11:** Reuse **`edf-lab-proxy`**, **`deploy/certs/`**, **`compose:prod`** — no topology change.
- **D-12:** Dashboard prod continues **`API_BASE_URL='/api'`** — no CORS dependency in prod smoke.

### Claude's Discretion
- Exact env var name for enabling trust proxy (`TRUST_PROXY` vs detecting compose prod).
- Whether smoke uses a dedicated `E2E_OPERATOR_*` env or documents `admin@lab.local` / `changeme` defaults.
- Minimal touch to `api/.env.example` comments for prod compose prerequisites.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 43 goal and success criteria
- `.planning/REQUIREMENTS.md` — PROD-03, PROD-05
- `.planning/PROJECT.md` — v2.5 dual-mode constraint

### Phase 42 baseline (do not redesign)
- `.planning/phases/42-compose-prod-profile-reverse-proxy/42-CONTEXT.md` — proxy topology, deferred TLS/Secure to 43
- `.planning/phases/42-compose-prod-profile-reverse-proxy/42-VERIFICATION.md` — manual compose prod steps
- `proxy/nginx.conf` — `X-Forwarded-Proto`, `/api/` strip
- `docker-compose.prod.yml` — prod override pattern
- `scripts/generate-dev-tls.sh` — self-signed certs
- `scripts/smoke-prod-proxy.sh` — extend in 43

### Auth & API
- `api/auth.js` — `secure: NODE_ENV === 'production'`, cookie helpers
- `api/index.js` — startup, middleware order, fail-fast JWT
- `api/.env.example` — `NODE_ENV`, `JWT_SECRET`

### Dashboard & docs
- `dashboard/app.js` — prod `/api` via image build (phase 42)
- `docs/18-production-deploy.md` — prod mode, TLS warnings
- `docs/17-autenticacion.md` — cookie session model

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- `getCookieOptions()` in `api/auth.js` already sets `secure: process.env.NODE_ENV === 'production'`.
- `proxy/nginx.conf` already sends `X-Forwarded-Proto https` on `/api/` upstream.
- `scripts/smoke-prod-proxy.sh` — health, dashboard HTML, OAuth start; extend for login + authenticated `/users`.

### Established patterns
- Prod activation is **compose-profile scoped** (phase 42 `docker-compose.prod.yml` merge).
- Verification favors **bash smoke scripts** over new CI matrices unless unavoidable.
- Host dev remains HTTP on `:3100`/`:5173` with CORS whitelist.

### Integration points
- `docker-compose.prod.yml` → add `NODE_ENV=production` (+ optional `TRUST_PROXY=1`) on `edf-lab-api`.
- `api/index.js` → conditional `trust proxy` before routes.
- `scripts/smoke-prod-proxy.sh` → cookie jar login flow through `https://localhost/api/auth/login`.

</code_context>

<specifics>
## Specific Ideas

- Learner runs `compose:prod`, accepts browser cert warning, logs in at `https://localhost`, sees CRUD work — cookies persist because `Secure` + HTTPS terminate at proxy.
- Smoke script is the reproducible proof for operators and CI-adjacent local checks (not necessarily a new GitHub job).

</specifics>

<deferred>
## Deferred Ideas

- **mkcert** for local trusted certs — optional future doc snippet; rejected for phase 43 (openssl only).
- **Playwright prod E2E in CI** — heavier; smoke curl sufficient for this milestone phase.
- **Rate limiting by real client IP** via `X-Forwarded-For` — post-v2.5 / edge hardening.
- **Let's Encrypt** — phase 44.

</deferred>

---

*Phase: 43-TLS local & proxy trust*
*Context gathered: 2026-06-17*
