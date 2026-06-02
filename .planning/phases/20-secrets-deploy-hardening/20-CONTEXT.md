# Phase 20: Secrets & Deploy Hardening - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** ROADMAP + v1.5 research (no separate discuss-phase)

<domain>
## Phase Boundary

Teach **production-minded secrets** and **Compose deployment** without breaking host-dev ergonomics:

- `.env` from `.env.example` with documented variables (DEPLOY-01)
- `.env` gitignored; Compose API service loads secrets via `env_file` (DEPLOY-02)
- API **fail-fast** when `NODE_ENV=production` and `JWT_SECRET` missing (DEPLOY-03)
- Deploy documentation: nginx TLS termination pattern for the lab stack (DEPLOY-04)

**Not in this phase:** full auth learning mission (Phase 21 DOCS-02), React/Vue login, OAuth, Kubernetes, cert automation.

</domain>

<decisions>
## Implementation Decisions

### Secrets & env (DEPLOY-01, DEPLOY-03)
- **D-01:** Expand **`api/.env.example`** with grouped comments: auth (`JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_*`), CORS, database (`DATABASE_URL`, `DB_FILE`), test-only (`AUTH_DISABLED`), optional `NODE_ENV`.
- **D-02:** **`JWT_SECRET` fail-fast** when `NODE_ENV=production` and secret missing — `process.exit(1)` with clear Spanish message before `app.listen`.
- **D-03:** **`getJwtSecret()`** in `auth.js`: in production, must not fall back to dev default (align with D-02 — throw or exit if called without secret).
- **D-04:** Host dev unchanged: without `NODE_ENV=production`, missing `JWT_SECRET` keeps warn + dev default (Phase 18 behavior).

### Compose (DEPLOY-02)
- **D-05:** Add **`env_file: ./api/.env`** to `edf-lab-api` in `docker-compose.yml`.
- **D-06:** Move **`DATABASE_URL`** (and auth-related vars) out of inline `environment:` into `.env` for the API service; keep postgres service lab credentials inline with comment *credenciales ficticias de laboratorio*.
- **D-07:** Document in README / deploy doc: copy `api/.env.example` → `api/.env` before `npm run compose:up`.

### TLS documentation (DEPLOY-04)
- **D-08:** New **`docs/18-production-deploy.md`**: secrets workflow, Compose + `env_file`, nginx TLS termination diagram, why `Secure` cookies need HTTPS, optional self-signed note for local HTTPS demo (no full cert automation).
- **D-09:** Link from **`docs/14-docker-compose.md`** and **`README.md`** (Compose section); do not duplicate full TLS tutorial in doc 14 — pointer only.
- **D-10:** **No** nginx config file in repo for Phase 20 unless minimal example snippet in markdown (educational, not production-ready stack).

### Claude's Discretion
- Whether fail-fast lives in `index.js` `startServer()` only or also in `getJwtSecret()`; exact `.env.example` section order; one NOTEBOOK entry if a real error occurs during verification.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 20 goal and success criteria
- `.planning/REQUIREMENTS.md` — DEPLOY-01..04
- `api/.env.example`, `api/auth.js`, `api/index.js`
- `docker-compose.yml`
- `docs/14-docker-compose.md`, `docs/17-autenticacion.md`
- `.planning/phases/18-auth-api-protected-routes/18-CONTEXT.md` — deferred Phase 20 items
- `.planning/research/ARCHITECTURE.md` — production deploy slice

</canonical_refs>

<deferred>
## Deferred Ideas

- Mission 14 auth walkthrough → Phase 21
- Let's Encrypt / cert-manager → v1.6+ (REQUIREMENTS.md)
- Baking secrets into Docker images → out of scope

</deferred>

---

*Phase: 20-secrets-deploy-hardening*
*Context gathered: 2026-06-02 (plan-phase synthesis)*
