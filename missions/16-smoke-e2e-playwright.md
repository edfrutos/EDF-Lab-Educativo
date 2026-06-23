# Misión 16: smoke E2E con Playwright

## Objetivo

Ejecutar localmente la suite de humo **browser** del milestone v2.0 (`npm run test:e2e`), entender qué arranca Playwright sin terminales manuales e interpretar un fallo mediante screenshot o trace.

## Requisitos previos

- Misiones [`14-auth-vanilla-login-crud.md`](./14-auth-vanilla-login-crud.md) o [`15-framework-auth-login-crud.md`](./15-framework-auth-login-crud.md) (concepto de login y cookie).
- Lectura: [`docs/10-tests.md`](../docs/10-tests.md) — secciones «Smoke E2E» y «CI en GitHub Actions».

> **Importante:** E2E **no** usa `AUTH_DISABLED`. La sesión se obtiene solo por el formulario de login en el navegador.

## Pasos

### 1. Setup (primera vez)

Desde la **raíz** del repositorio:

```bash
npm install
npm run playwright:install
cd api && npm ci && cd ..
cd dashboard-react && npm ci && cd ..
cd dashboard-vue && npm ci && cd ..
```

### 2. Libera puertos

Playwright necesita `:3100`, `:5173`, `:5174` y `:5175` libres. **`:3100` es obligatorio** — si queda un `npm start` manual, Playwright no puede arrancar la API E2E (rate-limit alto + `e2e.users.db`):

```bash
lsof -i :3100 -i :5173 -i :5174 -i :5175
# Cierra procesos viejos (tmux, npm start, npm run dev). Ejemplo en macOS:
kill $(lsof -ti :3100) 2>/dev/null
```

### 3. Ejecuta la suite completa

```bash
npm run test:e2e
```

Debes ver **7 tests passed** (proyectos `vanilla-chromium`, `react-chromium`, `vue-chromium`: smoke auth + CRUD + oauth mock vanilla). Playwright arranca la API y los tres frontends vía `e2e/playwright.config.js`.

### 4. Un solo dashboard (opcional)

```bash
npx playwright test --config=e2e/playwright.config.js --project=vanilla-chromium
```

Útil para depurar sin levantar React/Vue.

### 5. Modo UI (depuración)

```bash
npm run test:e2e:ui
```

Abre la interfaz de Playwright: inspecciona cada paso, el DOM y las peticiones de red.

### 6. Interpreta un fallo (ejercicio guiado)

1. Abre `e2e/tests/auth-smoke.vanilla.spec.js`.
2. Cambia temporalmente la aserción `John Doe` por un texto que no exista, por ejemplo `Usuario Fantasma`.
3. Ejecuta:

   ```bash
   npx playwright test --config=e2e/playwright.config.js --project=vanilla
   ```

4. Cuando falle, revisa:
   - **Consola:** mensaje de Playwright (`expect(...).toBeVisible()`).
   - **`test-results/`** (ignorado por git): screenshot `test-failed-1.png` del estado final.
   - Si hubo reintento en CI: trace en `test-results/` (config: `trace: 'on-first-retry'`).

5. **Restaura** el spec antes de commitear.

**Qué aprender del fallo:** Playwright compara el DOM real con tus aserciones. Un selector ambiguo (dos campos «Email») o un servidor stale en el puerto producen errores distintos — ver [`NOTEBOOK.md`](../NOTEBOOK.md) sección v2.0.

## Resultado esperado

Puedes explicar en tus palabras:

1. Qué hace `webServer` en `e2e/playwright.config.js` (API + tres frontends).
2. Por qué E2E no define `AUTH_DISABLED` y los tests API sí (tabla en doc 10).
3. Dónde mirar screenshot/trace cuando un spec falla.

## Reto extra

1. Ejecuta `npm run test:e2e:headed` y observa Chromium completar login en los tres dashboards.
2. En GitHub, abre un PR y localiza los **cuatro** checks: `test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`.
3. Compara duración total del workflow con la tabla «Duración esperada» en [`docs/10-tests.md`](../docs/10-tests.md#duración-esperada-de-ci-orientativa).
4. Continúa con [`17-crud-e2e-playwright.md`](./17-crud-e2e-playwright.md) para CRUD E2E y traces.

## Enlaces

- Guía de tests y CI: [`docs/10-tests.md`](../docs/10-tests.md)
- Autenticación (cookie, CORS): [`docs/17-autenticacion.md`](../docs/17-autenticacion.md)
- Helper compartido: [`e2e/helpers/auth-smoke-flow.js`](../e2e/helpers/auth-smoke-flow.js)
- Misión auth manual: [`14-auth-vanilla-login-crud.md`](./14-auth-vanilla-login-crud.md)
