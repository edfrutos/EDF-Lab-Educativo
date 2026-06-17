# Requirements: EDF Lab Educativo

**Defined:** 2026-06-17  
**Core Value:** Make the backend -> JSON -> frontend flow visible, executable, and teachable, turning real errors into documented learning.

## v2.5 Requirements

Requirements for **Production Deploy**. Phases 42–45.

### Compose & Reverse Proxy

- [ ] **PROD-02**: Perfil Compose `prod` expone un único punto de entrada HTTPS con nginx que enruta `/api` a Express y `/` al dashboard estático.
- [ ] **PROD-04**: El flujo de desarrollo en host (`:3100` API + `:5173` dashboard Python) permanece intacto y documentado como modo dual frente al perfil prod.
- [ ] **PROD-05**: La API confía en cabeceras de proxy (`X-Forwarded-Proto`, `trust proxy`) cuando corre detrás de nginx en producción.

### TLS & Certificates

- [ ] **PROD-03**: El operador puede levantar HTTPS local con certificados autofirmados y verificar login con cookie `Secure` bajo `NODE_ENV=production`.
- [ ] **PROD-01**: Existen scripts y documentación para obtener/renovar certificados Let's Encrypt (certbot) en un VPS con dominio real.

### Dashboard & CORS (prod mode)

- [ ] **PROD-06**: El dashboard puede apuntar a la API vía mismo origen (`/api`) en perfil prod sin romper el modo dev con `API_BASE_URL` absoluta.

### Learning Documentation

- [ ] **DOCS-07**: `docs/18-production-deploy.md` describe perfil prod, TLS local, scripts LE y resolución de problemas (CORS, certs, proxy).
- [ ] **DOCS-08**: Misión práctica publicada con objetivo, pasos, resultado esperado y reto extra para despliegue prod.
- [ ] **DOCS-09**: Sección NOTEBOOK v2.5 con ≥2 entradas de fricción real (certificados, proxy, cookies Secure, same-origin).

## Future Requirements (post-v2.5)

### Production (deferred)

- **PROD-07**: Kubernetes manifests y secrets (legacy PROD-03)
- **PROD-08**: nginx rate limiting / WAF básico en edge

### Auth (deferred)

- Real Google/GitHub OAuth providers
- OAuth mock UI en dashboards React/Vue

### Quality (deferred)

- **QA-VIS-05**: Visual regression en Firefox/WebKit en CI

## Out of Scope

| Feature | Reason |
|---------|--------|
| Kubernetes / cert-manager en cluster | Complejidad fuera del lab local; Compose es el paso didáctico |
| Eliminar puertos publicados en modo dev | Transparencia para principiantes; prod es perfil opcional |
| Dockerizar dashboards React/Vue | Frameworks siguen en host; Compose sirve API + vanilla/nginx |
| OAuth real o account linking | Milestone auth cerrado en v2.4 |
| PaaS gestionado (Railway, Fly.io) | Patrones documentados; no acoplar al proveedor |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROD-02 | Phase 42 | Pending |
| PROD-04 | Phase 42 | Pending |
| PROD-06 | Phase 42 | Pending |
| PROD-03 | Phase 43 | Pending |
| PROD-05 | Phase 43 | Pending |
| PROD-01 | Phase 44 | Pending |
| DOCS-07 | Phase 45 | Pending |
| DOCS-08 | Phase 45 | Pending |
| DOCS-09 | Phase 45 | Pending |

**Coverage:**
- v2.5 requirements: 9 total
- Mapped to phases: 9/9 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-17 — v2.5 Production Deploy*
