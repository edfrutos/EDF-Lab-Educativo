# Phase 24: CI & Rate Limiting — Context

**Captured:** 2026-06-02 (derived from ROADMAP + REQUIREMENTS; no discuss-phase session)

## Goal

Automate SQLite tests on push to `main` and protect `POST /auth/login` with env-configurable rate limiting — teachable ops hardening for v1.6.

## In scope

- GitHub Actions workflow: `npm run test:sqlite` on push/PR to `main`
- Optional Postgres CI job documented (not required in default workflow)
- `express-rate-limit` middleware on `POST /auth/login` only
- Env vars in `api/.env.example` with comments (no secret patterns)
- Automated test for HTTP 429 on repeated login
- Doc updates: `docs/10-tests.md` CI section, root `README.md` pointer

## Out of scope

- Postgres job in default CI (document only — CI-02)
- Rate limit on `/auth/logout`, `/users`, or global middleware
- Mission 15 / framework auth docs (Phase 25)
- OAuth, CAPTCHA, IP allowlists
- Changing auth cookie/JWT logic (Phase 18 locked)

## Locked decisions

| ID | Decision |
|----|----------|
| D-01 | Use `express-rate-limit` on route `POST /auth/login` in `index.js` (after `express.json()`) |
| D-02 | Env vars: `LOGIN_RATE_LIMIT_WINDOW_MS` (default 900000), `LOGIN_RATE_LIMIT_MAX` (default 10) |
| D-03 | 429 response: JSON `{ error: "..." }` in Spanish, consistent with API error style |
| D-04 | Export limiter factory or instance from `auth.js`; wire in `index.js` |
| D-05 | CI workflow file: `.github/workflows/ci.yml`; triggers: `push` + `pull_request` on `main` |
| D-06 | CI job: Node 20, `npm ci` + `npm run test:sqlite` in `api/` |
| D-07 | Postgres CI: document optional job in `docs/10-tests.md` (snippet + prerequisites) |
| D-08 | Rate limit test: set low `LOGIN_RATE_LIMIT_MAX` in test, assert 429 on exceed |
| D-09 | Do not disable rate limit globally in `AUTH_DISABLED` — tests use env override per case |

## Requirements mapping

| Requirement | Deliverable |
|-------------|-------------|
| CI-01 | `.github/workflows/ci.yml` |
| CI-02 | `docs/10-tests.md` + README pointer |
| RATE-01 | `auth.js` limiter + `index.js` route |
| RATE-02 | `api/.env.example` comments |

## Success criteria (ROADMAP)

1. Push to `main` runs SQLite suite in GitHub Actions.
2. Docs explain optional Postgres CI step.
3. Rapid `POST /auth/login` returns 429 with JSON body.
4. Rate limit window/max documented in `.env.example`.

## Reference files

- `api/index.js` — middleware order, route registration (line 81)
- `api/auth.js` — `loginHandler`
- `api/test-auth-helpers.js` — auth test suite extension point
- `api/package.json` — `test:sqlite` script
- `docs/10-tests.md` — test documentation home
