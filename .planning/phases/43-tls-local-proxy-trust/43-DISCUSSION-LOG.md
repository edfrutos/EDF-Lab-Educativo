# Phase 43: TLS local & proxy trust - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 43-TLS local & proxy trust
**Areas discussed:** prod mode, secure verify, TLS trust, trust proxy

---

## Arranque NODE_ENV=production

| Option | Description | Selected |
|--------|-------------|----------|
| Solo compose:prod | NODE_ENV=production en edf-lab-api vía compose prod | ✓ |
| compose + nota host | Documentar NODE_ENV en host sin obligar | |
| Tú decides | Priorizar simplicidad didáctica | |

**User's choice:** Solo compose:prod
**Notes:** Host dev (`:3100` + `:5173`) sin cambios.

---

## JWT_SECRET en prod

| Option | Description | Selected |
|--------|-------------|----------|
| api/.env vía env_file | Operador define JWT_SECRET antes de compose:prod | ✓ |
| Ejemplo en compose | Comentario en docker-compose.prod.yml | |
| Tú decides | | |

**User's choice:** Seguir api/.env vía env_file

---

## Verificación cookie Secure

| Option | Description | Selected |
|--------|-------------|----------|
| Smoke ampliado | login curl + GET /api/users con cookies | ✓ |
| Solo manual navegador | Documentado en docs/18 | |
| Smoke + manual | Sin Playwright nuevo | |
| Playwright CI | Nuevo E2E prod en CI | |

**User's choice:** Ampliar smoke-prod-proxy.sh

---

## Historia TLS (openssl vs mkcert)

| Option | Description | Selected |
|--------|-------------|----------|
| openssl solo | generate-dev-tls.sh + advertencia navegador | ✓ |
| openssl + mkcert opcional | Sección docs opcional | |
| mkcert principal | Cambiar flujo principal | |

**User's choice:** Mantener openssl (fase 42)

---

## trust proxy en Express

| Option | Description | Selected |
|--------|-------------|----------|
| trust proxy 1 | Un hop nginx | ✓ |
| Subred Docker | Más restrictivo | |
| Tú decides | Según Express docs | |

**User's choice:** `app.set('trust proxy', 1)` con activación solo en prod compose

---

## Claude's Discretion

- Nombre exacto de env para trust proxy (`TRUST_PROXY=1`).
- Detalles del cookie jar en smoke script.
- Comentarios mínimos en `api/.env.example`.

## Deferred Ideas

- mkcert, Playwright prod CI, rate-limit por IP real, Let's Encrypt (fase 44).
