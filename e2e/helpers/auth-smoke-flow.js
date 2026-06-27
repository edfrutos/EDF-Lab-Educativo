'use strict';

const { expect } = require('@playwright/test');
const { expectLoginGateHeading, loginViaUi, waitForLoginGateReady } = require('./login-ui.js');

/**
 * Smoke auth compartido: gate → login UI → tabla con datos → logout → gate.
 * Selectores alineados entre vanilla, React y Vue (#login-email, roles en español).
 */
async function runAuthSmokeFlow(page, { email, password }) {
  await waitForLoginGateReady(page);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

  await loginViaUi(page, { email, password });

  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expectLoginGateHeading(page);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
}

async function runOAuthMockSmokeFlow(page) {
  await waitForLoginGateReady(page);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

  await page.getByRole('button', { name: 'Continuar con OAuth mock' }).click();

  await expect(page.locator('#dashboard-panel')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expectLoginGateHeading(page);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
}

module.exports = { runAuthSmokeFlow, runOAuthMockSmokeFlow };
