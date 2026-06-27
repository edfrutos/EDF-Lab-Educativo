'use strict';

const { expect } = require('@playwright/test');

/**
 * Portal v3 (vanilla) vs login clásico (React/Vue).
 */
async function expectLoginGateHeading(page) {
  const portalHeading = page.getByRole('heading', { name: 'Portal EDF Lab' });
  const classicHeading = page.getByRole('heading', { name: 'Iniciar sesión' });
  await expect(portalHeading.or(classicHeading)).toBeVisible();
  return portalHeading;
}

/**
 * Espera a que React/Vue terminen bootstrapAuth (vanilla no muestra este texto).
 * En vanilla v3.0 el registro es la pestaña activa: hay que abrir «Ya tengo cuenta».
 */
async function waitForLoginGateReady(page) {
  await expect(page.getByText(/Comprobando sesión/)).toHaveCount(0, { timeout: 30_000 });

  const portalHeading = await expectLoginGateHeading(page);

  if (await portalHeading.isVisible()) {
    await page.getByRole('tab', { name: 'Ya tengo cuenta' }).click();
  }

  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('#login-password')).toBeVisible();
}

/**
 * Login UI compartido entre vanilla, React y Vue.
 * Espera POST /auth/login OK y panel autenticado estable (botón Cerrar sesión).
 */
async function loginViaUi(page, { email, password }) {
  await waitForLoginGateReady(page);

  const emailInput = page.locator('#login-email');
  const passwordInput = page.locator('#login-password');

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await expect(emailInput).toHaveValue(email);
  await expect(passwordInput).toHaveValue(password);

  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/login') && response.request().method() === 'POST',
    { timeout: 15_000 }
  );

  await page.getByRole('button', { name: 'Entrar' }).click();

  const login = await loginResponse;
  const loginHint =
    login.status() === 429
      ? 'rate limit — cierra la API en :3100 (proceso stale sin LOGIN_RATE_LIMIT_MAX=1000) y reintenta npm run test:e2e'
      : login.status() === 403
        ? 'credenciales — comprueba E2E_OPERATOR_PASSWORD y api/data/e2e.users.db'
        : 'comprueba E2E_OPERATOR_PASSWORD, api/data/e2e.users.db y que la API E2E esté en :3100';
  expect(login.ok(), `POST /auth/login respondió ${login.status()} — ${loginHint}`).toBeTruthy();

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible({ timeout: 15_000 });
}

module.exports = { expectLoginGateHeading, waitForLoginGateReady, loginViaUi };
