/**
 * Centralised environment configuration.
 *
 * How to set up:
 *   Local  → cp .env.example .env  then fill in your values
 *   CI/CD  → add USER_EMAIL and USER_PASSWORD as repository secrets
 *
 * All environment access in the project must go through this module —
 * never read process.env directly in tests, fixtures, or utilities.
 */

/**
 * Reads a required environment variable.
 * Throws a descriptive error when it is missing so the problem surfaces
 * immediately at startup rather than silently mid-test.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `\n[env] Required environment variable "${key}" is not set.\n` +
      `  → Run:  cp .env.example .env\n` +
      `  → Then fill in a value for ${key} and re-run the tests.\n`,
    );
  }
  return value;
}

/**
 * Reads an optional environment variable, falling back to a default.
 * Use this only for non-sensitive settings (e.g. base URL).
 */
function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const ENV = {
  /** Application base URL — defaults to the public demo site. */
  BASE_URL: optionalEnv('BASE_URL', 'https://conduit.bondaracademy.com'),

  /**
   * Test account credentials.
   * Must be set in .env (local) or repository secrets (CI).
   * These will never appear in source code.
   */
  USER_EMAIL: requireEnv('USER_EMAIL'),
  USER_PASSWORD: requireEnv('USER_PASSWORD'),
};
