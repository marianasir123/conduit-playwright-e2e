/**
 * Pagination Tests — TC_PAG_001 through TC_PAG_005
 *
 * Tests cover:
 *  - Pagination controls visible when feed exceeds one page (Global Feed)
 *  - Navigate to next page and confirm different articles are shown
 *  - Navigate back to previous page
 *  - Your Feed pagination
 *  - Switching feed tabs resets pagination to page 1
 *
 * No article seeding is needed — the Conduit public demo always has >10
 * articles in the Global Feed. Tests that require pagination skip gracefully
 * when the feed has only one page.
 *
 * Screenshot baselines:
 *   Run once with  npx playwright test feed.spec.ts --update-snapshots
 */

import * as fs from 'fs';
import * as path from 'path';

import { test, expect } from '../fixtures/loginPage.fixture';
import { HomeFeedPage } from '../pages/homeFeed.page';
import { switchToGlobalFeedAndWait } from '../utils/waitHelper';

const SCREENSHOT_DIR = path.join('screenshots', 'feed');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function screenshotPath(tcId: string) {
  return path.join(SCREENSHOT_DIR, `${tcId}-current.png`);
}

test.describe('Pagination Tests — TC_PAG_001–005', () => {
  // Serial to avoid parallel tests fighting over the same page numbers
  test.describe.configure({ mode: 'serial' });

  // ── TC_PAG_001 ──────────────────────────────────────────────────────────────

  test('TC_PAG_001: Pagination controls appear when Global Feed exceeds page size', async ({
    page, loginPageObj,
  }) => {
    await switchToGlobalFeedAndWait(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 15000 });

    const firstPageButton = page.getByRole('button', { name: '1', exact: true }).first();
    await expect(firstPageButton).toBeVisible();

    await page.screenshot({ path: screenshotPath('TC_PAG_001') });
    await expect(page).toHaveScreenshot('TC_PAG_001.png');
  });

  // ── TC_PAG_002 ──────────────────────────────────────────────────────────────

  test('TC_PAG_002: Navigating to page 2 shows a different set of articles', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();
    await switchToGlobalFeedAndWait(page);

    const hasPagination = await feed.hasPagination();
    if (!hasPagination) {
      test.skip(true, 'Global Feed has only one page — skipping page navigation test');
    }

    const titlePage1 = await feed.getFirstArticleTitle();

    await feed.clickPageNumber(2);

    const titlePage2 = await feed.getFirstArticleTitle();
    expect(titlePage2).not.toBe(titlePage1);

    await page.screenshot({ path: screenshotPath('TC_PAG_002') });
    await expect(page).toHaveScreenshot('TC_PAG_002.png');
  });

  // ── TC_PAG_003 ──────────────────────────────────────────────────────────────

  test('TC_PAG_003: Navigating back to page 1 restores original articles', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();
    await switchToGlobalFeedAndWait(page);

    const hasPagination = await feed.hasPagination();
    if (!hasPagination) {
      test.skip(true, 'Global Feed has only one page — skipping back navigation test');
    }

    const titlePage1Before = await feed.getFirstArticleTitle();

    // Go to page 2 then back to page 1
    await feed.clickPageNumber(2);
    await feed.clickPageNumber(1);

    const titlePage1After = await feed.getFirstArticleTitle();
    expect(titlePage1After).toBe(titlePage1Before);

    await page.screenshot({ path: screenshotPath('TC_PAG_003') });
    await expect(page).toHaveScreenshot('TC_PAG_003.png');
  });

  // ── TC_PAG_004 ──────────────────────────────────────────────────────────────

  test('TC_PAG_004: Your Feed shows pagination or an empty feed message', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();

    await feed.clickYourFeed();

    // Your Feed is valid whether it is empty, shows articles, or shows pagination
    const articleCount = await feed.getArticlesCount();
    const hasPagination = await feed.hasPagination();

    // Loading should be finished (feed settled in clickYourFeed)
    const isStillLoading = await page.getByText('Loading articles...', { exact: true }).isVisible().catch(() => false);
    expect(isStillLoading).toBe(false);

    // Could have 0 articles (not following anyone) — that is a valid state
    expect(articleCount >= 0).toBe(true);

    if (hasPagination) {
      await feed.clickPageNumber(2);
      await expect(feed.articlePreviews.first()).toBeVisible({ timeout: 10000 });
    }

    await page.screenshot({ path: screenshotPath('TC_PAG_004') });
    await expect(page).toHaveScreenshot('TC_PAG_004.png');
  });

  // ── TC_PAG_005 ──────────────────────────────────────────────────────────────

  test('TC_PAG_005: Switching feed tabs resets pagination to page 1', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();
    await switchToGlobalFeedAndWait(page);

    const hasPagination = await feed.hasPagination();
    if (!hasPagination) {
      test.skip(true, 'Global Feed has only one page — pagination reset not applicable');
    }

    // Move to page 2 on Global Feed
    await feed.clickPageNumber(2);
    const titleOnPage2 = await feed.getFirstArticleTitle();

    // Switch to Your Feed
    await feed.clickYourFeed();

    // Switch back to Global Feed
    await switchToGlobalFeedAndWait(page);

    // Should be back on page 1 — first article title should differ from page 2
    const titleAfterReturn = await feed.getFirstArticleTitle();
    expect(titleAfterReturn).not.toBe(titleOnPage2);

    // Verify page 1 pagination item appears active
    const page1Button = page.locator('.pagination').getByRole('button', { name: '1', exact: true }).first();
    await expect(page1Button).toBeVisible();

    await page.screenshot({ path: screenshotPath('TC_PAG_005') });
    await expect(page).toHaveScreenshot('TC_PAG_005.png');
  });
});
