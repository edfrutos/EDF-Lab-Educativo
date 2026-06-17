# Phase 42: Compose prod profile & reverse proxy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 42-Compose prod profile & reverse proxy
**Areas discussed:** Edge topology, API routing, API_BASE_URL, HTTP vs HTTPS

---

## Edge topology

| Option | Description | Selected |
|--------|-------------|----------|
| New `edf-lab-proxy` service | Dedicated edge nginx; dashboard keeps internal static nginx | ✓ |
| Extend dashboard nginx | Single container for static + /api proxy | |
| You decide | Claude picks for didactic clarity | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hide :3100/:5173 in prod | Only proxy port on host | ✓ (Claude discretion) |
| Keep published debug ports | :3100/:5173 still on host in prod | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| :443 HTTPS-ready | Proxy on 443; TLS material minimal in 42 | ✓ |
| :8080 HTTP in 42 | TLS in phase 43 | |
| :8080 then migrate to :443 | Documented two-step port story | |

| Option | Description | Selected |
|--------|-------------|----------|
| `docker compose --profile prod up` | Compose profiles | ✓ |
| Override compose file | `-f docker-compose.prod.yml` | |
| You decide | | |

**User's choice:** New proxy service; :443; profile prod; ports hidden on host (Claude discretion).

---

## API routing

| Option | Description | Selected |
|--------|-------------|----------|
| Strip `/api` prefix | nginx rewrite to Express root paths | ✓ (Claude discretion) |
| Mount Express under `/api` | Change api/index.js routes | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| OAuth same strip pattern | `/api/auth/oauth/...` | ✓ (Claude discretion) |
| Dedicated auth location block | Extra nginx rules | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Basic headers in 42 | Host + X-Forwarded-Proto | ✓ (Claude discretion) |
| Full headers now | X-Forwarded-For, X-Real-IP, etc. | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Same-origin, no CORS in prod | Dashboard + /api one origin | ✓ (Claude discretion) |
| Keep strict CORS anyway | Defense in depth | |
| You decide | | |

---

## API_BASE_URL

| Option | Description | Selected |
|--------|-------------|----------|
| Relative `/api` in prod image | `API_BASE_URL='/api'` | ✓ |
| Empty base + paths include /api | | |
| Docker build-arg per target | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Dev unchanged localhost:3100 | Host python server path | ✓ (Claude discretion) |
| Runtime origin detection | Auto /api vs localhost | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Show `/api` in UI label | Didactic | ✓ (Claude discretion) |
| Show full origin URL | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| OAuth via /api in prod | Same fetch pattern | ✓ (Claude discretion) |
| OAuth dev-only in 42 | Document limitation | |
| You decide | | |

---

## HTTP vs HTTPS

| Option | Description | Selected |
|--------|-------------|----------|
| Structure + minimal TLS on :443 in 42; harden in 43 | Split phases | ✓ |
| HTTP only in 42 on :8080 | Adjust roadmap | |
| Full self-signed TLS in 42 | Pull phase 43 forward | |

| Option | Description | Selected |
|--------|-------------|----------|
| Secure cookie verification in phase 43 | | ✓ (Claude discretion) |
| Verify Secure in 42 if HTTPS present | | |
| You decide | | |

---

## Claude's Discretion

- Hide backend ports on host in prod profile
- Strip `/api` at nginx; OAuth uses same pattern
- Basic proxy headers only in 42
- Same-origin prod without cross-origin CORS dependency
- Preserve host dev with `localhost:3100`; prod image uses `/api`
- UI shows `/api`; OAuth works via `/api` in prod
- Secure cookie / `trust proxy` verification deferred to phase 43

## Deferred Ideas

- Host-published :3100/:5173 in prod for debugging
- Express mounted at `/api` in application code
- certbot / LE (phases 44+)
- React/Vue prod proxy parity
