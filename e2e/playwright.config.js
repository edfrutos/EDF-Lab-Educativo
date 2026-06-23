'use strict';

const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const repoRoot = path.join(__dirname, '..');
const isCI = !!process.env.CI;

const apiBaseUrl = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:3100';

const apiEnv = {
  PORT: '3100',
  JWT_SECRET: process.env.E2E_JWT_SECRET || 'e2e-local-secret-not-for-production',
  DB_FILE: 'data/e2e.users.db',
  ADMIN_EMAIL: process.env.E2E_OPERATOR_EMAIL || 'admin@lab.local',
  ADMIN_PASSWORD: process.env.E2E_OPERATOR_PASSWORD || 'changeme',
  LOGIN_RATE_LIMIT_MAX: process.env.LOGIN_RATE_LIMIT_MAX || '1000',
  CORS_ORIGINS:
    'http://localhost:5173,http://localhost:5174,http://localhost:5175,' +
    'http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175'
};

const dashboardDevEnv = {
  VITE_API_BASE_URL: apiBaseUrl,
  VITE_DEV_HOST: '127.0.0.1'
};

const dashboards = [
  {
    id: 'vanilla',
    baseURL: 'http://localhost:5173',
    testMatch: /(auth-smoke|crud)\.vanilla\.spec\.js/
  },
  {
    id: 'react',
    baseURL: 'http://127.0.0.1:5174',
    testMatch: /(auth-smoke|crud)\.react\.spec\.js/
  },
  {
    id: 'vue',
    baseURL: 'http://127.0.0.1:5175',
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

// Suite visual separada de los E2E funcionales.
projects.push({
  name: 'vanilla-chromium-visual',
  testMatch: /visual\.vanilla\.spec\.js/,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 720 }
  }
});

// Regresión visual multi-dashboard (fase 35): React y Vue.
projects.push({
  name: 'react-chromium-visual',
  testMatch: /visual\.react\.spec\.js/,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5174',
    viewport: { width: 1280, height: 720 }
  }
});

projects.push({
  name: 'vue-chromium-visual',
  testMatch: /visual\.vue\.spec\.js/,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5175',
    viewport: { width: 1280, height: 720 }
  }
});

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
  workers: isCI ? 1 : 3,
  reporter: isCI ? [['github'], ['list']] : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  // Baselines visuales versionadas en e2e/__snapshots__.
  snapshotPathTemplate: '{testDir}/../__snapshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  webServer: [
    {
      command: 'npm start',
      cwd: path.join(repoRoot, 'api'),
      url: `${apiBaseUrl}/health`,
      timeout: 60_000,
      // Nunca reutilizar :3100 — un `npm start` manual usa rate-limit bajo (10) y DB distinta.
      reuseExistingServer: false,
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
      url: 'http://127.0.0.1:5174',
      timeout: 120_000,
      reuseExistingServer: !isCI,
      env: dashboardDevEnv
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'dashboard-vue'),
      url: 'http://127.0.0.1:5175',
      timeout: 120_000,
      reuseExistingServer: !isCI,
      env: dashboardDevEnv
    }
  ],
  projects
});
