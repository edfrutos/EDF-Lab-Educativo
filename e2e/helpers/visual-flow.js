'use strict';

const { expect } = require('@playwright/test');

/**
 * Prepara un estado visual estable tras login para snapshots del dashboard.
 * Reutilizable en fase 35 para React/Vue y sin logout (solo setup de captura).
 * Aplica mitigaciones anti-flake: viewport fijo, desactivar animaciones y masks.
 */
async function prepareVisualState(page, { email, password }) {
  await page.goto('/');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.locator('#dashboard-panel')).toBeVisible();
  await expect(page.locator('#login-gate')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 720 });

  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    `
  });
}

/**
 * Opciones estándar de screenshot para reducir ruido visual.
 * Mantiene threshold didáctico bajo y enmascara zonas dinámicas conocidas.
 */
function getVisualScreenshotOptions(page) {
  return {
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
    mask: [page.locator('#health-timestamp'), page.locator('#users-table-body')]
  };
}

module.exports = { prepareVisualState, getVisualScreenshotOptions };
