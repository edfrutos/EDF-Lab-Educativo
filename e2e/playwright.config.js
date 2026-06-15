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

const dashboards = [
  {
    id: 'vanilla',
    baseURL: 'http://localhost:5173',
    testMatch: /(auth-smoke|crud)\.vanilla\.spec\.js/
  },
  {
    id: 'react',
    baseURL: 'http://localhost:5174',
    testMatch: /(auth-smoke|crud)\.react\.spec\.js/
  },
  {
    id: 'vue',
    baseURL: 'http://localhost:5175',
    testMatch: /(auth-smoke|crud)\.vue\.spec\.js/
  }
];

const ciBrowsers = [
  { id: 'chromium', device: devices['Desktop Chrome'] },
  { id: 'firefox', device: devices['Desktop Firefox'] }
];

const projects = dashboards.flatMap((dashboard) =>
  ciBrowsers.map((browser) => ({
    name: `${dashboard.id}-${browser.id}`,
    testMatch: dashboard.testMatch,
    use: { ...browser.device, baseURL: dashboard.baseURL }
  }))
);

// WebKit solo local — ver docs/10-tests.md (no forma parte de test:e2e:ci)
projects.push({
  name: 'vanilla-webkit',
  testMatch: /(auth-smoke|crud)\.vanilla\.spec\.js/,
  use: { ...devices['Desktop Safari'], baseURL: 'http://localhost:5173' }
});

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests'),
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
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
  projects
});
