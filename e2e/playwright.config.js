'use strict';

const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const repoRoot = path.join(__dirname, '..');
const isCI = !!process.env.CI;

const apiEnv = {
  PORT: '3100',
  JWT_SECRET: process.env.E2E_JWT_SECRET || 'e2e-local-secret-not-for-production',
  DB_FILE: 'data/e2e.users.db',
  ADMIN_EMAIL: process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local',
  ADMIN_PASSWORD: process.env.E2E_OPERATOR_PASSWORD || 'changeme',
  LOGIN_RATE_LIMIT_MAX: process.env.LOGIN_RATE_LIMIT_MAX || '1000',
  CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174,http://localhost:5175'
};

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests'),
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer: [
    {
      command: 'npm start',
      cwd: path.join(repoRoot, 'api'),
      url: 'http://localhost:3100/health',
      timeout: 60_000,
      reuseExistingServer: !isCI,
      env: apiEnv
    },
    {
      command: 'python3 -m http.server 5173',
      cwd: path.join(repoRoot, 'dashboard'),
      url: 'http://localhost:5173',
      timeout: 30_000,
      reuseExistingServer: !isCI
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'dashboard-react'),
      url: 'http://localhost:5174',
      timeout: 120_000,
      reuseExistingServer: !isCI
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'dashboard-vue'),
      url: 'http://localhost:5175',
      timeout: 120_000,
      reuseExistingServer: !isCI
    }
  ],
  projects: [
    {
      name: 'vanilla',
      testMatch: /auth-smoke\.vanilla\.spec\.js/,
      use: { baseURL: 'http://localhost:5173' }
    },
    {
      name: 'react',
      testMatch: /auth-smoke\.react\.spec\.js/,
      use: { baseURL: 'http://localhost:5174' }
    },
    {
      name: 'vue',
      testMatch: /auth-smoke\.vue\.spec\.js/,
      use: { baseURL: 'http://localhost:5175' }
    }
  ]
});
