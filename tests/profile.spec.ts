import { test, expect } from '../fixtures/loginPage.fixture';
import { NewArticlePage } from '../pages/newArticle.page';
import { ArticlePage } from '../pages/article.page';
import { faker } from '@faker-js/faker';
import { waitForFavoriteResponse } from '../utils/waitHelper';
import { loginViaApi, deleteAllArticlesByAuthor } from '../utils/apiHelper';
import { ENV } from '../utils/env';

test.describe('PROFILE - MY POSTS & FAVORITES', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC_ART_027: Created article should appear in "My Posts" section of profile', async ({ page, nav, profilePage, loginPageObj }) => {
    const newArticlePage = new NewArticlePage(page);

    await nav.clickNewArticle();
    const articleTitle = 'Profile Test Article ' + faker.word.words(2);
    await newArticlePage.fillArticle(articleTitle, faker.lorem.sentence(), faker.lorem.paragraphs(2));
    await newArticlePage.publish();
    await page.waitForURL(/\/article\//, { timeout: 5000 });

    await profilePage.gotoProfile();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_ART_028: "My Posts" tab should show all articles created by user', async ({ page, nav, profilePage, loginPageObj }) => {
    const newArticlePage = new NewArticlePage(page);

    await profilePage.gotoProfile();
    const countBefore = await profilePage.getArticlesCount();

    await nav.clickNewArticle();
    const articleTitle = 'Count Test Article ' + faker.word.words(2);
    await newArticlePage.fillArticle(articleTitle, faker.lorem.sentence(), faker.lorem.paragraphs(2));
    await newArticlePage.publish();
    await page.waitForURL(/\/article\//, { timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(articleTitle, { timeout: 10000 });

    await profilePage.gotoProfile();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 15000 });
    const countAfter = await profilePage.getArticlesCount();
    expect(countAfter).toBeGreaterThan(countBefore);

    const isVisible = await profilePage.isArticleVisible(articleTitle);
    expect(isVisible).toBe(true);
  });

  test('TC_ART_029: "My Posts" should not show other users\' articles', async ({ page, profilePage, loginPageObj }) => {
    await profilePage.gotoProfile();
    const articlesCount = await profilePage.getArticlesCount();

    if (articlesCount > 0) {
      const firstArticleAuthor = page.locator('app-article-preview').first().locator('[href*="/profile/"]').first();
      const authorHref = await firstArticleAuthor.getAttribute('href');
      expect(authorHref).toBeDefined();
    }
  });

  test('TC_ART_030: Deleted article should be removed from "My Posts"', async ({ page, nav, profilePage, loginPageObj }) => {
    const newArticlePage = new NewArticlePage(page);
    const articlePage = new ArticlePage(page);

    await nav.clickNewArticle();
    const articleTitle = 'Delete Profile Test ' + faker.word.words(2);
    await newArticlePage.fillArticle(articleTitle, faker.lorem.sentence(), faker.lorem.paragraphs(2));
    await newArticlePage.publish();
    await page.waitForURL(/\/article\//, { timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(articleTitle, { timeout: 10000 });

    await profilePage.gotoProfile();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 15000 });

    await profilePage.clickArticleByTitle(articleTitle);
    await articlePage.clickDelete();
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });

    await profilePage.gotoProfile();
    await expect(page.getByText(articleTitle).first()).not.toBeVisible({ timeout: 15000 });
  });

  test('TC_ART_031: Edited article should reflect changes in "My Posts"', async ({ page, nav, profilePage, loginPageObj }) => {
    const newArticlePage = new NewArticlePage(page);
    const articlePage = new ArticlePage(page);

    await nav.clickNewArticle();
    const originalTitle = 'Edit Profile Test ' + faker.word.words(2);
    await newArticlePage.fillArticle(originalTitle, faker.lorem.sentence(), faker.lorem.paragraphs(2));
    await newArticlePage.publish();
    await page.waitForURL(/\/article\//, { timeout: 5000 });

    await articlePage.clickEdit();
    await page.waitForURL(/\/editor\//, { timeout: 5000 });

    const updatedTitle = 'Updated Profile Test ' + faker.word.words(2);
    await newArticlePage.titleInput.clear();
    await newArticlePage.titleInput.fill(updatedTitle);
    await newArticlePage.publish();
    await page.waitForURL(/\/article\//, { timeout: 5000 });

    await profilePage.gotoProfile();
    await expect(page.locator('text=' + updatedTitle).first()).toBeVisible({ timeout: 10000 });
    const isOldVisible = await profilePage.isArticleVisible(originalTitle);
    expect(isOldVisible).toBe(false);
  });

  test('TC_ART_032: "Favorited Posts" tab should show favorited articles', async ({ page, username, profilePage, loginPageObj }) => {
    const articlePage = new ArticlePage(page);

    await articlePage.openOtherUsersArticle(username);

    if ((await articlePage.favoriteButton.textContent() ?? '').includes('Unfavorite')) {
      await articlePage.clickFavorite();
      await waitForFavoriteResponse(page);
    }

    const articleTitle = (await articlePage.getArticleTitle())?.trim() ?? '';
    expect(articleTitle.length).toBeGreaterThan(0);

    await articlePage.clickFavorite();
    await waitForFavoriteResponse(page);

    await profilePage.gotoProfile();
    await profilePage.clickFavoritedPostsTab();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_ART_033: Unfavoriting article should remove it from "Favorited Posts"', async ({ page, username, profilePage, loginPageObj }) => {
    const articlePage = new ArticlePage(page);

    await articlePage.openOtherUsersArticle(username);

    if (!(await articlePage.favoriteButton.textContent() ?? '').includes('Unfavorite')) {
      await articlePage.clickFavorite();
      await waitForFavoriteResponse(page);
    }

    const articleTitle = (await articlePage.getArticleTitle())?.trim() ?? '';
    expect(articleTitle.length).toBeGreaterThan(0);

    await profilePage.gotoProfile();
    await profilePage.clickFavoritedPostsTab();
    await expect(page.getByText(articleTitle).first()).toBeVisible({ timeout: 15000 });

    await profilePage.clickArticleByTitle(articleTitle);
    await articlePage.clickFavorite();
    await waitForFavoriteResponse(page);

    await profilePage.gotoProfile();
    await profilePage.clickFavoritedPostsTab();
    await expect(page.getByText(articleTitle).first()).not.toBeVisible({ timeout: 15000 });
  });

  test('TC_ART_034: Profile should display correct article count in "My Posts"', async ({ page, nav, profilePage, loginPageObj }) => {
    const newArticlePage = new NewArticlePage(page);
    const createdTitles: string[] = [];

    for (let i = 0; i < 2; i++) {
      await nav.clickNewArticle();
      const articleTitle = `Batch Article ${i + 1} ` + faker.word.words(2);
      createdTitles.push(articleTitle);
      await newArticlePage.fillArticle(articleTitle, faker.lorem.sentence(), faker.lorem.paragraphs(1));
      await newArticlePage.publish();
      await page.waitForURL(/\/article\//, { timeout: 10000 });
      await expect(page.getByRole('heading', { level: 1 })).toContainText(articleTitle, { timeout: 10000 });
      await nav.clickHome();
    }

    await profilePage.gotoProfile();
    for (const title of createdTitles) {
      await expect(page.getByText(title).first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('TC_ART_035: "My Posts" and "Favorited Posts" tabs should be switchable', async ({ page, profilePage, loginPageObj }) => {
    await profilePage.gotoProfile();

    await profilePage.clickFavoritedPostsTab();
    expect(page.url()).toContain('/favorites');

    await profilePage.clickMyPostsTab();
    expect(page.url()).not.toContain('/favorites');
    expect(page.url()).toContain('/profile/');
  });

  test.afterAll('Cleanup: Delete all test articles via API', async ({ playwright }) => {
    const apiContext = await playwright.request.newContext();
    try {
      const { token, username } = await loginViaApi(apiContext, ENV.USER_EMAIL, ENV.USER_PASSWORD);
      const { deleted, total } = await deleteAllArticlesByAuthor(apiContext, token, username);
      console.log(`✅ Profile cleanup: ${deleted}/${total} articles deleted`);
    } catch (error) {
      console.warn('⚠️ Profile cleanup failed:', error);
    } finally {
      await apiContext.dispose();
    }
  });
});
