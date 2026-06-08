import { test, expect } from '../fixtures/loginPage.fixture';
import { test as baseTest } from '../fixtures/loginData.fixture';
import { Navigation } from '../pages/navigation.page';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication - Logout Test Cases', () => {
  
  // ==================== LOGOUT TESTS (Using loginPageObj fixture) ====================

  test('TC_LOGOUT_001: User should logout successfully', async ({ page, loginPageObj, nav }) => {
    // Verify user is logged in
    const isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    // Logout
    await nav.logout();
    
    // Verify user is logged out
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
    
    // Verify Sign In link is visible
    await expect(nav.signInLink).toBeVisible();
    
    // Verify New Article link is hidden
    await expect(nav.newArticleLink).not.toBeVisible();
  });

  test('TC_LOGOUT_002: User should be redirected to home after logout', async ({ page, loginPageObj, nav }) => {
    // Logout
    await nav.logout();
    
    // Verify on home page
    await expect(page).toHaveURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
  });

  test('TC_LOGOUT_003: Session should be cleared after logout', async ({ page, loginPageObj, nav }) => {
    // Verify logged in
    let isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    // Logout
    await nav.logout();
    
    // Refresh page
    await page.reload();
    
    // Verify still logged out after refresh
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
  });

  test('TC_LOGOUT_004: After logout, user should be able to navigate to settings from home', async ({ page, loginPageObj, nav }) => {
    // Logout
    await nav.logout();
    
    // Verify logged out and on home page
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
    
    // Try to access settings page (should redirect to home/login)
    await page.goto('/settings');
    // Wait for the app to redirect unauthenticated users away from /settings
    await page.waitForLoadState('networkidle');
    const isNotOnSettings = !page.url().includes('/settings');
    expect(isNotOnSettings).toBe(true);
  });

  test('TC_LOGOUT_005: Logout button should be accessible from settings page', async ({ page, loginPageObj, nav }) => {
    // Navigate to settings
    await nav.clickSettings();
    
    // Verify logout button is visible on settings page
    const logoutBtn = page.getByRole('button', { name: /logout|click here to logout/i });
    await expect(logoutBtn).toBeVisible();
    
    // Click logout
    await logoutBtn.click();
    
    // Verify logged out
    await page.waitForURL(/\/$/, { timeout: 5000 });
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
  });

  test('TC_LOGOUT_006: User should be able to login again after logout', async ({ page, loginPageObj, nav, loginData }) => {
    // Logout
    await nav.logout();
    
    // Verify logged out
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
    
    // Navigate to login
    const loginPage = new LoginPage(page);
    await nav.clickSignIn();
    
    // Login again
    await loginPage.login(loginData.email, loginData.password);
    
    // Wait for successful login
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
    
    // Verify logged in again
    const isLoggedInAgain = await nav.isLoggedIn();
    expect(isLoggedInAgain).toBe(true);
  });

  test('TC_LOGOUT_007: Profile should not be accessible after logout', async ({ page, loginPageObj, nav }) => {
    // Get profile link if available (depends on username link)
    const profileLink = page.getByRole('link', { name: /profile|settings/i });
    const profileLinkVisible = await profileLink.isVisible().catch(() => false);
    
    if (profileLinkVisible) {
      // Logout
      await nav.logout();
      
      // Profile link should not be visible
      const profileLinkAfterLogout = await profileLink.isVisible().catch(() => false);
      expect(profileLinkAfterLogout).toBe(false);
    }
  });

  test('TC_LOGOUT_008: New Article link should not be accessible after logout', async ({ page, loginPageObj, nav }) => {
    // Verify New Article link is visible when logged in
    await expect(nav.newArticleLink).toBeVisible();
    
    // Logout
    await nav.logout();
    
    // New Article link should not be visible
    await expect(nav.newArticleLink).not.toBeVisible();
  });

  test('TC_LOGOUT_009: Logout from settings page should work correctly', async ({ page, loginPageObj, nav }) => {
    // Navigate to settings
    await nav.clickSettings();
    
    // Verify on settings page
    await expect(page).toHaveURL(/\/settings/, { timeout: 5000 });
    
    // Click logout button on settings page
    const logoutBtn = page.getByRole('button', { name: /logout|click here to logout/i });
    await logoutBtn.click();
    
    // Verify redirected to home and logged out
    await page.waitForURL(/\/$/, { timeout: 5000 });
    const isLoggedOut = await nav.isLoggedOut();
    expect(isLoggedOut).toBe(true);
  });

  test('TC_LOGOUT_010: Logout action should not leave any session tokens', async ({ page, loginPageObj, nav }) => {
    // Logout
    await nav.logout();
    
    // Check local storage for auth tokens (if applicable)
    const localStorageData = await page.evaluate(() => localStorage.getItem('jwtToken') || localStorage.getItem('auth'));
    
    // Token should be removed or null
    expect(localStorageData).toBeNull();
  });
});
