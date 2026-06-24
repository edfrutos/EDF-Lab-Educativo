# Misión 18: Visual Regression con Playwright

## Objetivo

Ejecutar la puerta de regresión visual del milestone v2.2 en los tres dashboards (vanilla, React, Vue), provocar un cambio visual controlado, interpretar el fallo y actualizar baselines de forma intencional — incluidas las referencias `-linux.png` que usa CI.

## Requisitos previos

- Misión [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md) completada (`npm run test:e2e` → **7 passed**).
- Misión [`17-crud-e2e-playwright.md`](./17-crud-e2e-playwright.md) recomendada (login estable y puertos).
- Lectura: [`docs/10-tests.md`](../docs/10-tests.md) — secciones «Regresión visual» y «Visual en CI».

> **Importante:** Esta misión enseña a distinguir un cambio visual intencional, un flake y un mismatch de **dimensiones** entre runners Linux.

## Pasos

### 1. Setup

Desde la raíz del repo:

```bash
npm run playwright:install
cd api && npm ci && cd ..
cd dashboard-react && npm ci && cd ..
cd dashboard-vue && npm ci && cd ..
```

Libera **`:3100`** (Playwright no reutiliza la API manual — ver Misión 16):

```bash
lsof -i :3100 -i :5173 -i :5174 -i :5175
kill $(lsof -ti :3100) 2>/dev/null
```

Si el login visual falla con **403**, alinea credenciales y BD E2E:

```bash
export E2E_OPERATOR_PASSWORD=changeme   # o changeme-2026 si la cambiaste
rm -f api/data/e2e.users.db
```

En entorno efímero sin Chromium:

```bash
npx playwright install chromium
```

### 2. Suite visual local (baselines `-darwin` en macOS)

```bash
npm run test:visual
```

Resultado esperado: **3 passed** — un snapshot por dashboard (`visual.vanilla`, `visual.react`, `visual.vue`).

En macOS Playwright compara contra `e2e/__snapshots__/…/*-darwin.png`. En Linux/CI usa `*-linux.png`.

### 3. Entiende qué captura el helper

Abre [`e2e/helpers/visual-flow.js`](../e2e/helpers/visual-flow.js):

- Viewport fijo **1280×720**
- Login con `loginViaUi` (mismo helper que E2E)
- Captura de `#dashboard-panel` con máscaras en `#health-timestamp` y `#users-table-body`
- **Altura fija 720px** en el panel antes del screenshot — evita que CI falle por «Expected … 1657px, received … 1616px» entre runners Linux distintos

### 4. Provoca un fallo visual controlado

1. Abre `dashboard-react/src/components/HealthCard.jsx`.
2. Cambia temporalmente un texto visible (por ejemplo, añade ` [demo]` al título de la tarjeta).
3. Ejecuta de nuevo:

```bash
npm run test:visual
```

Debe fallar al menos el snapshot React. En el log verás algo como `pixels (ratio …) are different` o un diff en `test-results/`.

### 5. Revisa el diff y decide

- Inspecciona `test-results/**/dashboard-post-login-diff.png` y/o `npx playwright show-report`.
- Pregunta clave: ¿es un cambio **intencional** de UI o una regresión?

### 6. Actualiza baseline solo si el cambio es intencional

```bash
npm run test:visual -- --update-snapshots
npm run test:visual
```

En macOS actualizarás `*-darwin.png`. Si el cambio es real y va a PR, también necesitas actualizar los tres `*-linux.png` (paso 7).

### 7. Restaura o consolida

- Si era ejercicio temporal, revierte el cambio en `HealthCard.jsx` y vuelve a ejecutar `npm run test:visual`.
- Si era cambio real, deja el código y las baselines actualizadas.

### 8. Simula CI localmente

```bash
CI=true npm run test:visual:ci
```

Compara contra `*-linux.png`. Si acabas de hacer `--update-snapshots` solo en Mac, este comando puede fallar aunque `npm run test:visual` pase — es el comportamiento esperado hasta commitear baselines Linux.

## Resultado esperado

Puedes explicar con tus palabras:

1. Diferencia entre `npm run test:visual` (local, `-darwin` en Mac) y `npm run test:visual:ci` (CI, `-linux`).
2. Cuándo usar `--update-snapshots` y cuándo no.
3. Qué significa un mismatch de **dimensiones** vs un diff de **píxeles** (ratio > `0.01`).
4. Por qué la regresión visual **complementa** `test:e2e` y `test:e2e:crud` pero no los sustituye.

## Reto extra

1. En un PR con job `visual-regression` fallido, descarga artefactos:

   ```bash
   gh run download <RUN_ID> -n visual-regression-artifacts -D /tmp/visual-artifacts
   ```

   Los `dashboard-post-login-actual.png` sirven para alinear `-linux.png` si el diff es solo de renderizado entre runners (ver [`NOTEBOOK.md`](../NOTEBOOK.md), sección Visual Regression).

2. Documenta en la descripción del PR **por qué** cambió cada baseline.

3. Ejecuta la suite funcional completa para confirmar que no rompiste nada:

   ```bash
   npm run test:e2e
   npm run test:e2e:crud
   ```

## Enlaces

- Guía principal: [`docs/10-tests.md`](../docs/10-tests.md)
- Helper visual: [`e2e/helpers/visual-flow.js`](../e2e/helpers/visual-flow.js)
- Specs:
  - [`e2e/tests/visual.vanilla.spec.js`](../e2e/tests/visual.vanilla.spec.js)
  - [`e2e/tests/visual.react.spec.js`](../e2e/tests/visual.react.spec.js)
  - [`e2e/tests/visual.vue.spec.js`](../e2e/tests/visual.vue.spec.js)
- Workflow CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Misión CRUD: [`17-crud-e2e-playwright.md`](./17-crud-e2e-playwright.md)
