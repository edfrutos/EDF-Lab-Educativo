# Phase 44: Let's Encrypt automation - Context

**Gathered:** 2026-06-17 (synthesized from ROADMAP + phases 42–43)
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **operator-runnable scripts** and **VPS-oriented documentation** to obtain and renew **Let's Encrypt** certificates for a **real domain** on a server running the existing **`compose:prod`** stack (`edf-lab-proxy` + nginx TLS termination).

**In scope:** PROD-01.

**Out of scope (phase 45):** misión práctica completa, índice/README bulk, NOTEBOOK closure (DOCS-07–09). **Out of scope (always):** certbot en CI, Kubernetes/cert-manager, DNS automation, ejecutar LE en cada `npm test`.

</domain>

<decisions>
## Implementation Decisions

### Certbot on VPS host (not in CI)
- **D-01:** Scripts run on the **VPS operator shell** where Docker Compose prod está desplegado — no integrar certbot en GitHub Actions.
- **D-02:** Usar **certbot** oficial (CLI en host o contenedor efímero documentado). Modo **staging** opcional vía variable (`CERTBOT_STAGING=1`) para pruebas sin rate limit.

### Cert paths & proxy mount
- **D-03:** Mantener **`deploy/certs/`** para certs **autofirmados locales** (`generate-dev-tls.sh`, fase 42–43). LE vive en **`/etc/letsencrypt/live/<dominio>/`** en el VPS (estándar certbot).
- **D-04:** Añadir **`docker-compose.letsencrypt.yml`** (override opcional) que monte los paths LE en `edf-lab-proxy` como `/etc/nginx/certs:ro` **o** rutas explícitas en plantilla nginx — sin romper el flujo local con `lab.crt`/`lab.key`.
- **D-05:** Plantilla nginx **`proxy/nginx.letsencrypt.conf.template`** con `server_name` y rutas a `fullchain.pem` / `privkey.pem`; render con `envsubst` desde script (dominio en `deploy/letsencrypt/.env`).

### Obtain vs renew
- **D-06:** **`scripts/letsencrypt/obtain-cert.sh`** — emisión inicial (standalone en :80 **o** webroot documentado; parar proxy brevemente si standalone).
- **D-07:** **`scripts/letsencrypt/renew-cert.sh`** — `certbot renew` + hook que recarga nginx del contenedor proxy (`docker compose exec` o `kill -HUP` documentado).

### Secrets & repo hygiene
- **D-08:** **`deploy/letsencrypt/.env.example`** solo con `CERT_DOMAIN`, `CERTBOT_EMAIL`, flags staging — **sin** credenciales reales ni emails personales en git.
- **D-09:** Scripts y docs **no** imprimen ni commitean claves privadas; respetar hook `git-secrets` (sin asignaciones literales de JWT en plantillas trackeadas).

### Local dev unchanged
- **D-10:** `npm run compose:prod` + `generate-dev-tls.sh` sigue siendo el camino **local**; LE es camino **VPS** documentado en paralelo.
- **D-11:** No exigir dominio real para pasar tests SQLite/E2E existentes.

### Phase 45 deferral
- **D-12:** Ampliación índice, misión y NOTEBOOK v2.5 LE → fase 45. Fase 44 añade sección en **`docs/18-production-deploy.md`** (checklist VPS), no reescritura completa del índice.

### Claude's Discretion
- standalone vs webroot como default en obtain script (documentar tradeoff).
- Nombre exacto del override compose (`letsencrypt` vs `prod-le`).
- Si `smoke-prod-proxy.sh` gana variante `PROD_PROXY_URL=https://lab.ejemplo.com` sin `-k` (documentar solo, no gate CI).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 44 goal, success criteria
- `.planning/REQUIREMENTS.md` — PROD-01
- `.planning/phases/43-tls-local-proxy-trust/43-VERIFICATION.md` — prod TLS baseline
- `scripts/generate-dev-tls.sh` — local self-signed (no reemplazar)
- `proxy/nginx.conf` — localhost + lab.crt
- `docker-compose.yml` — `edf-lab-proxy`, volume `deploy/certs`
- `docs/18-production-deploy.md` — prod profile, defer LE to 44

</canonical_refs>

<code_context>
## Existing Code Insights

- Proxy monta `./deploy/certs` → `/etc/nginx/certs` (`lab.crt`, `lab.key`).
- `PROD_HTTPS_PORT` en `.env` raíz permite puerto host alternativo (NOTEBOOK v2.5).
- `TRUST_PROXY`, `NODE_ENV=production` en `docker-compose.prod.yml` (fase 43).
- Smoke prod usa `curl -k` — LE real en VPS no necesita `-k`.

</code_context>

<deferred>
## Deferred Ideas

- cert-manager / Kubernetes — PROD-07 post-v2.5
- mkcert — local trust; rejected (openssl suficiente en local)
- Automatizar cron en repo — documentar crontab ejemplo en VPS, no instalar en dev

</deferred>

---

*Phase: 44-Let's Encrypt automation*
*Context synthesized: 2026-06-17*
