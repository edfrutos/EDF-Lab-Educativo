'use strict';

const { expect } = require('@playwright/test');

/**
 * Smoke auth compartido: gate → login UI → tabla con datos → logout → gate.
 * Selectores alineados entre vanilla, React y Vue (#login-email, roles en español).
 */
async function runAuthSmokeFlow(page, { email, password }) {
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
}

async function runOAuthMockSmokeFlow(page) {
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

  await page.getByRole('button', { name: 'Continuar con OAuth mock' }).click();

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
}

module.exports = { runAuthSmokeFlow, runOAuthMockSmokeFlow };
