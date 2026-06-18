# Phase 43: TLS local & proxy trust - Research

**Researched:** 2026-06-17
**Domain:** Express `trust proxy`, Secure cookies behind nginx, prod Compose runtime
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `NODE_ENV=production` on `edf-lab-api` **only** via `docker-compose.prod.yml` — host dev unchanged.
- **D-02:** `JWT_SECRET` from `api/.env` via existing `env_file`; fail-fast already in `api/index.js` / `api/auth.js`.
- **D-03:** Extend `scripts/smoke-prod-proxy.sh` — `POST /api/auth/login` + `GET /api/users` with cookie jar.
- **D-04:** No Playwright prod suite or new CI job in phase 43.
- **D-06–D-07:** openssl self-signed only; document browser warning + `curl -k`; no mkcert/certbot.
- **D-08–D-10:** `app.set('trust proxy', 1)` gated (e.g. `TRUST_PROXY=1`); host dev HTTP must not break.
- **D-11–D-12:** Reuse phase 42 topology; dashboard prod `API_BASE_URL='/api'`.

### Out of scope
- certbot/LE (44), bulk docs/mission (45), React/Vue prod parity, rate-limit by real IP.
</user_constraints>

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-03 | HTTPS local + login with `Secure` cookie under `NODE_ENV=production` | Prod override sets `NODE_ENV`; smoke proves login + `/users` over `https://localhost/api` |
| PROD-05 | API trusts proxy headers when behind nginx | `TRUST_PROXY=1` + `app.set('trust proxy', 1)`; nginx already sends `X-Forwarded-Proto https` |
</phase_requirements>

## Summary

Phase 43 **closes the auth/TLS trust loop** deferred from phase 42. Certs, nginx TLS, and `compose:prod` already exist — this phase adds **production runtime flags** on the API container and **automated proof** that session cookies work over HTTPS.

**Primary recommendation:** Set `NODE_ENV=production` in `docker-compose.prod.yml` only. Gate `trust proxy` on `TRUST_PROXY=1` in the same override. Extend smoke script with curl cookie jar against default operator credentials (`admin@lab.local` / `changeme` from `.env.example`).

## Phase 42 Baseline (do not redo)

| Asset | Status |
|-------|--------|
| `scripts/generate-dev-tls.sh` | Done — `deploy/certs/lab.crt` + `lab.key` |
| `proxy/nginx.conf` | Done — TLS :443, `X-Forwarded-Proto https` |
| `edf-lab-proxy` + `compose:prod` | Done |
| `scripts/smoke-prod-proxy.sh` | Done — health, dashboard, OAuth start; **no login yet** |

## Standard Patterns

### Express trust proxy (single hop)

```javascript
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}
```

Place **before** `cors()` and routes. Value `1` = trust first proxy (nginx edge). Sufficient for `req.secure` and future HTTPS-aware middleware; no `X-Forwarded-For` parsing in this phase.

### Secure cookies (already implemented)

`api/auth.js` → `getCookieOptions().secure = process.env.NODE_ENV === 'production'`. Activating `NODE_ENV=production` in prod Compose is the **only** code path change needed for `Secure` flag emission.

### Smoke: login + authenticated read

```bash
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT

# Login — capture Set-Cookie (Secure when NODE_ENV=production)
headers=$(curl -kfsSI -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.local","password":"changeme"}')
echo "$headers" | grep -qi 'Set-Cookie:.*edf_session' || exit 1
echo "$headers" | grep -qi 'Secure' || exit 1   # only when production

# Authenticated CRUD read
users=$(curl -kfsS -b "$COOKIE_JAR" "$BASE_URL/api/users")
echo "$users" | grep -q '"email"' || exit 1
```

Use env overrides `SMOKE_OPERATOR_EMAIL` / `SMOKE_OPERATOR_PASSWORD` for flexibility (defaults from `.env.example`).

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| `NODE_ENV=production` on host dev breaks local HTTP cookies | Restrict to `docker-compose.prod.yml` override only |
| `trust proxy` always on breaks rate-limit IP in dev | Gate on `TRUST_PROXY=1` prod-only |
| API container starts without `JWT_SECRET` | Document `cp api/.env.example api/.env` + set secret; fail-fast already exits |
| curl without `-k` fails on self-signed | Smoke keeps `curl -k`; doc explains browser warning |
| Login smoke fails if admin password changed | Document defaults; allow env override in smoke |

## Split Recommendation

| Plan | Focus |
|------|-------|
| 43-01 | `NODE_ENV=production` in prod override; `.env.example` prod prereqs; doc 18 prod-runtime section |
| 43-02 | `TRUST_PROXY=1` + `trust proxy`; smoke login + `/users`; doc trust/Secure checklist |

## Sources

- Phase 42 VERIFICATION.md — deferred items list
- Express docs: `trust proxy` setting (single hop)
- Existing `api/auth.js` cookie helpers
- `proxy/nginx.conf` — `X-Forwarded-Proto` already present
