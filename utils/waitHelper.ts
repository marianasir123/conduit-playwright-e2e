import { Page, expect } from '@playwright/test';

/**
 * Waits for the Conduit favorite/unfavorite API call to complete.
 *
 * Replaces the repetitive inline pattern:
 *   await page.waitForResponse(resp => resp.url().includes('/favorite') && resp.ok(), { timeout: 10000 });
 */
export async function waitForFavoriteResponse(page: Page): Promise<void> {
  await page.waitForResponse(
    resp => resp.url().includes('/favorite') && resp.ok(),
    { timeout: 10000 },
  );
}

/**
 * Clicks the Global Feed tab and waits until the article list is ready.
 *
 * Replaces the two-step block that appears in TC_ART_002 and TC_ART_017:
 *   await page.getByText('Global Feed').click();
 *   await page.waitForResponse(...articles...);
 *   await expect(page.locator('app-article-preview').first()).toBeVisible(...);
 */
export async function switchToGlobalFeedAndWait(page: Page): Promise<void> {
  await page.getByText('Global Feed').click();
  await page.waitForResponse(
    resp => resp.url().includes('/api/articles') && resp.status() === 200,
    { timeout: 10000 },
  );
  await expect(page.locator('app-article-preview').first()).toBeVisible({ timeout: 10000 });
}
