import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { Navigation } from '../pages/navigation.page';
import { test as loginDataTest } from './loginData.fixture';

type LoginPageFixture = {
  loginPageObj: LoginPage;
  nav: Navigation;
};

export const test = loginDataTest.extend<LoginPageFixture>({
  nav: async ({ page }, use) => {
    const navigation = new Navigation(page);
    await use(navigation);
  },

  loginPageObj: async ({ page, loginData, nav }, use) => {
    const loginPage = new LoginPage(page);
    await page.goto('/');
    await nav.clickSignIn();
    await loginPage.login(loginData.email, loginData.password);
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 15000 });
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
