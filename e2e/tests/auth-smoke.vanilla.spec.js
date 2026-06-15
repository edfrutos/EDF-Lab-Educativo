'use strict';

const { test, expect } = require('@playwright/test');

const email = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const password = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

test.describe('Smoke auth — dashboard vanilla', () => {
  test('gate → login → tabla con datos → logout → gate', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();

    await page.locator('#login-form').getByLabel('Email').fill(email);
    await page.locator('#login-form').getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    await expect(page.locator('#dashboard-panel')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeHidden();
  });
});
