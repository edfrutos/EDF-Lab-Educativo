# Phase 20: Auth & Production Learning Material - Context

**Gathered:** 2026-06-10
**Status:** Ready for discussion / planning (blocked on Phases 18–19)

<domain>
## Phase Boundary

Close milestone v1.5 with **documentation, mission, navigation, NOTEBOOK, and OpenAPI** updates. No new application features unless a one-line doc fix.

**Requirements:** DEPLOY-01 through DEPLOY-06.

</domain>

<decisions>
## Implementation Decisions (proposed)

### Doc 17 — DEPLOY-01
- **D-01:** Create `docs/17-autenticacion.md` in Spanish, tone matching `docs/05-cors-explicado.md`.
- **D-02:** Sections: qué es auth, JWT en este lab, `AUTH_ENABLED`, login flow diagram, public vs protected routes, 401, `sessionStorage` vs `localStorage`, excerpts from `api/` and `dashboard/app.js`.
- **D-03:** Include `curl` examples: login, CRUD with Bearer, 401 without token.

### Doc 18 — DEPLOY-02
- **D-04:** Create `docs/18-despliegue.md` — env vars, secrets (never commit `.env`), CORS origin allowlist, TLS overview (nginx reverse proxy ASCII/mermaid), production checklist.
- **D-05:** Explicit "qué no hacemos en v1.5" fence: no K8s, no cloud account required.

### Mission 14 — DEPLOY-03
- **D-06:** `missions/14-login-y-token.md` — Objetivo, Pasos, Resultado esperado, Reto extra.
- **D-07:** Required: API auth on, login via dashboard, one CRUD, Network tab shows `Authorization` header.
- **D-08:** Reto extra: repeat with `curl` only, or add Bearer to React/Vue `fetchJson`.

### Navigation — DEPLOY-04, DEPLOY-06
- **D-09:** Update `docs/00-indice.md` — docs 17–18 as *(avanzado, opcional)* after doc 16.
- **D-10:** Update root `README.md` — auth section, link Mission 14, `.env.example` pointer.
- **D-11:** Update `api/openapi.yaml` (or spec path) with `/auth/login` and `bearerAuth` security scheme on `/users` paths.

### NOTEBOOK — DEPLOY-05
- **D-12:** Section `## Autenticación y despliegue (v1.5)` with dated entries.
- **D-13:** Minimum patterns: CORS + Authorization preflight, wrong `JWT_SECRET`, expired token, forgot `AUTH_ENABLED` in Compose.

### UAT — milestone sign-off
- **D-14:** `20-UAT.md` checklist: auth off regression, auth on full flow, doc/mission links verified.

### Claude's Discretion
- Compose `env_file` example in doc 18 vs small `docker-compose` comment only.
- Cross-links in `docs/07-retos.md`.

</decisions>

<constraints>
## Constraints

- Docs in Spanish; planning artifacts may stay English.
- Mission format per `AGENTS.md`: objetivo, pasos, resultado esperado, reto extra.
- Do not oversell production readiness — lab credentials are not production-grade.

</constraints>
