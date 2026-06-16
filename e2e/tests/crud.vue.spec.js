'use strict';

const { test } = require('@playwright/test');
const { runCrudFlow } = require('../helpers/crud-flow.js');

const operatorEmail = process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local';
const operatorPassword = process.env.E2E_OPERATOR_PASSWORD || 'changeme';

test.describe('CRUD — dashboard Vue', () => {
  test('login → crear → editar → eliminar usuario único', async ({ page }) => {
    await page.goto('/');
    await runCrudFlow(page, { operatorEmail, operatorPassword });
  });
});
