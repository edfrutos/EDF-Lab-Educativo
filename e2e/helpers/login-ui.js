'use strict';

const { expect } = require('@playwright/test');

/**
 * Espera a que React/Vue terminen bootstrapAuth (vanilla no muestra este texto).
 */
async function waitForLoginGateReady(page) {
  await expect(page.getByText(/Comprobando sesión/)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('#login-password')).toBeVisible();
}

function isUsersListRequest(response) {
  try {
    const { pathname } = new URL(response.url());
    return pathname === '/users' && response.request().method() === 'GET';
  } catch {
    return false;
  }
}

/**
 * Login UI compartido entre vanilla, React y Vue.
 * Espera POST /auth/login y GET /users OK para evitar flakes con inputs controlados
 * y carreras donde el panel autenticado aparece un instante y vuelve al gate (401).
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
  const usersResponse = page.waitForResponse(
    (response) => isUsersListRequest(response),
    { timeout: 15_000 }
  );

  await page.getByRole('button', { name: 'Entrar' }).click();

  const login = await loginResponse;
  expect(
    login.ok(),
    `POST /auth/login respondió ${login.status()} — comprueba E2E_OPERATOR_PASSWORD y api/data/e2e.users.db`
  ).toBeTruthy();

  const users = await usersResponse;
  expect(
    users.ok(),
    `GET /users respondió ${users.status()} — alinea host API y dashboard (localhost vs 127.0.0.1) o reinicia la API E2E`
  ).toBeTruthy();

  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible({ timeout: 15_000 });
}

module.exports = { waitForLoginGateReady, loginViaUi };
