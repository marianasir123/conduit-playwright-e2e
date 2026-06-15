import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object for the Conduit Home Feed (/).
 *
 * Feed tabs and popular tags render as clickable text/div elements (not links).
 * Pagination uses buttons inside `.pagination`.
 */
export class HomeFeedPage {
  readonly page: Page;
  readonly globalFeedTab: Locator;
  readonly yourFeedTab: Locator;
  readonly popularTagsList: Locator;
  readonly articlePreviews: Locator;
  readonly paginationItems: Locator;
  readonly activeFeedTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.globalFeedTab = page.locator('.feed-toggle').getByText('Global Feed', { exact: true });
    this.yourFeedTab = page.locator('.feed-toggle').getByText('Your Feed', { exact: true });
    this.popularTagsList = page.locator('.sidebar .tag-pill, .sidebar .tag-list p');
    this.articlePreviews = page.locator('app-article-preview');
    this.paginationItems = page.locator('.pagination .page-item, .pagination li');
    this.activeFeedTab = page.locator('.feed-toggle .nav-link.active, .feed-toggle .active');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/articles') && resp.ok(),
      { timeout: 15000 },
    );
    await this.articlePreviews.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Waits for the "Loading articles…" spinner to disappear so callers can
   * safely inspect article counts / titles after triggering a feed change.
   */
  private async waitForFeedToSettle() {
    const loading = this.page.getByText('Loading articles...', { exact: true });
    // Wait up to 10 s for the loading text to go away (or it may never appear)
    await loading.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async clickGlobalFeed() {
    const tab = this.globalFeedTab;
    if (await tab.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForResponse(
          resp => resp.url().includes('/api/articles') && resp.ok(),
          { timeout: 10000 },
        ),
        tab.click(),
      ]);
    }
    await this.waitForFeedToSettle();
    await expect(this.articlePreviews.first()).toBeVisible({ timeout: 10000 });
  }

  async clickYourFeed() {
    await Promise.all([
      this.page.waitForResponse(
        resp =>
          (resp.url().includes('/api/articles/feed') || resp.url().includes('/api/articles')) &&
          resp.ok(),
        { timeout: 10000 },
      ),
      this.yourFeedTab.click(),
    ]);
    await this.waitForFeedToSettle();
  }

  /** Clicks the first available tag in the Popular Tags sidebar and returns its name. */
  async clickFirstPopularTag(): Promise<string> {
    await this.popularTagsList.first().waitFor({ state: 'visible', timeout: 10000 });
    const tagName = (await this.popularTagsList.first().textContent()) ?? '';
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/api/articles') && resp.ok(),
        { timeout: 10000 },
      ),
      this.popularTagsList.first().click(),
    ]);
    await this.waitForFeedToSettle();
    return tagName.trim();
  }

  /** Clicks a tag by exact name in the Popular Tags sidebar. */
  async clickTagByName(name: string) {
    const tag = this.popularTagsList.filter({ hasText: name }).first();
    await tag.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForResponse(
        resp => resp.url().includes('/api/articles') && resp.ok(),
        { timeout: 10000 },
      ),
      tag.click(),
    ]);
    await this.waitForFeedToSettle();
  }

  async getActiveTabText(): Promise<string> {
    const toggle = this.page.locator('.feed-toggle, ul.nav-pills').first();
    if (await toggle.isVisible().catch(() => false)) {
      return (await toggle.textContent() ?? '').trim();
    }
    const active = this.page.locator('.nav-pills .active, .feed-toggle .active').first();
    return (await active.textContent() ?? '').trim();
  }

  async getArticlesCount(): Promise<number> {
    return await this.articlePreviews.count();
  }

  async getFirstArticleTitle(): Promise<string> {
    const title = await this.articlePreviews.first().locator('h1').textContent();
    return (title ?? '').trim();
  }

  async getPaginationCount(): Promise<number> {
    return await this.paginationItems.count();
  }

  /** Clicks the pagination control for a given page number. */
  async clickPageNumber(n: number) {
    const pageButton = this.page
      .locator('.pagination')
      .getByRole('button', { name: String(n), exact: true })
      .first();
    await pageButton.waitFor({ state: 'visible', timeout: 10000 });
    await pageButton.click();
    await this.page.waitForResponse(
      resp => resp.url().includes('/api/articles') && resp.ok(),
      { timeout: 10000 },
    );
    await expect(this.articlePreviews.first()).toBeVisible({ timeout: 10000 });
  }

  /** Returns true when the sidebar contains at least one popular tag. */
  async hasTags(): Promise<boolean> {
    await this.popularTagsList.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return (await this.popularTagsList.count()) > 0;
  }

  /** Returns true when page 2 of the feed is available. */
  async hasPagination(): Promise<boolean> {
    return this.page.getByRole('button', { name: '2', exact: true }).isVisible().catch(() => false);
  }
}
