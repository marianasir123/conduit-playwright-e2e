import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Load .env FIRST — must happen before any utils/env module is evaluated.
 * In CI the variables arrive as secrets, so dotenv is a no-op there.
 *
 * Import order matters: keep dotenv.config() before all other project imports
 * so that process.env is populated before utils/env.ts runs requireEnv().
 */
dotenv.config();

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

  /**
   * CI runners are slower than local machines — give each test more time.
   * 60s per test in CI, 30s locally.
   */
  timeout: process.env.CI ? 60_000 : 30_000,

  /**
   * Reporters:
   *  - list    → readable console output
   *  - html    → interactive HTML report (uploaded as CI artifact)
   *  - json    → machine-readable results for scripts/generate-test-report.mjs
   *  - github  → annotates failing lines in the GitHub Actions UI (CI only)
   *  - junit   → XML results shown in GitHub Checks via dorny/test-reporter (CI only)
   */
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['github'],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
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
