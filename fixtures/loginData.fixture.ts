import { test as base } from '@playwright/test';
import { ENV } from '../utils/env';

type LoginData = {
  email: string;
  password: string;
};

export const test = base.extend<{ loginData: LoginData }>({
  loginData: async ({}, use) => {
    await use({
      email: ENV.USER_EMAIL,
      password: ENV.USER_PASSWORD,
    });
  },
});

export { expect } from '@playwright/test';
