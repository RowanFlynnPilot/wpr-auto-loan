import { defineConfig, devices } from '@playwright/test';

// The smoke test runs against the built site, served the way Pages serves
// it (same base path), on a desktop and on a phone. It is what the deploy
// workflow runs after the build and before the upload.
export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.pw\.ts/,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4173/wpr-auto-loan/' },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/wpr-auto-loan/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
