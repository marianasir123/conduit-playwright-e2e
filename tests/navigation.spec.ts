import { test, expect } from '../fixtures/loginPage.fixture';

// ==================== UNAUTHENTICATED NAVIGATION ====================

test.describe('Navigation - Unauthenticated User', () => {

  test('TC_NAV_001: Navbar should show logo, Home, Sign in, and Sign up for guest users', async ({ page, nav }) => {
    await page.goto('/');
    await expect(nav.logo).toBeVisible();
    await expect(nav.homeLink).toBeVisible();
    await expect(nav.signInLink).toBeVisible();
    await expect(nav.signUpLink).toBeVisible();
  });

  test('TC_NAV_002: Navbar should NOT show New Article, Settings, or Profile links for guest users', async ({ page, nav }) => {
    await page.goto('/');
    await expect(nav.newArticleLink).not.toBeVisible();
    await expect(nav.settingsLink).not.toBeVisible();
    await expect(nav.profileLink).not.toBeVisible();
  });

  test('TC_NAV_003: Clicking logo should navigate to home page from any page', async ({ page, nav }) => {
    await page.goto('/login');
    await nav.clickLogo();
    await expect(page).toHaveURL(/conduit\.bondaracademy\.com\/$/, { timeout: 5000 });
  });

  test('TC_NAV_004: Clicking Home link should navigate to home page', async ({ page, nav }) => {
    await page.goto('/login');
    await nav.clickHome();
    await expect(page).toHaveURL(/conduit\.bondaracademy\.com\/$/, { timeout: 5000 });
  });

  test('TC_NAV_005: Clicking Sign in should navigate to /login', async ({ page, nav }) => {
    await page.goto('/');
    await nav.clickSignIn();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC_NAV_006: Clicking Sign up should navigate to /register', async ({ page, nav }) => {
    await page.goto('/');
    await nav.clickSignUp();
    await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
  });

  test('TC_NAV_007: /login page should render with all required form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('TC_NAV_008: /register page should render with all required form elements', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign up|Register/ })).toBeVisible();
  });

  test('TC_NAV_009: Home page should display banner and Global Feed tab for guest users', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.banner')).toBeVisible();
    // Feed tabs render as nav-links; getByText is more reliable than role matching
    // due to whitespace in the Angular-rendered accessible name
    await expect(page.getByText('Global Feed').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_NAV_010: /login page should have a link back to the register page', async ({ page }) => {
    await page.goto('/login');
    const signUpLink = page.getByRole('link', { name: /Sign up/i });
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
  });

  test('TC_NAV_011: /register page should have a link back to the login page', async ({ page }) => {
    await page.goto('/register');
    const signInLink = page.getByRole('link', { name: /Sign in/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('TC_NAV_012: Accessing /editor without auth should redirect away from editor', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/editor');
  });

  test('TC_NAV_013: Accessing /settings without auth should redirect away from settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/settings');
  });

  test('TC_NAV_014: Accessing /editor/new-slug without auth should redirect away', async ({ page }) => {
    await page.goto('/editor/some-article-slug');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/editor');
  });

});

// ==================== AUTHENTICATED NAVIGATION ====================

test.describe('Navigation - Authenticated User', () => {

  test('TC_NAV_015: Navbar should show Home, New Article, Settings, and username when logged in', async ({ nav, loginPageObj, username }) => {
    await expect(nav.homeLink).toBeVisible();
    await expect(nav.newArticleLink).toBeVisible();
    await expect(nav.settingsLink).toBeVisible();
    await expect(nav.profileLink).toBeVisible();
    await expect(nav.profileLink).toContainText(username);
  });

  test('TC_NAV_016: Navbar should NOT show Sign in or Sign up when logged in', async ({ page, nav, loginPageObj }) => {
    await expect(nav.signInLink).not.toBeVisible();
    await expect(nav.signUpLink).not.toBeVisible();
  });

  test('TC_NAV_017: Clicking logo should navigate to home page (authenticated)', async ({ page, nav, loginPageObj }) => {
    await nav.clickSettings();
    await nav.clickLogo();
    await expect(page).toHaveURL(/conduit\.bondaracademy\.com\/$/, { timeout: 5000 });
  });

  test('TC_NAV_018: Clicking Home link should navigate to home page (authenticated)', async ({ page, nav, loginPageObj }) => {
    await nav.clickSettings();
    await nav.clickHome();
    await expect(page).toHaveURL(/conduit\.bondaracademy\.com\/$/, { timeout: 5000 });
  });

  test('TC_NAV_019: Clicking New Article should navigate to /editor', async ({ page, nav, loginPageObj }) => {
    await nav.clickNewArticle();
    await expect(page).toHaveURL(/\/editor/, { timeout: 5000 });
  });

  test('TC_NAV_020: Clicking Settings should navigate to /settings', async ({ page, nav, loginPageObj }) => {
    await nav.clickSettings();
    await expect(page).toHaveURL(/\/settings/, { timeout: 5000 });
  });

  test('TC_NAV_021: Clicking profile/username link should navigate to /profile/{username}', async ({ page, nav, loginPageObj, username }) => {
    await nav.clickProfile();
    await expect(page).toHaveURL(new RegExp(`/profile/${username}`), { timeout: 5000 });
  });

  test('TC_NAV_022: Navigating to /editor directly should load article editor form (authenticated)', async ({ page, loginPageObj }) => {
    await page.goto('/editor');
    await expect(page).toHaveURL(/\/editor/, { timeout: 5000 });
    await expect(page.getByRole('textbox', { name: 'Article Title' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /What's this article about/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Article' })).toBeVisible();
  });

  test('TC_NAV_023: Navigating to /settings directly should load settings page (authenticated)', async ({ page, loginPageObj }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 5000 });
    await expect(page.getByRole('button', { name: /Update Settings/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /logout|click here to logout/i })).toBeVisible();
  });

  test('TC_NAV_024: Navigating to /profile/{username} directly should load user profile (authenticated)', async ({ page, loginPageObj, username }) => {
    await page.goto(`/profile/${username}`);
    await expect(page).toHaveURL(new RegExp(`/profile/${username}`), { timeout: 5000 });
    await expect(page.getByRole('heading', { level: 4 })).toContainText(username, { timeout: 15000 });
  });

  test('TC_NAV_025: Profile page should show My Posts and Favorited Posts tabs', async ({ page, loginPageObj, username, profilePage }) => {
    await profilePage.gotoProfile();
    await expect(page.getByRole('link', { name: 'My Posts' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'Favorited Posts' })).toBeVisible({ timeout: 15000 });
  });

  test('TC_NAV_026: Switching from My Posts to Favorited Posts tab should update the URL', async ({ page, loginPageObj, profilePage }) => {
    await profilePage.gotoProfile();
    await expect(page.getByRole('link', { name: 'Favorited Posts' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: 'Favorited Posts' }).click();
    await expect(page).toHaveURL(/\/favorites/, { timeout: 5000 });
  });

  test('TC_NAV_027: Switching back from Favorited Posts to My Posts tab should update the URL', async ({ page, loginPageObj, username, profilePage }) => {
    await page.goto(`/profile/${username}/favorites`);
    await expect(page.getByRole('link', { name: 'My Posts' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: 'My Posts' }).click();
    await expect(page).toHaveURL(new RegExp(`/profile/${username}/?$`), { timeout: 5000 });
  });

  test('TC_NAV_028: Home page should show Your Feed and Global Feed tabs when logged in', async ({ page, nav, loginPageObj }) => {
    await nav.clickHome();
    await page.waitForLoadState('networkidle');
    // Feed tabs render as nav-links; getByText is more reliable than role matching
    // due to whitespace in the Angular-rendered accessible name
    await expect(page.getByText('Your Feed').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Global Feed').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC_NAV_029: Settings page should show profile update form fields', async ({ page, loginPageObj }) => {
    await page.goto('/settings');
    await expect(page.getByRole('textbox', { name: /URL of profile picture/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('TC_NAV_030: Editor page should not be reachable via Back button to show protected content after logout', async ({ page, nav, loginPageObj }) => {
    // Navigate to editor while logged in
    await nav.clickNewArticle();
    await expect(page).toHaveURL(/\/editor/, { timeout: 5000 });

    // Logout
    await nav.logout();
    await expect(page).toHaveURL(/conduit\.bondaracademy\.com\/$/, { timeout: 5000 });

    // Verify the user is now in a logged-out state
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);

    // Try to go back to /editor via direct URL
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/editor');
  });

});
