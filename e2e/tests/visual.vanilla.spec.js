'use strict';

const { test, expect } = require('@playwright/test');
const { prepareVisualState, getVisualScreenshotOptions } = require('../helpers/visual-flow.js');

const operatorEmail = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const operatorPassword = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

test.describe('Visual — dashboard vanilla', () => {
  test('dashboard post-login snapshot estable', async ({ page }) => {
    await prepareVisualState(page, { email: operatorEmail, password: operatorPassword });
    const panel = page.locator('#dashboard-panel');
    await expect(panel).toHaveScreenshot('dashboard-post-login.png', getVisualScreenshotOptions(page));
  });
});
