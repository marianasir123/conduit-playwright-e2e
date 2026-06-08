import { defineConfig, devices } from '@playwright/test';

/**
 * Load .env for local runs.
 * In CI the variables are injected by the workflow — dotenv is optional.
 */
// import dotenv from 'dotenv';
// dotenv.config();

export default defineConfig({
  testDir: './tests',

  /**
   * Run all test files in parallel across workers.
   * Individual describe blocks that share state (e.g. article suite) use
   * test.describe.configure({ mode: 'serial' }) to opt out.
   */
  fullyParallel: true,

  /** Prevent accidental test.only commits from slipping into CI. */
  forbidOnly: !!process.env.CI,

  /** Retry twice on CI to absorb transient network flakes. */
  retries: process.env.CI ? 2 : 0,

  /**
   * Single worker in CI avoids race conditions on the shared test account.
   * Locally uses all available CPUs for speed.
   */
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    /** Resolved from env → falls back to the hosted demo site. */
    baseURL: process.env.BASE_URL ?? 'https://conduit.bondaracademy.com',

    /** Capture trace on the first retry so failures are easy to diagnose. */
    trace: 'on-first-retry',

    /** Screenshot only when a test fails. */
    screenshot: 'only-on-failure',

    /** Keep video only for failed tests. */
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to run on additional browsers:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],
});
