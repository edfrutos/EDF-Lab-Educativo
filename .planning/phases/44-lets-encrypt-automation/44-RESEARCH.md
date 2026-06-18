# Phase 44: Let's Encrypt automation - Research

**Researched:** 2026-06-17
**Domain:** certbot on VPS, nginx TLS with LE certs, Compose prod override
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

- **D-01–D-02:** certbot on VPS operator shell; staging flag optional.
- **D-03–D-05:** Keep local `deploy/certs/`; LE at `/etc/letsencrypt/live/<domain>/`; nginx template + envsubst.
- **D-06–D-07:** obtain + renew scripts with nginx reload hook.
- **D-08–D-09:** `.env.example` only; no secrets in git.
- **D-10–D-12:** local compose:prod unchanged; doc section in 18, not full phase 45 docs.
</user_constraints>

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|------------------|
| PROD-01 | Scripts + docs to obtain/renew LE certs on VPS with real domain | `scripts/letsencrypt/*`, `deploy/letsencrypt/.env.example`, `docker-compose.letsencrypt.yml`, doc 18 VPS section |
</phase_requirements>

## Summary

Phase 44 adds a **parallel TLS path** for production VPS: certbot on the host obtains certs; Compose override mounts them into `edf-lab-proxy`; nginx template switches `server_name` and cert file paths. **Local lab** keeps `generate-dev-tls.sh` + self-signed.

**Primary recommendation:** certbot **standalone** for initial obtain (simplest didactic story: stop proxy, bind :80, issue, start proxy with LE mount). Document **webroot** as advanced alternative. Renew via `certbot renew` + `docker compose ... exec edf-lab-proxy nginx -s reload`.

## Standard Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Issuer | Let's Encrypt via certbot | Industry standard; free; teaches ACME |
| Cert storage | `/etc/letsencrypt/live/$CERT_DOMAIN/` | certbot default; not copied into git |
| nginx config | `nginx.letsencrypt.conf.template` + envsubst | Reuse proxy image; swap conf at deploy time |
| Compose | `docker-compose.letsencrypt.yml` merge | Opt-in; does not affect local prod profile |
| Staging | `CERTBOT_STAGING=1` → `--staging` | Avoid rate limits while learning |

## Obtain flow (VPS)

```txt
1. DNS A/AAAA → VPS IP
2. cp deploy/letsencrypt/.env.example deploy/letsencrypt/.env
3. Edit CERT_DOMAIN, CERTBOT_EMAIL
4. npm run compose:prod:down   # free :80 if standalone
5. ./scripts/letsencrypt/obtain-cert.sh
6. ./scripts/letsencrypt/render-nginx-le.sh   # or baked in obtain
7. docker compose -f ... -f docker-compose.prod.yml -f docker-compose.letsencrypt.yml --profile prod up -d
8. curl https://$CERT_DOMAIN/api/health
```

## Renew flow

```bash
./scripts/letsencrypt/renew-cert.sh
# certbot renew --quiet --deploy-hook "docker compose ... exec edf-lab-proxy nginx -s reload"
```

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Port 80 blocked while proxy up | Document stop proxy before standalone obtain |
| Rate limit hitting production LE | Default docs recommend staging first |
| git-secrets on JWT lines in docs | Use prose, no `VAR=value` secrets in tracked files |
| Mixing local lab.crt with LE paths | Separate compose override; clear doc headings |
| CORS on real domain | Document adding `https://$CERT_DOMAIN` to `CORS_ORIGINS` in api/.env |

## Split Recommendation

| Plan | Focus |
|------|-------|
| 44-01 | Scripts obtain/renew, deploy/letsencrypt templates, nginx LE template, compose override |
| 44-02 | docs/18 VPS section, env checklist, update "Qué no cubre", verification notes |

## Sources

- certbot user guide (standalone, renew, deploy-hook)
- Existing `proxy/nginx.conf`, `docker-compose.yml` volume pattern
- Phase 43 NOTEBOOK (port 443/9443, cert warnings — contrast with trusted LE)
