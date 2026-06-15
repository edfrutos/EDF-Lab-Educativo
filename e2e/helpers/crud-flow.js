'use strict';

const { expect } = require('@playwright/test');

/**
 * Flujo CRUD compartido: login UI → crear → editar → eliminar usuario con email único.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} options
 * @param {string} options.operatorEmail - Email del operador (p. ej. admin@lab.local)
 * @param {string} options.operatorPassword - Contraseña del operador
 * @param {object} [options.user] - Datos del usuario CRUD; si se omite, se generan con buildCrudTestUser()
 *
 * Email único por ejecución evita colisiones en SQLite (`api/data/e2e.users.db`)
 * y en Postgres E2E (`edf_lab_e2e`).
 * Delete usa `confirm()` nativo — registrar `page.once('dialog', accept)` antes del click.
 *
 * Reutilizable en fase 31 (React/Vue) con los mismos selectores por ID:
 * `const { runCrudFlow, buildCrudTestUser } = require('../helpers/crud-flow.js');`
 */
function buildCrudTestUser() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    name: `E2E CRUD ${suffix}`,
    email: `e2e.crud.${suffix}@lab.local`,
    editedName: `E2E Editado ${suffix}`,
    editedEmail: `e2e.edited.${suffix}@lab.local`
  };
}

async function runCrudFlow(page, { operatorEmail, operatorPassword, user = buildCrudTestUser() }) {
  await page.locator('#login-email').fill(operatorEmail);
  await page.locator('#login-password').fill(operatorPassword);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();

  await page.locator('#user-name-input').fill(user.name);
  await page.locator('#user-email-input').fill(user.email);
  await page.locator('#user-submit-button').click();

  const createdRow = page.locator('#users-table-body tr').filter({ hasText: user.email });
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText(user.name);

  await createdRow.getByRole('button', { name: 'Editar' }).click();
  await expect(page.locator('#user-submit-button')).toHaveText('Guardar cambios');

  await page.locator('#user-name-input').fill(user.editedName);
  await page.locator('#user-email-input').fill(user.editedEmail);
  await page.locator('#user-submit-button').click();

  const editedRow = page.locator('#users-table-body tr').filter({ hasText: user.editedEmail });
  await expect(editedRow).toBeVisible();
  await expect(editedRow).toContainText(user.editedName);
  await expect(page.locator('#users-table-body')).not.toContainText(user.email);

  page.once('dialog', (dialog) => dialog.accept());
  await editedRow.getByRole('button', { name: 'Eliminar' }).click();

  await expect(page.locator('#users-table-body tr').filter({ hasText: user.editedEmail })).toHaveCount(0);
}

module.exports = { runCrudFlow, buildCrudTestUser };
