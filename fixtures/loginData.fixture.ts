import { test as base } from '@playwright/test';
import { ENV } from '../utils/env';
import { loginViaApi } from '../utils/apiHelper';

type LoginData = {
  email: string;
  password: string;
  /** Actual Conduit username — resolved via API, not derived from email. */
  username: string;
};

/**
 * Worker-scoped so the API login runs once per worker, not once per test.
 * Username from the API is the source of truth — email prefix often differs
 * from the registered username.
 */
export const test = base.extend<{ username: string }, { loginData: LoginData }>({
  loginData: [
    async ({ playwright }, use) => {
      const apiContext = await playwright.request.newContext();
      try {
        const { username } = await loginViaApi(
          apiContext,
          ENV.USER_EMAIL,
          ENV.USER_PASSWORD,
        );
        await use({
          email: ENV.USER_EMAIL,
          password: ENV.USER_PASSWORD,
          username,
        });
      } finally {
        await apiContext.dispose();
      }
    },
    { scope: 'worker' },
  ],

  /** Shorthand — use `{ username }` in tests instead of `loginData.username`. */
  username: async ({ loginData }, use) => {
    await use(loginData.username);
  },
});

export { expect } from '@playwright/test';
