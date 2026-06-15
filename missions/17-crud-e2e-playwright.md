# Misión 17: CRUD E2E con Playwright

## Objetivo

Ejecutar localmente la suite CRUD E2E del milestone v2.1 (`npm run test:e2e`, 6 tests Chromium), entender el flujo `runCrudFlow` y depurar un paso create/edit/delete fallido con **trace** y pestaña **Network**.

## Requisitos previos

- Misión [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md) completada (setup Playwright, smoke auth).
- Lectura: [`docs/10-tests.md`](../docs/10-tests.md) — secciones «CRUD E2E», «E2E contra Postgres» y «Matriz de navegadores».

> **Importante:** Cada ejecución CRUD crea un email `@lab.local` único. El delete usa `confirm()` del navegador — el helper acepta el diálogo antes del click en «Eliminar».

## Pasos

### 1. Setup

Si ya hiciste la Misión 16, basta con comprobar dependencias:

```bash
npm run playwright:install
cd api && npm ci && cd ..
cd dashboard-react && npm ci && cd ..
cd dashboard-vue && npm ci && cd ..
```

Libera puertos `:3100`, `:5173`, `:5174`, `:5175` si hace falta (`lsof -i :3100 ...`).

### 2. Suite completa (6 tests Chromium)

```bash
npm run test:e2e
```

Debes ver **6 tests passed** (proyectos `vanilla-chromium`, `react-chromium`, `vue-chromium`: smoke auth + CRUD en cada dashboard).

### 3. Solo CRUD vanilla

```bash
npx playwright test crud.vanilla --config=e2e/playwright.config.js --project=vanilla-chromium
```

Observa en consola los pasos: login → crear → editar → eliminar.

### 4. Ejercicio guiado — provocar un fallo con trace

1. Abre [`e2e/helpers/crud-flow.js`](../e2e/helpers/crud-flow.js).
2. Cambia temporalmente la aserción del nombre editado (por ejemplo, espera `Nombre Imposible` en lugar del nombre generado).
3. Ejecuta con trace siempre activo:

   ```bash
   npx playwright test crud.vanilla --config=e2e/playwright.config.js --project=vanilla-chromium --trace on
   ```

4. Cuando falle, abre el trace:

   ```bash
   npx playwright show-trace test-results/*/trace.zip
   ```

5. En el visor de trace:
   - Revisa la línea de tiempo hasta el paso que falla.
   - Pestaña **Network**: localiza `POST /users`, `PUT /users/:id` y `DELETE /users/:id` y comprueba status 201/200/204.
   - Pestaña **Snapshot** / DOM en el momento del fallo.

6. **Restaura** el helper antes de commitear.

### 5. Screenshot en fallo

Sin trace, la config guarda screenshot en `test-results/` (`screenshot: 'only-on-failure'`). Útil cuando el fallo es visual (fila no aparece en tabla).

## Resultado esperado

Puedes explicar en tus palabras:

1. Qué hace `runCrudFlow` y por qué `buildCrudTestUser()` genera email único.
2. Cómo el helper gestiona `confirm()` en delete.
3. Cómo abrir un trace y leer una petición HTTP fallida (4xx/5xx o body inesperado).
4. Diferencia entre `test:e2e` (6 Chromium) y `test:e2e:ci` (12 Chromium + Firefox).

## Reto extra

1. Ejecuta `npm run test:e2e:firefox` (instala Firefox antes: `npx playwright install firefox`).
2. Con Postgres en marcha: `npm run test:db:prepare` y `npm run test:e2e:pg`.
3. En un PR, localiza los **cuatro** jobs CI (`test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`).

## Enlaces

- Helper CRUD: [`e2e/helpers/crud-flow.js`](../e2e/helpers/crud-flow.js)
- Spec vanilla: [`e2e/tests/crud.vanilla.spec.js`](../e2e/tests/crud.vanilla.spec.js)
- Guía tests: [`docs/10-tests.md`](../docs/10-tests.md)
- NOTEBOOK v2.1: [`NOTEBOOK.md`](../NOTEBOOK.md) — sección Advanced E2E
- Misión smoke: [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md)
