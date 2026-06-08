import { Locator, Page } from '@playwright/test';

export class Navigation {
  readonly page: Page;
  readonly navBar: Locator;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = page.locator('nav.navbar');
    this.logo = page.locator('a.navbar-brand');
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.newArticleLink = page.getByRole('link', { name: /New Article/ });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    // Scoped to the navbar so article-preview author links don't interfere
    this.profileLink = page.locator('nav').locator('a[href^="/profile/"]').first();
  }

  async clickLogo() {
    await this.logo.click();
    await this.page.waitForURL(/\/$/, { timeout: 5000 });
  }

  async clickHome() {
    await this.homeLink.click();
    await this.page.waitForURL(/\/$/, { timeout: 5000 });
  }

  async clickSignIn() {
    await this.signInLink.click();
    await this.page.waitForURL(/\/login/, { timeout: 5000 });
  }

  async clickSignUp() {
    await this.signUpLink.click();
    await this.page.waitForURL(/\/register/, { timeout: 5000 });
  }

  async clickNewArticle() {
    await this.newArticleLink.click();
    await this.page.waitForURL(/\/editor/, { timeout: 5000 });
  }

  async clickSettings() {
    await this.settingsLink.click();
    await this.page.waitForURL(/\/settings/, { timeout: 5000 });
  }

  async clickProfile() {
    await this.profileLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.profileLink.click();
    await this.page.waitForURL(/\/profile/, { timeout: 5000 });
  }

  async logout() {
    await this.clickSettings();
    const logoutBtn = this.page.getByRole('button', { name: /logout|click here to logout/i });
    await logoutBtn.click();
    await this.page.waitForURL(/\/$/, { timeout: 5000 });
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.newArticleLink.isVisible().catch(() => false);
  }

  async isLoggedOut(): Promise<boolean> {
    return await this.signInLink.isVisible().catch(() => false);
  }
}
