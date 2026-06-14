# Phase 24 UAT — CI & Rate Limiting

**API:** `:3100` · **CI:** push to `main`

| # | Prueba | Resultado | Notas |
|---|--------|-----------|-------|
| 1 | `npm run test:sqlite` — 24 tests pass | pass | Incluye rate-limit.test.js |
| 2 | 11+ POST `/auth/login` rápidos → 429 JSON | pass | Default max=10; test automatizado con max=2 |
| 3 | 429 body en español con clave `error` | pass | handler en auth.js |
| 4 | `/auth/logout` y `/users` sin rate limit extra | pass | Solo login limitado |
| 5 | `.env.example` documenta LOGIN_RATE_LIMIT_* | pass | Comentarios en español |
| 6 | `.github/workflows/ci.yml` existe y referencia test:sqlite | pass | |
| 7 | `docs/10-tests.md` CI + Postgres opcional | pass | |
| 8 | GitHub Actions verde en remoto | manual | Tras push a main |

**Automated verification:** 2026-06-02 — local `test:sqlite` 24/24; workflow YAML válido.
