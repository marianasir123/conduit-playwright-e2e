import { test as loginDataTest } from './loginData.fixture';
import { LoginPage } from '../pages/login.page';
import { Navigation } from '../pages/navigation.page';
import { ProfilePage } from '../pages/profile.page';

type LoginPageFixture = {
  loginPageObj: LoginPage;
  nav: Navigation;
  profilePage: ProfilePage;
};

export const test = loginDataTest.extend<LoginPageFixture>({
  nav: async ({ page }, use) => {
    await use(new Navigation(page));
  },

  loginPageObj: async ({ page, loginData, nav }, use) => {
    const loginPage = new LoginPage(page);
    await page.goto('/');
    await nav.clickSignIn();
    await loginPage.login(loginData.email, loginData.password);
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 15000 });
    await use(loginPage);
  },

  profilePage: async ({ page, username, loginPageObj }, use) => {
    await use(new ProfilePage(page, username));
  },
});

export { expect } from '@playwright/test';
