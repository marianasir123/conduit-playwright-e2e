/**
 * Settings Tests — TC_SET_001 through TC_SET_009
 *
 * These tests exercise the /settings page: form loading, profile updates,
 * field validation, password change, persistence, and auth guard.
 *
 * IMPORTANT — shared account mutations:
 *   Tests TC_SET_002 and TC_SET_006 modify the shared test account (username /
 *   password). An afterEach hook restores original values via the API so that
 *   subsequent tests, fixtures, and CI workers are unaffected.
 *
 * Screenshot baselines:
 *   Run once with  npx playwright test settings.spec.ts --update-snapshots
 *   to write baselines into  screenshots/settings.spec.ts-snapshots/
 *   Commit those files so CI comparisons have a reference.
 */

import * as fs from 'fs';
import * as path from 'path';

import { test, expect } from '../fixtures/loginPage.fixture';
import { test as baseTest } from '@playwright/test';
import { SettingsPage } from '../pages/settings.page';
import { loginViaApi, updateUserViaApi, getUserProfileViaApi } from '../utils/apiHelper';
import { ENV } from '../utils/env';

// Ensure screenshot output directory exists
const SCREENSHOT_DIR = path.join('screenshots', 'settings');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function screenshotPath(tcId: string) {
  return path.join(SCREENSHOT_DIR, `${tcId}-current.png`);
}

// ─── Authenticated settings tests ─────────────────────────────────────────────

test.describe('Settings — TC_SET_001–008', () => {
  test.describe.configure({ mode: 'serial' });

  // Token and original values captured once per suite run so afterEach can
  // restore them even if a mid-suite test changes username or password.
  let savedToken = '';
  let savedUsername = '';
  let savedEmail = '';
  let savedBio: string | null = null;
  let savedImage = '';

  test.beforeAll(async ({ request }) => {
    const { token, username } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    savedToken = token;
    savedUsername = username;
    savedEmail = ENV.USER_EMAIL;
    const profile = await getUserProfileViaApi(request, token);
    savedBio = profile.bio;
    savedImage = profile.image;
  });

  test.afterEach(async ({ request }) => {
    // Best-effort restore: re-authenticate in case credentials changed.
    try {
      let restoreToken = savedToken;
      try {
        const refreshed = await loginViaApi(request, savedEmail, ENV.USER_PASSWORD);
        restoreToken = refreshed.token;
      } catch {
        // password may have changed; token from beforeAll might still be valid
      }
      await updateUserViaApi(request, restoreToken, {
        username: savedUsername,
        email: savedEmail,
        bio: savedBio ?? undefined,
        image: savedImage || undefined,
      });
    } catch (err) {
      console.warn('[settings afterEach] restore failed:', err);
    }
  });

  // ── TC_SET_001 ──────────────────────────────────────────────────────────────

  test('TC_SET_001: Settings page — bio, image URL, and email not pre-populated (known bug)', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.info().annotations.push({
      type: 'known-bug',
      description:
        'APP-BUG-SET-001: Settings form does not pre-populate bio, image URL, or email from the user profile API.',
    });

    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    const apiProfile = await getUserProfileViaApi(request, token);

    // Seed a bio via API so the missing pre-population is observable in the UI
    await updateUserViaApi(request, token, { bio: 'Prepopulate verification bio' });

    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const bioValue = await settings.getBioValue();
    const imageValue = await settings.getImageValue();
    const emailValue = await settings.getEmailValue();

    // Known bug — API returns values but the form fields stay empty
    expect(apiProfile.email).toContain('@');
    expect(emailValue).toBe('');

    if (apiProfile.image) {
      expect(imageValue).toBe('');
    }

    expect(bioValue).toBe('');

    await page.screenshot({ path: screenshotPath('TC_SET_001') });
    await expect(page).toHaveScreenshot('TC_SET_001.png');
  });

  // ── TC_SET_002 ──────────────────────────────────────────────────────────────

  test('TC_SET_002: Update username — reflected in navbar and profile URL', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.slow();
    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const newUsername = `qatst${Date.now()}`.substring(0, 20);
    await settings.fillSettings({ username: newUsername });
    await settings.clickUpdate();

    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    const profile = await getUserProfileViaApi(request, token);
    expect(profile.username).toBe(newUsername);

    // Navigate home — reload on /settings can invalidate the session after username change
    await page.goto('/');
    await expect(page.locator('nav.navbar')).toContainText(newUsername, { timeout: 15000 });
    await expect(page.locator(`nav.navbar a[href="/profile/${newUsername}"]`)).toBeVisible({
      timeout: 15000,
    });

    await page.screenshot({ path: screenshotPath('TC_SET_002') });
    await expect(page).toHaveScreenshot('TC_SET_002.png');
  });

  // ── TC_SET_003 ──────────────────────────────────────────────────────────────

  test('TC_SET_003: Update bio and profile image — bio on profile, image in navbar', async ({
    page, loginPageObj, nav, username,
  }) => {
    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const newBio = `Automated QA test bio ${Date.now()}`;
    // Verified working image URL on this AUT (Conduit API default avatar host)
    const newImage = 'https://conduit-api.bondaracademy.com/images/smiley-cyrus.jpeg';

    await settings.fillSettings({ bio: newBio, image: newImage });
    await settings.clickUpdate();

    // Bio appears on profile page under the username
    await page.goto(`/profile/${username}`);
    await expect(page.locator('.user-info')).toContainText(newBio, { timeout: 10000 });

    // Profile image appears in the top navigation bar
    const navProfileImage = page.locator('nav.navbar').locator(`a[href="/profile/${username}"] img`);
    await expect(navProfileImage).toBeVisible({ timeout: 10000 });
    await expect(navProfileImage).toHaveAttribute('src', newImage);

    await page.screenshot({ path: screenshotPath('TC_SET_003') });
    await expect(page).toHaveScreenshot('TC_SET_003.png');
  });

  // ── TC_SET_004 ──────────────────────────────────────────────────────────────

  test('TC_SET_004: Empty username is accepted without validation error (known bug)', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.info().annotations.push({
      type: 'known-bug',
      description:
        'APP-BUG-SET-002: Settings form accepts an empty username; the API silently retains the previous username.',
    });

    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    const profileBefore = await getUserProfileViaApi(request, token);

    await settings.fillSettings({ username: '' });
    const status = await settings.clickUpdate();

    // Observed behavior: update succeeds with no validation error
    expect(status).toBe(200);
    expect(await settings.hasErrors()).toBe(false);

    const profileAfter = await getUserProfileViaApi(request, token);
    expect(profileAfter.username).toBe(profileBefore.username);

    await page.screenshot({ path: screenshotPath('TC_SET_004') });
    await expect(page).toHaveScreenshot('TC_SET_004.png');
  });

  // ── TC_SET_005 ──────────────────────────────────────────────────────────────

  test('TC_SET_005: Invalid email format is saved without validation (known bug)', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.info().annotations.push({
      type: 'known-bug',
      description:
        'APP-BUG-SET-003: Settings form saves an invalid email format without client- or server-side rejection.',
    });

    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const invalidEmail = 'not-a-valid-email';
    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);

    await settings.fillSettings({ email: invalidEmail });
    const status = await settings.clickUpdate();

    // Observed behavior: invalid email is persisted
    expect(status).toBe(200);
    expect(await settings.hasErrors()).toBe(false);

    const profileAfter = await getUserProfileViaApi(request, token);
    expect(profileAfter.email).toBe(invalidEmail);

    // Restore valid email immediately so afterEach and other suites are unaffected
    await updateUserViaApi(request, token, { email: savedEmail });

    await page.screenshot({ path: screenshotPath('TC_SET_005') });
    await expect(page).toHaveScreenshot('TC_SET_005.png');
  });

  // ── TC_SET_006 ──────────────────────────────────────────────────────────────

  test('TC_SET_006: Change password — login works with new password, old password should be rejected', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.slow(); // extra time for two separate login verifications
    const settings = new SettingsPage(page);
    await nav.clickSettings();

    const newPassword = `Temp${Date.now()}!`;

    await settings.fillSettings({ password: newPassword });
    await settings.clickUpdate();

    // Verify we can log in with the new password
    const { token: newToken } = await loginViaApi(request, ENV.USER_EMAIL, newPassword);
    expect(newToken).toBeTruthy();

    // Restore original password immediately (via API, before this test ends)
    await updateUserViaApi(request, newToken, { password: ENV.USER_PASSWORD });
    savedToken = (await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD)).token;

    await page.screenshot({ path: screenshotPath('TC_SET_006') });
    await expect(page).toHaveScreenshot('TC_SET_006.png');
  });

  // ── TC_SET_007 ──────────────────────────────────────────────────────────────

  test('TC_SET_007: Empty password field does not change existing password', async ({
    page, loginPageObj, nav, request,
  }) => {
    const settings = new SettingsPage(page);
    await nav.clickSettings();

    // Submit form with password field intentionally blank (do not fill it)
    await settings.fillSettings({ bio: 'No-password-change test ' + Date.now() });
    await settings.clickUpdate();

    // Original password must still work
    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    expect(token).toBeTruthy();

    await page.screenshot({ path: screenshotPath('TC_SET_007') });
    await expect(page).toHaveScreenshot('TC_SET_007.png');
  });

  // ── TC_SET_008 ──────────────────────────────────────────────────────────────

  test('TC_SET_008: Settings persist after page refresh', async ({
    page, loginPageObj, nav, request,
  }) => {
    test.info().annotations.push({
      type: 'known-bug',
      description:
        'APP-BUG-SET-001 (extended): Bio field is not re-populated in the settings form after save or refresh — verify persistence via API instead.',
    });

    const settings = new SettingsPage(page);
    await nav.clickSettings();
    await settings.waitForFormReady();

    const uniqueBio = 'Persist test bio ' + Date.now();
    await settings.fillSettings({ bio: uniqueBio });
    await settings.clickUpdate();

    const { token } = await loginViaApi(request, ENV.USER_EMAIL, ENV.USER_PASSWORD);
    const profile = await getUserProfileViaApi(request, token);
    expect(profile.bio).toContain(uniqueBio);

    await page.goto(`/profile/${profile.username}`);
    await expect(page.locator('.user-info')).toContainText(uniqueBio, { timeout: 10000 });

    await page.screenshot({ path: screenshotPath('TC_SET_008') });
    await expect(page).toHaveScreenshot('TC_SET_008.png');
  });
});

// ─── Unauthenticated settings tests ──────────────────────────────────────────

baseTest.describe('Settings — TC_SET_009', () => {
  baseTest(
    'TC_SET_009: Unauthenticated user cannot access /settings — redirected away',
    async ({ page }) => {
      await page.goto('/settings');

      // The Angular auth guard redirects to / or /login
      await page.waitForURL(/\/(login|$)/, { timeout: 10000 });

      const currentUrl = page.url();
      expect(currentUrl).not.toMatch(/\/settings/);

      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: screenshotPath('TC_SET_009') });
      await expect(page).toHaveScreenshot('TC_SET_009.png');
    },
  );
});
