import { test as base } from '@playwright/test';

type LoginData = {
  email: string;
  password: string;
};

export const test = base.extend<{ loginData: LoginData }>({
  loginData: async ({}, use) => {
    const data: LoginData = {
      // Prefer environment variables so credentials are never hardcoded in CI.
      // Falls back to the defaults so local runs work without a .env file.
      email: process.env.TEST_EMAIL ?? 'yash1@gmail.com',
      password: process.env.TEST_PASSWORD ?? '12345678',
    };
    await use(data);
  },
});

export { expect } from '@playwright/test';
