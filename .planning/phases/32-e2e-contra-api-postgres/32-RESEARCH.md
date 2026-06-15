# Research: Phase 32 — E2E contra API Postgres

**Date:** 2026-06-15  
**Phase:** 32-e2e-contra-api-postgres  
**Requirements:** QA-ADV-03, QA-CI-05

## RESEARCH COMPLETE

## Objetivo técnico

Permitir que Playwright arranque la API con `DATABASE_URL` apuntando a una base Postgres **aislada** (`edf_lab_e2e`), sin `DB_FILE` SQLite, validando al menos auth smoke en los tres dashboards. Nunca usar la BD de desarrollo `edf_lab` ni el volumen Compose de producción local.

## Estado actual (fases 30–31)

| Pieza | Comportamiento |
|-------|----------------|
| `e2e/playwright.config.js` | `apiEnv` fija `DB_FILE: data/e2e.users.db`; omite `DATABASE_URL` → SQLite |
| `npm run test:e2e` | 6 tests (3 smoke + 3 CRUD) contra SQLite |
| `api/scripts/prepare-test-db.js` | Crea solo `edf_lab_test` (suite API `index.pg.test.js`) |
| CI `test-postgres` | `DATABASE_URL` → `edf_lab_test` |
| CI `e2e-smoke` | Sin servicio Postgres; E2E SQLite |

## Requisitos clave

| ID | Implicación |
|----|-------------|
| **QA-ADV-03** | Perfil/config Playwright que inyecta `DATABASE_URL` en `webServer` API; auth smoke pasa; CRUD si estable |
| **QA-CI-05** | Nombre de BD dedicado `edf_lab_e2e`, distinto de `edf_lab` (dev) y `edf_lab_test` (API tests) |

## Opciones evaluadas

### A — `playwright.config.pg.js` separado (recomendado)

- `npm run test:e2e` sigue en SQLite (rápido, sin Postgres local).
- `npm run test:e2e:pg` usa config PG con `DATABASE_URL` y **sin** `DB_FILE`.
- Paridad didáctica: el alumno ve dos perfiles explícitos (SQLite vs Postgres).

**Pros:** Cambio acotado; no rompe flujo local actual. **Contras:** Segundo archivo de config.

### B — Variable `E2E_USE_POSTGRES` en un solo config

**Pros:** Un solo archivo. **Contras:** `apiEnv` condicional más difícil de leer en un lab educativo.

**Decisión:** Opción A — alineada con `.planning/research/ARCHITECTURE.md` (E2E SQLite por defecto; Postgres en job/perfil dedicado).

## Bootstrap de `edf_lab_e2e`

### Local

1. Postgres en `:5432` (Homebrew o `docker compose up -d edf-lab-postgres`).
2. Script idempotente crea `edf_lab_e2e` (mismo patrón `42P04` que `edf_lab_test`).
3. `DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_e2e`.

### CI

Job `e2e-postgres` con servicio `postgres:16`:

```yaml
POSTGRES_USER: edf_lab
POSTGRES_PASSWORD: edf_lab_dev
POSTGRES_DB: edf_lab_e2e   # BD dedicada E2E — QA-CI-05
```

Health: `pg_isready -U edf_lab -d edf_lab_e2e` (mismo patrón que `test-postgres`).

No hace falta `test:db:prepare` en CI si `POSTGRES_DB` crea la base al arrancar el contenedor.

### Extensión de `prepare-test-db.js`

Añadir creación de `edf_lab_e2e` en el mismo script (dos `CREATE DATABASE`, cada uno con manejo `42P04`), o constante `E2E_DB_NAME`. Mantiene un solo comando `npm run test:db:prepare` para el alumno.

## Contrato `apiEnv` Postgres (webServer)

```javascript
{
  PORT: '3100',
  JWT_SECRET: /* E2E_JWT_SECRET */,
  DATABASE_URL: process.env.E2E_DATABASE_URL
    || 'postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_e2e',
  ADMIN_EMAIL: /* E2E_OPERATOR_EMAIL */,
  ADMIN_PASSWORD: /* E2E_OPERATOR_PASSWORD */,
  LOGIN_RATE_LIMIT_MAX: '1000',
  CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174,http://localhost:5175'
  // NO DB_FILE — router db.js elige Postgres
}
```

`initDb()` en arranque aplica `schema.pg.sql`, seed admin si `accounts` vacío, usuarios desde `users.json` si tabla vacía — mismo bootstrap que SQLite E2E.

## Alcance de tests en perfil PG

| Spec | Incluir en PG | Notas |
|------|---------------|-------|
| `auth-smoke.*.spec.js` (×3) | **Sí** — obligatorio QA-ADV-03 | Login real, sin `AUTH_DISABLED` |
| `crud.*.spec.js` (×3) | **Sí si verde** — objetivo completo | Emails únicos en `crud-flow.js` evitan colisiones; en CI contenedor fresco no hay estado previo |

Si CRUD flake en PG por concurrencia, plan 02 documenta límite; prioridad: auth smoke 3/3 verde.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Postgres no listo antes de API | Healthcheck en servicio CI; `webServer.timeout` 120s en config PG |
| `DATABASE_URL` heredada del shell mezcla backends | Documentar `unset DATABASE_URL` antes de `test:e2e` SQLite (NOTEBOOK existente) |
| Confundir `edf_lab` / `edf_lab_test` / `edf_lab_e2e` | Tabla en `docs/10-tests.md`; assert en script que URL contiene `edf_lab_e2e` en job CI |
| Puerto 5432 ocupado localmente | Doc: Compose postgres o Homebrew; error claro en prepare script |

## Archivos a tocar (planificación)

| Archivo | Cambio |
|---------|--------|
| `api/scripts/prepare-test-db.js` | Crear también `edf_lab_e2e` |
| `e2e/playwright.config.pg.js` | Nuevo — `DATABASE_URL`, sin `DB_FILE` |
| `package.json` (raíz) | `test:e2e:pg` |
| `.github/workflows/ci.yml` | Job `e2e-postgres` |
| `docs/10-tests.md` | Sección Postgres E2E + matriz BD |
| `e2e/helpers/crud-flow.js` | Comentario: emails únicos aplican también en PG |

## Comandos de verificación

```bash
# Local (Postgres en marcha)
npm run test:db:prepare
npm run test:e2e:pg

# SQLite sin cambios
npm run test:e2e
```

## Referencias

- `.planning/phases/30-crud-e2e-vanilla/30-VERIFICATION.md`
- `.planning/phases/31-crud-e2e-multi-dashboard/31-VERIFICATION.md`
- `.planning/research/ARCHITECTURE.md` — E2E vs Postgres CI
- `api/index.pg.test.js` — patrón `DATABASE_URL` antes de require
- `docs/15-postgresql.md` — cadena de conexión
