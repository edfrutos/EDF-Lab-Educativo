'use strict';

const { test } = require('@playwright/test');
const { runAuthSmokeFlow } = require('../helpers/auth-smoke-flow.js');

const email = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const password = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

test.describe('Smoke auth — dashboard Vue', () => {
  test('gate → login → tabla con datos → logout → gate', async ({ page }) => {
    await page.goto('/');
    await runAuthSmokeFlow(page, { email, password });
  });
});
