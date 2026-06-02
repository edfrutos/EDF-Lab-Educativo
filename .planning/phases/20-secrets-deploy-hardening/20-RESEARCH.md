# Phase 20: Secrets & Deploy Hardening - Research

**Researched:** 2026-06-02
**Domain:** Environment secrets, Docker Compose env_file, production fail-fast, nginx TLS termination
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01..D-04: `.env.example` groups; fail-fast on `NODE_ENV=production` without `JWT_SECRET`; dev default preserved otherwise
- D-05..D-07: `env_file: ./api/.env` on API service; DATABASE_URL in `.env`; postgres inline lab creds OK
- D-08..D-10: New `docs/18-production-deploy.md`; pointers from doc 14/README; no full nginx stack in repo

### Deferred
- Phase 21 learning mission; cert automation; secrets in images

</user_constraints>

<research_summary>
## Summary

Phase 20 closes the production gap left by Phase 18: auth already uses `JWT_SECRET`, cookies with `secure: production`, and `.env.example` exists but Compose still injects `DATABASE_URL` inline and production boot does not fail without a real secret.

**Primary recommendation:** Two plans — (1) code + `.env.example` + fail-fast, (2) Compose `env_file` + `docs/18-production-deploy.md` with nginx TLS pattern.

</research_summary>

<architecture_patterns>
## Current vs Target

### Compose API service (today)

```yaml
environment:
  DATABASE_URL: postgresql://edf_lab:edf_lab_dev@edf-lab-postgres:5432/edf_lab
```

### Target

```yaml
env_file:
  - ./api/.env
# environment: only non-secret overrides if needed (e.g. NODE_ENV=production)
```

Learner copies `api/.env.example` → `api/.env` with `DATABASE_URL` and `JWT_SECRET` before `docker compose up`.

### Fail-fast (index.js)

Call before `initDb()` / `listen`:

```javascript
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET?.trim()) {
  console.error('[fatal] JWT_SECRET es obligatorio cuando NODE_ENV=production. Copia api/.env.example → api/.env');
  process.exit(1);
}
```

### auth.js alignment

`getJwtSecret()` should not return dev default when `NODE_ENV === 'production'` (exit or throw — prefer matching index guard so one message).

</architecture_patterns>

<common_pitfalls>
## Common Pitfalls

1. **Committing `.env`** — already gitignored; verify not in `git add`
2. **Compose without `.env`** — API fails or uses wrong DB; document prerequisite
3. **Secure cookie over HTTP** — production doc must explain HTTPS + nginx
4. **AUTH_DISABLED in compose `.env`** — warn never set in production `.env`

</common_pitfalls>

<verification_commands>
## Verification Commands

```bash
# Fail-fast
cd api && NODE_ENV=production node -e "require('./index.js')" 
# expect exit 1 without JWT_SECRET

cd api && NODE_ENV=production con JWT_SECRET en entorno (test-secret-long-enough) node index.js
# expect server starts

# Compose
cp api/.env.example api/.env
# set JWT_SECRET and DATABASE_URL for compose network hostname edf-lab-postgres
npm run compose:up
curl http://localhost:3100/health
```

</verification_commands>

---

## RESEARCH COMPLETE

**Ready for planning:** yes
