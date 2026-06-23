'use strict';

const { expect } = require('@playwright/test');
const { loginViaUi } = require('./login-ui.js');

/**
 * Prepara un estado visual estable tras login para snapshots del dashboard.
 * Reutilizable en fase 35 para React/Vue y sin logout (solo setup de captura).
 * Aplica mitigaciones anti-flake: viewport fijo, desactivar animaciones y masks.
 */
async function prepareVisualState(page, { email, password }) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await loginViaUi(page, { email, password });

  const panel = page.locator('#dashboard-panel');
  await expect(panel).toBeVisible();
  await expect(page.getByText('John Doe')).toBeVisible();

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
