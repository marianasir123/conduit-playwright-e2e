import { Locator, Page } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  readonly articleTitle: Locator;
  readonly articleBody: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly favoriteButton: Locator;
  readonly followButton: Locator;
  readonly commentInput: Locator;
  readonly submitCommentButton: Locator;
  readonly comments: Locator;

  constructor(page: Page) {
    this.page = page;
    this.articleTitle = page.getByRole('heading', { level: 1 });
    this.articleBody = page.locator('[class*="article-content"]');
    this.editButton = page.getByRole('link', { name: /Edit Article/ }).first();
    this.deleteButton = page.getByRole('button', { name: /Delete Article/ }).first();
    this.favoriteButton = page.locator('app-favorite-button button').first();
    this.followButton = page.getByRole('button', { name: /Follow/ });
    this.commentInput = page.locator('textarea');
    this.submitCommentButton = page.getByRole('button', { name: /Post Comment/ });
    this.comments = page.locator('[class*="comment"]');
  }

  async getArticleTitle() {
    return await this.articleTitle.textContent();
  }

  async getArticleBody() {
    return await this.articleBody.textContent();
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async clickDelete() {
    await this.deleteButton.click();
  }

  async clickFavorite() {
    await this.favoriteButton.click();
  }

  async clickFollow() {
    await this.followButton.click();
  }

  async openOtherUsersArticle(currentUsername: string) {
    await this.page.goto('/');

    // Use the real API backend to paginate past the test user's accumulated articles
    // and find the first article authored by someone other than currentUsername.
    const apiBase = 'https://conduit-api.bondaracademy.com';
    const limit = 20;
    let offset = 0;
    const maxSearch = 300;

    while (offset < maxSearch) {
      const response = await this.page.request.get(
        `${apiBase}/api/articles?limit=${limit}&offset=${offset}`
      );

      if (!response.ok()) break;

      const body = await response.json();
      const articles: any[] = body.articles ?? [];
      const articlesCount: number = body.articlesCount ?? 0;

      if (articles.length === 0) break;

      const other = articles.find((a) => a.author.username !== currentUsername);

      if (other) {
        await this.page.goto(`/article/${other.slug}`);
        await this.page.waitForURL(/\/article\//, { timeout: 10000 });
        // Wait until the favorite button is rendered before returning
        await this.favoriteButton.waitFor({ state: 'visible', timeout: 10000 });
        return;
      }

      offset += limit;
      if (offset >= articlesCount) break;
    }

    throw new Error(
      `No article by another user found after scanning ${offset} articles`
    );
  }

  async addComment(text: string) {
    await this.commentInput.fill(text);
    await this.submitCommentButton.click();
  }

  async getCommentsCount() {
    return await this.comments.count();
  }
}
