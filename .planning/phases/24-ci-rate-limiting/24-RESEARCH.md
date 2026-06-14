# Phase 24: CI & Rate Limiting — Research

**Researched:** 2026-06-02
**Domain:** GitHub Actions CI, express-rate-limit on login endpoint
**Confidence:** HIGH

<user_constraints>
## User Constraints (from 24-CONTEXT.md)

### Locked Decisions
- D-01..D-04: express-rate-limit on POST /auth/login only; env-driven; Spanish 429 JSON
- D-05..D-07: ci.yml on main push/PR; SQLite job; Postgres documented not in default workflow
- D-08..D-09: Test 429 with low env max; no AUTH_DISABLED bypass for rate limit

### Out of scope
- Global rate limit, logout limit, Phase 25 docs, OAuth/CAPTCHA

</user_constraints>

<research_summary>
## Summary

Phase 24 adds two independent-but-related capabilities: **automated CI** (no workflow exists today) and **login brute-force mitigation** (no rate limiting today). The SQLite test suite (`npm run test:sqlite`, 23 tests) is CI-ready — runs with `AUTH_DISABLED=1` for CRUD block and real auth for the final 7 tests. `express-rate-limit` is not in `api/package.json`; must be added with clear educational justification per AGENTS.md rule 5.

**Primary recommendation:** Plan 24-01 implements rate limit + test + `.env.example`; Plan 24-02 adds CI workflow + docs so CI runs the expanded suite including 429 test.

</research_summary>

<current_state>
## Current State

| Area | Finding |
|------|---------|
| CI | No `.github/workflows/`; only `.github/copilot-instructions.md` (obsolete: says `npm test` is placeholder) |
| Tests | `test:sqlite` = 23 tests, no external deps; `test:pg` needs Postgres |
| Login route | `index.js:81` `app.post('/auth/login', loginHandler)` |
| Middleware | cors → cookieParser → json → routes |
| Rate limit | Absent |
| `.env.example` | No LOGIN_RATE_LIMIT_* vars |

</current_state>

<implementation_patterns>
## express-rate-limit (v7)

```javascript
const rateLimit = require('express-rate-limit');

function createLoginRateLimiter() {
  const windowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10;
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json({
        error: 'Demasiados intentos de inicio de sesión. Espera un momento e inténtalo de nuevo.'
      });
    }
  });
}
```

Wire: `app.post('/auth/login', loginRateLimiter, loginHandler);`

**Test strategy:** In new test, save/restore env; set `LOGIN_RATE_LIMIT_MAX=2`, send 3 POSTs with wrong password, assert third is 429. Use unique IP not required (default in-memory store per process).

## GitHub Actions CI

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test-sqlite:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: api/package-lock.json
      - run: npm ci
      - run: npm run test:sqlite
```

**Why SQLite only:** No Postgres service in default workflow; matches CI-01. CI-02 satisfied by doc section with optional `services: postgres` snippet.

</implementation_patterns>

<documentation_targets>
## Documentation Updates

| File | Change |
|------|--------|
| `docs/10-tests.md` | New «CI en GitHub Actions» section + optional Postgres job |
| `README.md` | Badge or one-line CI mention under tests |
| `api/README.md` | Rate limit env vars table row |
| `.github/copilot-instructions.md` | Fix obsolete npm test placeholder |

</documentation_targets>

<verification_commands>
## Verification Commands

```bash
# Rate limit (manual, API running)
for i in 1 2 3 4 5 6 7 8 9 10 11; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3100/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@y.z","password":"bad"}'
done
# Expect 403s then 429

# Automated
cd api && npm run test:sqlite   # 24 tests after rate limit test added

# CI workflow syntax (local)
# act push  # optional if act installed; not required for plan
```

</verification_commands>

<common_pitfalls>
## Common Pitfalls

1. **Rate limit breaks auth tests** — existing login tests send 1–2 requests; default max=10 is safe; dedicated 429 test uses max=2
2. **Global rate limit** — do not `app.use(rateLimit)`; only login route
3. **CI without package-lock** — `api/package-lock.json` exists; use `npm ci`
4. **git-secrets on .env.example** — document vars as comments only; no live secret key assignments
5. **Test order** — rate limit test should run last in auth block or reset limiter state via new app instance per test file (supertest reuses app — env change + 3 requests in one test is sufficient)

</common_pitfalls>

<dependencies>
## New Dependency

`express-rate-limit` — educational value: teaches middleware composition, HTTP 429, env-driven security knobs. Justified for Phase 24 RATE-01.

</dependencies>
