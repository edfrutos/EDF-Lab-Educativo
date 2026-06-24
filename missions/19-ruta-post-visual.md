# Misión 19: Ruta post-visual (Firefox, Postgres, prod, auth)

## Objetivo

Cerrar el arco **v2.1 → v2.5** en cuatro bloques ordenados: ampliar E2E (Firefox + Postgres), probar el stack **prod** local, repasar auth avanzada/OAuth y elegir un reto de extensión del código.

## Requisitos previos

- Misiones [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md), [`17-crud-e2e-playwright.md`](./17-crud-e2e-playwright.md) y [`18-visual-regression-playwright.md`](./18-visual-regression-playwright.md) completadas.
- Lectura previa útil: [`docs/10-tests.md`](../docs/10-tests.md), [`docs/17-autenticacion.md`](../docs/17-autenticacion.md), [`docs/18-production-deploy.md`](../docs/18-production-deploy.md).

> **Importante:** Sigue los bloques **en orden** (1 → 4). Cada uno usa puertos distintos; libera procesos al cambiar de bloque.

---

## Bloque 1 — Firefox + Postgres E2E (prioridad 1)

### Setup

```bash
npm run playwright:install
npx playwright install firefox

kill $(lsof -ti :3100) 2>/dev/null
export E2E_OPERATOR_PASSWORD=changeme   # alinea con api/.env y e2e.users.db
rm -f api/data/e2e.users.db             # solo si login E2E da 403
```

### 1.1 Multi-navegador (Firefox)

```bash
npm run test:e2e:firefox
```

Resultado esperado: **7 passed** (misma matriz que Chromium: smoke + CRUD + oauth mock en vanilla).

Equivalente al job CI `e2e-smoke` en Firefox:

```bash
npm run test:e2e:ci    # 14 passed (7 Chromium + 7 Firefox)
```

### 1.2 E2E contra Postgres

Levanta Postgres (Compose o local en `:5432`):

```bash
docker compose up -d edf-lab-postgres
npm run test:db:prepare
```

Ejecuta la suite Postgres (API con `DATABASE_URL`, base **`edf_lab_e2e`** — no uses `edf_lab` de desarrollo):

```bash
npm run test:e2e:pg
```

Resultado esperado: **7 passed** (Chromium; incluye oauth mock vanilla).

Override opcional:

```bash
E2E_DATABASE_URL=postgresql://edf_lab:edf_lab_dev@localhost:5432/edf_lab_e2e npm run test:e2e:pg
```

### Checkpoint bloque 1

Puedes explicar:

1. Por qué `test:e2e` usa SQLite y `test:e2e:pg` es opt-in con Postgres.
2. Qué job CI corresponde a cada comando (`e2e-smoke`, `e2e-postgres`).

---

## Bloque 2 — Producción local (prioridad 2, v2.5)

### 2.1 Preparación

Detén dev en host que ocupe `:3100`, `:5173` o `:443`:

```bash
kill $(lsof -ti :3100 :5173) 2>/dev/null
npm run compose:prod:down 2>/dev/null || true
```

Configura secretos y certificados de laboratorio:

```bash
cp api/.env.example api/.env    # si hace falta
./scripts/generate-dev-tls.sh
```

Si **`:443` está ocupado**, crea `.env` en la raíz del repo:

```env
PROD_HTTPS_PORT=9443
```

### 2.2 Stack prod

```bash
npm run compose:prod
```

Abre `https://localhost` (o `https://localhost:9443` si usaste puerto alternativo). Acepta la advertencia del certificado autofirmado.

### 2.3 Smoke automatizado

En otra terminal:

```bash
./scripts/smoke-prod-proxy.sh
```

Debe verificar health en `/api/health`, login con cookie **Secure** y CRUD autenticado detrás del proxy.

### 2.4 Parar el stack

```bash
npm run compose:prod:down
```

### Checkpoint bloque 2

Puedes explicar:

1. Diferencia entre `compose:up` (dev, `:3100` + `:5173`) y `compose:prod` (HTTPS en proxy, API bajo `/api`).
2. Por qué `NODE_ENV=production` activa cookies `Secure` y `TRUST_PROXY`.

Guía completa: [`docs/18-production-deploy.md`](../docs/18-production-deploy.md). Runbook VPS: [`NOTEBOOK.md`](../NOTEBOOK.md) — *Production Deploy (v2.5)*.

---

## Bloque 3 — Auth avanzada y OAuth (prioridad 3, v2.3 / v2.4)

Vuelve al modo **dev** en host:

```bash
cd api && PORT=3100 npm start          # terminal 1
cd dashboard && python3 -m http.server 5173   # terminal 2
```

Practica los pasos **8–11** de [`missions/14-auth-vanilla-login-crud.md`](./14-auth-vanilla-login-crud.md):

| Paso | Tema | Comando / acción clave |
|------|------|------------------------|
| 8 | Cambio de contraseña | `PATCH /auth/password` con sesión |
| 9 | Refresh rotation | `POST /auth/refresh`; reusar token viejo → **401** |
| 10 | OAuth mock (API) | `GET /auth/oauth/start` + `callback` con `state` |
| 11 | OAuth mock (UI) | Botón **Continuar con OAuth mock** en `:5173` |

Contrato y errores: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md).

Verificación rápida E2E oauth:

```bash
npx playwright test e2e/tests/auth-smoke.vanilla.spec.js --config=e2e/playwright.config.js --project=vanilla-chromium
```

### Checkpoint bloque 3

Puedes explicar refresh vs login, por qué `state` en OAuth y cuándo usar OAuth mock frente a email/contraseña.

---

## Bloque 4 — Reto de extensión (prioridad 4)

Elige **un** reto de [`docs/07-retos.md`](../docs/07-retos.md) e impleméntalo en el repo (o en una rama):

- **Reto 1** — validación más estricta en `POST/PUT /users`
- **Reto 2** — consumir `GET /about` y `GET /time` en el dashboard
- **Reto 3** — contador de usuarios en la UI
- **Reto 4** — buscador por nombre
- **Reto 5** — romper y arreglar CORS (documenta en `NOTEBOOK.md`)

Tras el cambio, ejecuta al menos:

```bash
cd api && npm run test:sqlite
npm run test:e2e
```

Si tocaste UI visible, valora `npm run test:visual` (regenera `-darwin` en Mac si hace falta).

---

## Resultado esperado global

Al terminar la Misión 19:

1. Has ejecutado **Firefox** y **Postgres** E2E con éxito.
2. Has levantado **`compose:prod`** y pasado el smoke del proxy.
3. Has practicado **password**, **refresh** y **OAuth mock**.
4. Has completado al menos un **reto** de extensión documentado.

## Reto extra

1. En GitHub Actions de un PR a `main`, localiza los **cinco** jobs: `test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`, `visual-regression`.
2. Compara tu VPS (`https://lab.edefrutos2020.com`) con el diagrama de [`docs/18-production-deploy.md`](../docs/18-production-deploy.md#variante-vps-con-plesk-despliegue-real).

## Enlaces

- Tests: [`docs/10-tests.md`](../docs/10-tests.md)
- Auth: [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- Prod: [`docs/18-production-deploy.md`](../docs/18-production-deploy.md)
- Retos: [`docs/07-retos.md`](../docs/07-retos.md)
- Misión anterior: [`18-visual-regression-playwright.md`](./18-visual-regression-playwright.md)
