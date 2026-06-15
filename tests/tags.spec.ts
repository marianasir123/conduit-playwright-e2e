/**
 * Tag Filter Tests — TC_TAG_001 through TC_TAG_005
 *
 * Tests cover:
 *  - Filtering the global feed by clicking a tag in the Popular Tags sidebar
 *  - Sidebar tag display
 *  - Clicking a tag from an article detail page
 *  - Tag filter state reflected in URL / active tab
 *  - Returning to global feed from a tag-filtered view
 *
 * Setup:
 *   A tagged article is created via the API in beforeAll so the suite has a
 *   known tag to click. It is deleted in afterAll.
 *
 * Screenshot baselines:
 *   Run once with  npx playwright test tags.spec.ts --update-snapshots
 */

import * as fs from 'fs';
import * as path from 'path';

import { test, expect } from '../fixtures/loginPage.fixture';
import { HomeFeedPage } from '../pages/homeFeed.page';
import { switchToGlobalFeedAndWait } from '../utils/waitHelper';
import { loginViaApi, createArticleViaApi, deleteArticleViaApi } from '../utils/apiHelper';
import { ENV } from '../utils/env';

const SCREENSHOT_DIR = path.join('screenshots', 'tags');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function screenshotPath(tcId: string) {
  return path.join(SCREENSHOT_DIR, `${tcId}-current.png`);
}

test.describe('Tag Filter Tests — TC_TAG_001–005', () => {
  test.describe.configure({ mode: 'serial' });

  let articleSlug = '';
  const TEST_TAG = `qa-tag-${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    const created = await createArticleViaApi(request, token, {
      title: `Tag Test Article ${Date.now()}`,
      description: 'Article used by tag filter tests',
      body: 'Tag filter test body.',
      tagList: [TEST_TAG],
    });
    articleSlug = created.slug;
  });

  test.afterAll(async ({ request }) => {
    if (articleSlug) {
      const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
      await deleteArticleViaApi(request, token, articleSlug).catch(() => {});
    }
  });

  // ── TC_TAG_001 ──────────────────────────────────────────────────────────────

  test('TC_TAG_001: Clicking a tag in the Popular Tags sidebar filters the feed', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();
    await feed.clickGlobalFeed();

    // Use a tag known to have articles in the global feed (not an obscure sidebar tag)
    await feed.clickTagByName('Bondar Academy');

    const count = await feed.getArticlesCount();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: screenshotPath('TC_TAG_001') });
    await expect(page).toHaveScreenshot('TC_TAG_001.png');
  });

  // ── TC_TAG_002 ──────────────────────────────────────────────────────────────

  test('TC_TAG_002: Popular Tags sidebar displays multiple clickable tags', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();

    const hasTags = await feed.hasTags();
    expect(hasTags).toBe(true);

    const tagCount = await feed.popularTagsList.count();
    expect(tagCount).toBeGreaterThan(1);

    // Each tag should be visible and not empty
    const firstTagText = await feed.popularTagsList.first().textContent();
    expect(firstTagText?.trim()).toBeTruthy();

    await page.screenshot({ path: screenshotPath('TC_TAG_002') });
    await expect(page).toHaveScreenshot('TC_TAG_002.png');
  });

  // ── TC_TAG_003 ──────────────────────────────────────────────────────────────

  test('TC_TAG_003: Tags on article detail page are displayed correctly (display-only, no navigation)', async ({
    page, loginPageObj,
  }) => {
    test.info().annotations.push({
      type: 'known-limitation',
      description:
        'APP-LIMIT-TAG-001: Tags on the article detail page are rendered as ' +
        '<li class="tag-default tag-pill tag-outline"> elements with no click handler. ' +
        'Clicking them does NOT navigate to a tag-filtered feed. ' +
        'Only the Popular Tags sidebar supports tag-based navigation in this implementation.',
    });

    // Open the article we created in beforeAll — it has TEST_TAG
    await page.goto(`/article/${articleSlug}`);
    await page.waitForURL(/\/article\//, { timeout: 10000 });

    // The tag IS rendered — just as a display-only <li> element
    const tagEl = page
      .locator('.tag-list li.tag-default.tag-pill, .tag-list li.tag-pill')
      .filter({ hasText: TEST_TAG })
      .first();

    await expect(tagEl).toBeVisible({ timeout: 10000 });

    // Confirm clicking the tag does NOT navigate away (AUT limitation)
    const urlBefore = page.url();
    await tagEl.click();
    // Give the Angular router a moment to react (it won't)
    await page.waitForTimeout(500);
    expect(page.url()).toBe(urlBefore);

    await page.screenshot({ path: screenshotPath('TC_TAG_003') });
    await expect(page).toHaveScreenshot('TC_TAG_003.png');
  });

  // ── TC_TAG_004 ──────────────────────────────────────────────────────────────

  test('TC_TAG_004: Tag filter is reflected in the active feed tab label', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();

    const hasTags = await feed.hasTags();
    if (!hasTags) {
      test.skip(true, 'No popular tags visible');
    }

    const tagName = await feed.clickFirstPopularTag();

    // Verify the active tab label shows the tag name (with optional # prefix)
    const activeTab = await feed.getActiveTabText();
    expect(activeTab.toLowerCase()).toContain(tagName.toLowerCase().replace(/^#/, '').trim());

    await page.screenshot({ path: screenshotPath('TC_TAG_004') });
    await expect(page).toHaveScreenshot('TC_TAG_004.png');
  });

  // ── TC_TAG_005 ──────────────────────────────────────────────────────────────

  test('TC_TAG_005: Clicking "Global Feed" tab restores unfiltered feed', async ({
    page, loginPageObj,
  }) => {
    const feed = new HomeFeedPage(page);
    await feed.goto();

    const hasTags = await feed.hasTags();
    if (!hasTags) {
      test.skip(true, 'No popular tags visible');
    }

    // Apply a tag filter first
    await feed.clickFirstPopularTag();
    const filteredCount = await feed.getArticlesCount();

    // Switch back to Global Feed
    await switchToGlobalFeedAndWait(page);

    const globalActiveTab = await feed.getActiveTabText();
    expect(globalActiveTab).toMatch(/global feed/i);

    const globalCount = await feed.getArticlesCount();
    // Global feed should have at least as many articles as the tag-filtered view
    expect(globalCount).toBeGreaterThanOrEqual(filteredCount);

    await page.screenshot({ path: screenshotPath('TC_TAG_005') });
    await expect(page).toHaveScreenshot('TC_TAG_005.png');
  });
});
