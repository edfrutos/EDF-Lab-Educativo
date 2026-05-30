---
phase: 05
slug: advanced-contracts-and-containers
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-30
---

# Phase 05 — Security

> Contrato de seguridad per-fase: registro de amenazas, riesgos aceptados y auditoría.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| filesystem → editor externo | El alumno exporta/pega `openapi.yaml` en Swagger Editor online (SaaS) | Spec pública del lab — sin secretos ni PII |
| spec → código real | La spec describe contratos; divergencia enseña información errónea | JSON de error, schemas de usuario |
| host filesystem → contenedor | `COPY` en Dockerfile determina qué entra en la imagen | Código fuente, package.json — no `data/users.json` del host |
| contenedor → host network | `-p 3100:3100` publica puerto del contenedor | Tráfico HTTP local |
| host → Docker daemon | `npm run docker:build/start` invoca Docker | Imagen y contenedor efímeros |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01-01 | Information Disclosure | api/openapi.yaml | accept | Spec es documentación pública del lab; sin credenciales ni datos reales | closed |
| T-05-01-02 | Tampering | api/openapi.yaml vs api/index.js | mitigate | Mensajes de error literales verificados (grep + UAT test 3); tests API 12/12 | closed |
| T-05-01-03 | Repudiation | editor.swagger.io | accept | Uso educativo; alumno pega YAML sin enviar credenciales | closed |
| T-05-02-01 | Information Disclosure | api/.dockerignore | mitigate | `data/users.json` y `node_modules` excluidos del contexto de build | closed |
| T-05-02-02 | Elevation of Privilege | api/Dockerfile | mitigate | `USER node` + `chown -R node:node` tras COPY; proceso no-root | closed |
| T-05-02-03 | Denial of Service | docker run --name edf-lab-api | accept | Conflicto de nombre en entorno mono-alumno; `--rm` limpia al parar | closed |
| T-05-02-04 | Tampering | CMD en Dockerfile | mitigate | `CMD ["node", "index.js"]` — SIGTERM directo a Node; comentario en Dockerfile | closed |
| T-05-02-05 | Information Disclosure | ENV PORT=3100 | accept | Variable pública en imagen; sin secretos; didáctica vía `docker inspect` | closed |

*Disposition: mitigate = control implementado · accept = riesgo documentado · transfer = tercero*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-01-01 | OpenAPI es material didáctico público; no expone secretos | plan-time | 2026-05-29 |
| AR-05-02 | T-05-01-03 | Swagger Editor es herramienta estándar de aprendizaje; sin datos sensibles en el YAML | plan-time | 2026-05-29 |
| AR-05-03 | T-05-02-03 | Laboratorio local mono-usuario; nombre fijo de contenedor es aceptable | plan-time | 2026-05-29 |
| AR-05-04 | T-05-02-05 | PORT=3100 no es secreto; transparencia educativa | plan-time | 2026-05-29 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By | Notes |
|------------|---------------|--------|------|--------|-------|
| 2026-05-30 | 8 | 8 | 0 | gsd-secure-phase orchestrator | UAT descubrió EACCES en data/ — mitigado con `chown` en Dockerfile (refuerza T-05-02-02) |

### Audit 2026-05-30 — Evidence Summary

| Threat ID | Evidence |
|-----------|----------|
| T-05-01-02 | `grep 'Usuario no encontrado.' api/openapi.yaml api/index.js` — coincidencia literal; UAT test 3 pass |
| T-05-02-01 | `api/.dockerignore` líneas `node_modules`, `data/users.json`, `*.test.js` |
| T-05-02-02 | `api/Dockerfile` L17 `chown -R node:node`, L28 `USER node`; contenedor arranca y `/health` OK (UAT test 6) |
| T-05-02-04 | `api/Dockerfile` L32 `CMD ["node", "index.js"]` |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-30
