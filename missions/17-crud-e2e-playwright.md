# Misión 17: CRUD E2E con Playwright

## Objetivo

Ejecutar la suite **CRUD** E2E en los tres dashboards, entender el flujo `runCrudFlow` (login → crear → editar → eliminar) y depurar un paso fallido con **trace** y pestaña **Network**.

## Requisitos previos

- Misión [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md) completada (`npm run test:e2e` → **7 passed**).
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

Libera puertos — **`:3100` es obligatorio** (Playwright no reutiliza la API manual; ver Misión 16):

```bash
lsof -i :3100 -i :5173 -i :5174 -i :5175
kill $(lsof -ti :3100) 2>/dev/null   # macOS/Linux si hay npm start viejo
```

Si cambiaste la contraseña del operador respecto a la BD E2E:

```bash
export E2E_OPERATOR_PASSWORD=changeme-2026   # o la tuya
rm -f api/data/e2e.users.db                  # solo si el hash no coincide
```

### 2. Los tres CRUD (núcleo de esta misión)

```bash
npm run test:e2e:crud
```

Debes ver **3 tests passed** (`crud.vanilla`, `crud.react`, `crud.vue`).

Equivalente explícito:

```bash
npx playwright test crud --config=e2e/playwright.config.js \
  --project=vanilla-chromium --project=react-chromium --project=vue-chromium
```

Observa en consola: login operador → **POST** crear → **PUT** editar → **DELETE** eliminar (email único por run).

### 3. Suite completa (contexto)

```bash
npm run test:e2e
```

**7 tests passed** en Chromium: 3 CRUD + 3 smoke auth + 1 oauth mock (vanilla). Esta misión se centra en los **3 CRUD**.

### 4. Solo CRUD vanilla (depuración acotada)

```bash
npx playwright test crud.vanilla --config=e2e/playwright.config.js --project=vanilla-chromium
```

Útil para repetir un solo dashboard sin levantar lógica de los otros specs en paralelo.

### 5. Ejercicio guiado — provocar un fallo con trace

1. Abre [`e2e/helpers/crud-flow.js`](../e2e/helpers/crud-flow.js).
2. Tras el paso **editar**, cambia temporalmente la aserción del nombre (línea ~54), por ejemplo:

   ```javascript
   // await expect(editedRow).toContainText(user.editedName);
   await expect(editedRow).toContainText('Nombre Imposible');
   ```

3. Ejecuta con trace siempre activo:

   ```bash
   npx playwright test crud.vanilla --config=e2e/playwright.config.js --project=vanilla-chromium --trace on
   ```

4. Cuando falle, abre el trace (ruta exacta en la consola, o):

   ```bash
   npx playwright show-trace test-results/crud.vanilla-*/trace.zip
   ```

5. En el visor de trace:
   - Línea de tiempo hasta el `expect` que falla (fila editada visible, texto distinto).
   - Pestaña **Network**: localiza `POST /auth/login`, `POST /users`, `PUT /users/:id` — en este ejercicio el fallo es **aserción DOM**, no HTTP; comprueba que el **PUT** devolvió 200 antes del fallo.
   - Pestaña **Snapshot** / DOM: la fila muestra el nombre editado real, no «Nombre Imposible».

6. **Restaura** el helper antes de commitear.

### 6. Screenshot en fallo

Sin `--trace on`, la config guarda screenshot en `test-results/` (`screenshot: 'only-on-failure'`). Útil cuando la fila no aparece en la tabla.

## Qué hace el código (referencia rápida)

| Pieza | Rol |
|---|---|
| [`buildCrudTestUser()`](../e2e/helpers/crud-flow.js) | Sufijo `Date.now()` + aleatorio → email único → sin 409 en SQLite/Postgres E2E |
| [`loginViaUi()`](../e2e/helpers/login-ui.js) | Login compartido (Misión 16); CRUD lo reutiliza antes del formulario de usuario |
| [`runCrudFlow()`](../e2e/helpers/crud-flow.js) | `#user-name-input`, `#user-email-input`, `#user-submit-button`, tabla `#users-table-body` |
| `page.once('dialog', accept)` | Acepta el `confirm()` nativo del delete antes del click en «Eliminar» |

Selectores CRUD ≠ login: `#login-email` (operador) vs `#user-email-input` (usuario creado en el test).

## Resultado esperado

Puedes explicar en tus palabras:

1. Qué hace `runCrudFlow` y por qué `buildCrudTestUser()` genera email único.
2. Cómo el helper gestiona `confirm()` en delete.
3. Cómo abrir un trace y correlacionar un paso fallido con peticiones HTTP (status y momento en la timeline).
4. Diferencia entre `test:e2e:crud` (**3** CRUD), `test:e2e` (**7** Chromium) y `test:e2e:ci` (**14** = 7 × Chromium + Firefox).

## Reto extra

1. Ejecuta `npm run test:e2e:firefox` (instala Firefox antes: `npx playwright install firefox`).
2. Con Postgres en marcha: `npm run test:db:prepare` y `npm run test:e2e:pg` (6 tests CRUD+smoke, sin oauth mock).
3. En un PR, localiza los jobs CI: `test-sqlite`, `test-postgres`, `e2e-smoke`, `e2e-postgres`, `visual-regression`.

## Enlaces

- Helper CRUD: [`e2e/helpers/crud-flow.js`](../e2e/helpers/crud-flow.js)
- Helper login: [`e2e/helpers/login-ui.js`](../e2e/helpers/login-ui.js)
- Spec vanilla: [`e2e/tests/crud.vanilla.spec.js`](../e2e/tests/crud.vanilla.spec.js)
- Guía tests: [`docs/10-tests.md`](../docs/10-tests.md)
- NOTEBOOK v2.1: [`NOTEBOOK.md`](../NOTEBOOK.md) — sección Advanced E2E
- Misión smoke: [`16-smoke-e2e-playwright.md`](./16-smoke-e2e-playwright.md)
- Siguiente: [`18-visual-regression-playwright.md`](./18-visual-regression-playwright.md)
