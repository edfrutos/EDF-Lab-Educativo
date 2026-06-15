# Research: Phase 31 — CRUD E2E multi-dashboard

**Date:** 2026-06-15  
**Phase:** 31-crud-e2e-multi-dashboard  
**Requirement:** QA-ADV-02  
**Depends on:** Phase 30 (`crud-flow.js`, vanilla spec)

## Objetivo

React (`:5174`) y Vue (`:5175`) ejecutan el mismo `runCrudFlow()` que vanilla, sin duplicar aserciones. Suite E2E pasa de 4 a **6 tests** (3 smoke + 3 CRUD).

## Hallazgo crítico: IDs CRUD solo en vanilla

`runCrudFlow` usa selectores por ID definidos en `dashboard/index.html`:

| Selector | Vanilla | React | Vue |
|----------|---------|-------|-----|
| `#login-email` | ✓ | ✓ LoginGate | ✓ LoginGate |
| `#login-password` | ✓ | ✓ | ✓ |
| `#user-name-input` | ✓ | ✗ `name="name"` sin id | ✗ |
| `#user-email-input` | ✓ | ✗ | ✗ |
| `#user-submit-button` | ✓ | ✗ submit sin id | ✗ |
| `#users-table-body` | ✓ | ✗ tbody sin id | ✗ (dos `<tbody>`) |

**Decisión:** Añadir los mismos `id` en `UserForm` y `UsersTable` de React/Vue (cambio mínimo, didáctico — paridad de contrato E2E con vanilla). No usar `getByLabel('Email')` por colisión login vs CRUD.

## Comportamiento compartido ya alineado

- Botones tabla: texto «Editar» / «Eliminar» (`getByRole('button', { name })`)
- Submit labels: «Crear usuario» / «Guardar cambios» (desde App state)
- Delete: `window.confirm('¿Seguro que quieres eliminar este usuario?')` en `App.jsx` / `App.vue`
- Login: `#login-email`, `#login-password`, «Entrar», «Cerrar sesión»

## Playwright config (actual)

```javascript
// vanilla — ya incluye CRUD
testMatch: /(auth-smoke|crud)\.vanilla\.spec\.js/,

// react / vue — solo smoke
testMatch: /auth-smoke\.react\.spec\.js/,
testMatch: /auth-smoke\.vue\.spec\.js/,
```

**Target:**

```javascript
testMatch: /(auth-smoke|crud)\.react\.spec\.js/,
testMatch: /(auth-smoke|crud)\.vue\.spec\.js/,
```

## Specs nuevos (espejo de `crud.vanilla.spec.js`)

- `e2e/tests/crud.react.spec.js` — `baseURL` proyecto react `:5174`
- `e2e/tests/crud.vue.spec.js` — `baseURL` proyecto vue `:5175`

Mismo patrón: `page.goto('/')` + `runCrudFlow(page, { operatorEmail, operatorPassword })`.

## UsersTable — dónde poner `#users-table-body`

- **React:** `tbody` del listado con `users.map` (no el empty-state tbody).
- **Vue:** `tbody` del `v-else` con `v-for="user in users"`.

El helper filtra filas con `page.locator('#users-table-body tr').filter({ hasText: email })` — funciona tras create aunque antes hubiera empty state (el tbody con datos reemplaza el vacío en Vue; en React cambia de rama).

## Documentación

Ampliar `docs/10-tests.md` sección CRUD: React/Vue specs, 6 tests totales, nota de IDs alineados en los tres dashboards.

## Fuera de alcance (fase 31)

- Cambios en `crud-flow.js` salvo comentario JSDoc si hace falta
- Postgres E2E (fase 32)
- Multi-browser (fase 33)
