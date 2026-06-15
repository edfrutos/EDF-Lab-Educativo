# Research: Phase 30 — CRUD E2E vanilla

**Date:** 2026-06-15  
**Phase:** 30-crud-e2e-vanilla  
**Requirement:** QA-ADV-01

## Objetivo técnico

Añadir un spec Playwright que, tras login UI real en `:5173`, ejecute create → edit → delete de un usuario con datos únicos por ejecución, encapsulado en un helper reutilizable (`crud-flow.js`) siguiendo el patrón de `auth-smoke-flow.js`.

## Stack existente (no reinventar)

| Pieza | Ubicación | Notas |
|-------|-----------|-------|
| Config Playwright | `e2e/playwright.config.js` | Quad `webServer`, `DB_FILE: data/e2e.users.db`, proyecto `vanilla` con `baseURL :5173` |
| Helper auth | `e2e/helpers/auth-smoke-flow.js` | Login/logout con `#login-email`, roles en español |
| Spec smoke | `e2e/tests/auth-smoke.vanilla.spec.js` | Patrón `test.describe` + helper import |
| Script raíz | `npm run test:e2e` | `playwright test --config=e2e/playwright.config.js` |
| Credenciales E2E | env / defaults | `admin@lab.local` / `changeme` vía `E2E_OPERATOR_*` |

## Selectores estables (vanilla)

### Login (post-gate)

| Elemento | Selector recomendado | Evitar |
|----------|---------------------|--------|
| Email operador | `#login-email` | `getByLabel('Email')` global — colisión con CRUD (NOTEBOOK v2.0) |
| Password | `#login-password` | — |
| Entrar | `getByRole('button', { name: 'Entrar' })` | — |
| Sesión activa | `getByRole('button', { name: 'Cerrar sesión' })` visible | — |

### Formulario CRUD (`dashboard/index.html` + `app.js`)

| Elemento | Selector | Texto UI |
|----------|----------|----------|
| Nombre | `#user-name-input` | label «Nombre» |
| Email usuario | `#user-email-input` | label «Email» — usar ID, no label global |
| Submit | `#user-submit-button` | «Crear usuario» / «Guardar cambios» |
| Cancelar edición | `#cancel-edit-button` | «Cancelar edición» (hidden en modo create) |
| Modo edición | `#form-mode-message` | `Editando usuario {id}` |

### Tabla

| Elemento | Selector | Notas |
|----------|----------|-------|
| tbody | `#users-table-body` | Filas `<tr>` con celdas id, name, email, acciones |
| Fila por email | `#users-table-body tr` + `filter({ hasText: email })` | Más estable que nth-child |
| Editar | `button[data-action="edit"]` dentro de la fila | `textContent: 'Editar'` |
| Eliminar | `button[data-action="delete"]` dentro de la fila | `textContent: 'Eliminar'` |

## Diálogo `confirm()` en delete

`dashboard/app.js` línea ~357:

```javascript
const shouldDelete = confirm('¿Seguro que quieres eliminar este usuario?');
```

**Playwright:** registrar handler **antes** del click en Eliminar:

```javascript
page.once('dialog', async (dialog) => {
  expect(dialog.type()).toBe('beforeunload'); // NO — type is 'confirm'
  expect(dialog.message()).toContain('eliminar');
  await dialog.accept();
});
// o en una línea:
page.once('dialog', (d) => d.accept());
await row.getByRole('button', { name: 'Eliminar' }).click();
```

Usar `page.once('dialog', ...)` para no interferir con otros diálogos. Tipo real: `'confirm'`.

## Estrategia de email único

**Problema:** `e2e.users.db` persiste entre ejecuciones locales (`reuseExistingServer: true`). Emails fijos provocan 409/duplicado o filas fantasma.

**Solución:** sufijo por ejecución en el helper:

```javascript
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const user = {
  name: `E2E CRUD ${suffix}`,
  email: `e2e.crud.${suffix}@lab.local`,
  editedName: `E2E Editado ${suffix}`,
  editedEmail: `e2e.edited.${suffix}@lab.local`,
};
```

Exportar `buildCrudTestUser()` desde el helper para que fases 31 (React/Vue) reutilicen la misma fábrica de datos.

## Flujo del helper `runCrudFlow`

Secuencia alineada con QA-ADV-01 y criterios ROADMAP:

1. **Login** — mismos pasos que `runAuthSmokeFlow` hasta ver tabla (sin logout).
2. **Create** — rellenar `#user-name-input`, `#user-email-input`, click `#user-submit-button` («Crear usuario»), esperar fila con email en `#users-table-body`, opcionalmente feedback «POST /users».
3. **Edit** — click `Editar` en fila del email original; verificar form en modo edición (`Guardar cambios`, `#form-mode-message`); cambiar nombre y email; submit; verificar fila con email editado y ausencia del original.
4. **Delete** — `page.once('dialog', accept)`; click `Eliminar`; esperar que la fila con email editado no esté visible.

**Parámetros sugeridos:**

```javascript
async function runCrudFlow(page, {
  operatorEmail,
  operatorPassword,
  user = buildCrudTestUser(),
}) { ... }
```

## Aserciones recomendadas

- `expect(row).toBeVisible()` tras create.
- `expect(page.locator('#user-submit-button')).toHaveText('Guardar cambios')` tras Editar.
- `expect(page.locator('#users-table-body')).not.toContainText(originalEmail)` tras edit (o fila con nuevo email visible).
- `expect(row).toHaveCount(0)` o `toBeHidden()` tras delete.

## Config Playwright (plan 02)

Proyecto `vanilla` actual:

```javascript
testMatch: /auth-smoke\.vanilla\.spec\.js/,
```

Ampliar a:

```javascript
testMatch: /(auth-smoke|crud)\.vanilla\.spec\.js/,
```

React/Vue sin cambios en fase 30 — CRUD multi-dashboard es fase 31.

Suite completa tras fase 30: **4 tests** (3 auth smoke + 1 crud vanilla).

## Pitfalls documentados (v2.0)

1. **Strict mode en labels Email** — siempre IDs `#login-email` / `#user-email-input`.
2. **Puertos ocupados** — cerrar servidores viejos antes de E2E.
3. **BD E2E sucia** — borrar `api/data/e2e.users.db` si estado inconsistente; emails únicos mitigan en condiciones normales.
4. **Dialog no manejado** — delete sin `dialog.accept()` cuelga el test.

## Documentación mínima (plan 02)

Sección breve en `docs/10-tests.md`:

- Qué cubre el spec CRUD vanilla.
- Cómo ejecutar solo CRUD: `npx playwright test crud.vanilla --config=e2e/playwright.config.js`.
- Referencia al helper `e2e/helpers/crud-flow.js`.
- Nota sobre email único y diálogo confirm.

DOCS-01 completo (Postgres E2E, multi-browser) queda para fases 32–33.

## Architectural responsibility

| Capa | Responsabilidad fase 30 |
|------|-------------------------|
| `e2e/helpers/` | Lógica CRUD reutilizable |
| `e2e/tests/` | Spec vanilla que invoca helper |
| `e2e/playwright.config.js` | Incluir spec en proyecto vanilla |
| `docs/10-tests.md` | Borrador sección CRUD |
| `dashboard/` | **Sin cambios** — selectores ya estables |

## Out of scope (fase 30)

- Specs React/Vue CRUD (fase 31, QA-ADV-02).
- Postgres E2E (fase 32).
- Multi-browser CI (fase 33).
- Cambios en API o dashboard para «facilitar» tests.
