import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly myPostsTab: Locator;
  readonly favoritedPostsTab: Locator;
  readonly articlesContainer: Locator;
  readonly editProfileSettingsLink: Locator;
  readonly profileName: Locator;

  constructor(page: Page, username: string) {
    this.page = page;
    this.myPostsTab = page.getByRole('link', { name: 'My Posts' });
    this.favoritedPostsTab = page.getByRole('link', { name: 'Favorited Posts' });
    this.articlesContainer = page.locator('app-article-list');
    this.editProfileSettingsLink = page.getByRole('link', { name: /Edit Profile Settings/ });
    this.profileName = page.getByRole('heading', { level: 4 });
  }

  async gotoProfile(username: string) {
    await this.page.goto(`/profile/${username}`);
  }

  async clickMyPostsTab() {
    await this.myPostsTab.click();
    await this.page.waitForURL(/\/profile\/[^\/]+\/?$/, { timeout: 5000 });
  }

  async clickFavoritedPostsTab() {
    await this.favoritedPostsTab.click();
    await this.page.waitForURL(/\/profile\/[^\/]+\/favorites/, { timeout: 5000 });
  }

  async getArticlesCount() {
    return await this.page.locator('app-article-preview').count();
  }

  async getArticleTitleByIndex(index: number) {
    const articles = this.page.locator('app-article-preview');
    const article = articles.nth(index);
    const titleLocator = article.getByRole('heading', { level: 1 });
    return await titleLocator.textContent();
  }

  async clickArticleByTitle(title: string) {
    const articleLink = this.page.locator(`a:has(h1:text-matches("${title}.*", "i"))`).first();
    await articleLink.click();
    await this.page.waitForURL(/\/article\//, { timeout: 5000 });
  }

  async isArticleVisible(title: string): Promise<boolean> {
    const articleLocator = this.page.locator('text=' + title).first();
    return await articleLocator.isVisible().catch(() => false);
  }

  async getProfileUsername() {
    return await this.profileName.textContent();
  }

  async clickEditProfileSettings() {
    await this.editProfileSettingsLink.click();
    await this.page.waitForURL(/\/settings/, { timeout: 5000 });
  }
}
