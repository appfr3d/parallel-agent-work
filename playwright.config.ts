import { defineConfig, devices } from '@playwright/test';

// Set BASE_URL to test a running preview, for example a Portless URL.
// Without it, Playwright starts `npm run dev` and tests http://localhost:5173.
const baseURL = process.env.BASE_URL;

export default defineConfig({
  testDir: 'tests/ui',
  reporter: 'list',
  use: {
    baseURL: baseURL ?? 'http://localhost:5173',
    ignoreHTTPSErrors: true
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: baseURL
    ? undefined
    : { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: false }
});
