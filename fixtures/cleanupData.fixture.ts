import { test as baseTest, expect } from './loginPage.fixture';

type CleanupDataFixture = {
  getUsername: () => string;
  getCleanupContext: () => { email: string; password: string; username: string };
};

export const test = baseTest.extend<CleanupDataFixture>({
  getUsername: async ({ loginData }, use) => {
    const username = loginData.email.split('@')[0];
    await use(() => username);
  },

  getCleanupContext: async ({ loginData }, use) => {
    const context = {
      email: loginData.email,
      password: loginData.password,
      username: loginData.email.split('@')[0],
    };
    await use(() => context);
  },
});

export { expect };
