# Misión 18: Visual Regression con Playwright

## Objetivo

Ejecutar la puerta de regresión visual del milestone v2.2 en los tres dashboards (vanilla, React, Vue), provocar un cambio visual controlado, interpretar el fallo y actualizar baselines de forma intencional.

## Requisitos previos

- Misión [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md) completada.
- Misión [`17-crud-e2e-playwright.md`](./17-crud-e2e-playwright.md) recomendada.
- Lectura: [`docs/10-tests.md`](../docs/10-tests.md), sección de regresión visual y visual en CI.

> **Importante:** Esta misión enseña a distinguir un cambio visual intencional de un flake o una regresión real.

## Pasos

### 1. Setup mínimo

Desde la raíz del repo:

```bash
npm install
npm run playwright:install
cd api && npm ci && cd ..
cd dashboard-react && npm ci && cd ..
cd dashboard-vue && npm ci && cd ..
```

Si estás en entorno efímero/sandbox y Playwright falla por navegador ausente:

```bash
npx playwright install chromium
```

### 2. Ejecuta la suite visual completa

```bash
npm run test:visual
```

Resultado esperado inicial: **3 passed** (un snapshot por dashboard).

### 3. Provoca un fallo visual controlado

1. Abre `dashboard-react/src/components/HealthCard.jsx`.
2. Cambia temporalmente un texto visible (por ejemplo, añade ` [demo]` al título de la tarjeta).
3. Ejecuta de nuevo:

```bash
npm run test:visual
```

Debe fallar al menos el snapshot React.

### 4. Revisa el diff y decide

- Inspecciona `test-results/` y/o `playwright-report` para ver la diferencia visual.
- Responde: ¿es un cambio intencional de UI o una regresión?

### 5. Actualiza baseline solo si el cambio es intencional

```bash
npm run test:visual -- --update-snapshots
npm run test:visual
```

Si el cambio era intencional, ahora la suite vuelve a verde.

### 6. Restaura o consolida

- Si era ejercicio temporal, revierte el cambio visual de demo.
- Si era cambio real, deja el código y baseline actualizada.

## Resultado esperado

Puedes explicar con tus palabras:

1. Diferencia entre `npm run test:visual` y `npm run test:visual:ci`.
2. Cuándo usar `--update-snapshots` y cuándo no.
3. Qué significa un mismatch de snapshot y cómo revisarlo.
4. Cómo se relaciona esta puerta visual con `test:e2e` (complementaria, no sustitutiva).

## Reto extra

1. Simula el contexto de CI:

```bash
CI=true npm run test:visual:ci
```

2. En un PR real, localiza el job `visual-regression` y abre los artefactos cuando falle:
   - `test-results`
   - `playwright-report`
3. Documenta en tu descripción de PR por qué cambió la baseline.

## Enlaces

- Guía principal de tests: [`docs/10-tests.md`](../docs/10-tests.md)
- Helper visual compartido: [`e2e/helpers/visual-flow.js`](../e2e/helpers/visual-flow.js)
- Specs visuales:
  - [`e2e/tests/visual.vanilla.spec.js`](../e2e/tests/visual.vanilla.spec.js)
  - [`e2e/tests/visual.react.spec.js`](../e2e/tests/visual.react.spec.js)
  - [`e2e/tests/visual.vue.spec.js`](../e2e/tests/visual.vue.spec.js)
- Workflow CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
