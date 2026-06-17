# Phase 42: Compose prod profile & reverse proxy - Research

**Researched:** 2026-06-17
**Domain:** Docker Compose prod profile, nginx edge proxy, same-origin `/api`
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** New service `edf-lab-proxy` (dedicated edge nginx).
- **D-02:** Canonical command: `docker compose --profile prod up` (via `npm run compose:prod` wrapper if merge file needed).
- **D-03:** Prod profile: only `:443` on host; no `:3100`/`:5173` published.
- **D-04:** Minimal self-signed TLS on `:443` in phase 42.
- **D-05–D-06:** Strip `/api` at nginx; auth/OAuth same pattern; no Express route changes.
- **D-07–D-08:** Basic proxy headers; same-origin prod (no cross-origin CORS dependency).
- **D-09–D-13:** Prod dashboard `API_BASE_URL='/api'`; host dev unchanged; OAuth via `/api`.
- **D-14–D-15:** TLS/Secure cookie hardening deferred to phase 43.

### Out of scope
- certbot/LE (44), trust proxy Express (43), K8s, React/Vue prod parity, mounting Express at `/api`.
</user_constraints>

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-02 | Single HTTPS entry, nginx `/api` + static | `edf-lab-proxy` + `docker-compose.prod.yml` port reset |
| PROD-04 | Host dev `:3100`/`:5173` intact | No changes to default `dashboard/app.js` dev default; compose prod is additive |
| PROD-06 | Dashboard `/api` same-origin in prod | Docker build-arg injects `/api` into dashboard image for prod stack |
</phase_requirements>

## Summary

Phase 42 is **infrastructure-only**: add an edge nginx container and Compose wiring so learners access **one origin** (`https://localhost`) with API at **`/api`**, while the existing **two-terminal host dev path** stays untouched.

**Primary recommendation:** Use `proxy_pass http://edf-lab-api:3100/;` (trailing slash) under `location /api/` to strip the prefix without Express changes. Build prod dashboard image with `API_BASE_URL='/api'`. Merge `docker-compose.prod.yml` to remove host port bindings on API/dashboard when prod profile runs.

## Standard Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Edge proxy | nginx:alpine | Already used in `dashboard/Dockerfile`; familiar to learners from doc 18 |
| TLS (phase 42) | Self-signed script → `deploy/certs/` (gitignored) | Runnable `:443` without certbot |
| Compose | `profiles: [prod]` on proxy + prod override file | Keeps default `docker compose up` backward compatible |
| Dashboard API base | Build-arg `DASHBOARD_API_BASE_URL=/api` | Avoids runtime config server for static vanilla |

## Architecture Sketch

```txt
Host :443 (prod profile)
        │
        v
  edf-lab-proxy (nginx TLS)
     │         │
     │ /api/*  │ /
     v         v
edf-lab-api  edf-lab-dashboard:5173
  :3100      (static nginx)
```

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| `proxy_pass` without trailing slash doubles `/api` | Use `proxy_pass http://edf-lab-api:3100/;` |
| Breaking `docker compose up` for missions | Default compose unchanged; prod override only with `--profile prod` |
| OAuth cookies blocked cross-origin | Same-origin `/api` in prod removes CORS handoff issues |
| Learners edit `app.js` then rebuild prod image | Document that prod image bakes `/api`; host dev file stays `localhost:3100` |

## Split Recommendation

| Plan | Focus |
|------|-------|
| 42-01 | Proxy service, nginx config, certs script, compose prod merge, dashboard prod build |
| 42-02 | Smoke scripts (curl prod + dev regression), minimal README/doc hook, phase verification |
