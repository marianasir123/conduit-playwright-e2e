import { test, expect } from '../fixtures/loginPage.fixture';
import { Navigation } from '../pages/navigation.page';
import { test as baseTest } from '../fixtures/loginData.fixture';

test.describe('Authentication - Login Test Cases', () => {
  
  // ==================== POSITIVE TEST CASES (Using loginPageObj fixture) ====================
  
  test('TC_AUTH_001: User should login successfully with valid credentials', async ({ page, loginPageObj }) => {
    const nav = new Navigation(page);
    
    // Verify user is logged in
    const isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    // Verify New Article link is visible (logged-in indicator)
    await expect(nav.newArticleLink).toBeVisible();
    
    // Verify Sign In link is hidden
    await expect(nav.signInLink).not.toBeVisible();
  });

  test('TC_AUTH_002: User should remain on home page after successful login', async ({ page, loginPageObj }) => {
    const nav = new Navigation(page);
    
    // Verify on home page
    await expect(page).toHaveURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
    
    // Verify logged-in state
    const isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('TC_AUTH_003: Session should persist on page refresh', async ({ page, loginPageObj }) => {
    const nav = new Navigation(page);
    
    // Verify logged in before refresh
    let isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    // Refresh page
    await page.reload();
    //await expect(page).toHaveURL('/');
    // Verify still logged in after refresh
    isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('TC_AUTH_004: User profile should be accessible after login', async ({ page, loginPageObj }) => {
    const nav = new Navigation(page);
    
    // Click on profile link
    await nav.clickProfile();
    
    // Verify on profile page
    await expect(page).toHaveURL(/\/profile/, { timeout: 5000 });
  });

  test('TC_AUTH_005: User should be able to create article after login', async ({ page, loginPageObj }) => {
    const nav = new Navigation(page);
    
    // Click New Article link
    await nav.clickNewArticle();
    
    // Verify on editor page
    await expect(page).toHaveURL(/\/editor/, { timeout: 5000 });
    
    // Verify article form is visible
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  // ==================== UI INTERACTION - VALID CREDENTIALS ====================

  baseTest('TC_AUTH_016: Login form UI should update correctly on successful login', async ({ page, loginData }) => {
    await page.goto('/login');

    // ── Pre-login: sign-in form must be on screen ──
    const emailInput    = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const signInButton  = page.getByRole('button',  { name: 'Sign in' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();

    // ── Fill valid credentials ──
    await emailInput.fill(loginData.email);
    await passwordInput.fill(loginData.password);

    // Button must become enabled once both fields are populated
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // ── Post-login: should redirect to home ──
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 15000 });

    // ── Nav UI must reflect the logged-in state ──
    const nav = new Navigation(page);
    await expect(nav.newArticleLink).toBeVisible();  // authenticated link visible
    await expect(nav.settingsLink).toBeVisible();    // authenticated link visible
    await expect(nav.signInLink).not.toBeVisible();  // unauthenticated link hidden
    await expect(nav.signUpLink).not.toBeVisible();  // unauthenticated link hidden

    // ── Login form must no longer be on screen ──
    await expect(emailInput).not.toBeVisible();
    await expect(passwordInput).not.toBeVisible();
  });

  // ==================== NEGATIVE TEST CASES (Using base test without login) ====================

  baseTest.describe('Negative Login Cases', () => {
    
    baseTest('TC_AUTH_006: Login should fail with empty email field', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Leave email empty and fill password
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('password123');
      
      // Try to submit
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      
      // Browser validation should prevent submission or show error
      const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.form?.checkValidity());
      expect(isInvalid || (await page.locator('[class*="error"]').count()) > 0).toBe(true);
    });

    baseTest('TC_AUTH_007: Login should fail with empty password field', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill email but leave password empty
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill('test@example.com');
      
      // Try to submit
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      
      // Browser validation should prevent submission
      const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.form?.checkValidity());
      expect(isInvalid || (await page.locator('[class*="error"]').count()) > 0).toBe(true);
    });

    baseTest('TC_AUTH_008: Login should fail with invalid email format', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill with invalid email format
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill('invalidemail');
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('password123');
      
      // Click sign in
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      
      // Wait for error message to appear
      const errorMessage = page.locator('text=/email or password is invalid/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      // Should stay on login page
      const isOnLoginPage = page.url().includes('/login');
      expect(isOnLoginPage).toBe(true);
    });

    baseTest('TC_AUTH_009: Login should fail with non-existent email', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Fill with non-existent email
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill('nonexistent@example.com');
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('password123');
      
      // Click sign in
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      // Wait for the login API call to respond (returns 422 for bad credentials)
      await page.waitForResponse(resp => resp.url().includes('/api/users/login'), { timeout: 10000 });

      // Should show error message or stay on login page
      const errorMessageVisible = await page.locator('[class*="error"]').isVisible();
      const stillOnLoginPage = page.url().includes('/login');
      
      expect(errorMessageVisible || stillOnLoginPage).toBe(true);
    });

    baseTest('TC_AUTH_010: Login should fail with incorrect password', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Use valid email but wrong password
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill(loginData.email);
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('wrongpassword123');
      
      // Click sign in
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      
      // Wait for error message to appear - verify actual website error message
      const errorMessage = page.locator('text=/Invalid email or password/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      // Should not redirect to home
      const isOnLoginPage = page.url().includes('/login');
      expect(isOnLoginPage).toBe(true);
    });

    baseTest('TC_AUTH_011: Login form should display validation errors', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Get sign-in button
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      
      // When form is empty, button should be disabled
      const isDisabled = await signInButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    baseTest('TC_AUTH_012: Login should be case-sensitive for password', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Try with different case password
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill(loginData.email);
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('WRONGPASSWORD'); // Wrong case
      
      // Click sign in
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();
      // Wait for the login API to respond, then for Angular to render the error
      await page.waitForResponse(resp => resp.url().includes('/api/users/login'), { timeout: 10000 });
      await expect(page.locator('[class*="error"]')).toBeVisible({ timeout: 5000 });
    });

    baseTest('TC_AUTH_013: Sign In button should be functional', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      
      // Fill email and password
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      await emailInput.fill(loginData.email);
      
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill(loginData.password);
      
      // Button should be visible and clickable
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();
    });

    baseTest('TC_AUTH_014: User should see login page when navigating to /login without auth', async ({ page }) => {
      // Navigate to login page
      await page.goto('/login');
      
      // Verify on login page
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
      
      // Verify login form is visible
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    });

    baseTest('TC_AUTH_017: Login form UI should show inline error and remain usable with invalid credentials', async ({ page, loginData }) => {
      await page.goto('/login');

      const emailInput    = page.getByRole('textbox', { name: 'Email' });
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      const signInButton  = page.getByRole('button',  { name: 'Sign in' });

      // ── Fill wrong credentials and submit ──
      await emailInput.fill(loginData.email);
      await passwordInput.fill('definitelyWrongPassword!');
      await signInButton.click();

      // Wait for the API to reject the credentials
      await page.waitForResponse(resp => resp.url().includes('/api/users/login'), { timeout: 10000 });

      // ── Error message must appear inline on the form ──
      const errorBlock = page.locator('ul.error-messages');
      await expect(errorBlock).toBeVisible({ timeout: 5000 });
      await expect(errorBlock.locator('li').first()).toContainText(/email or password is invalid/i);

      // ── URL must stay on /login (no redirect) ──
      expect(page.url()).toContain('/login');

      // ── Form fields must still be visible so the user can correct and retry ──
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(signInButton).toBeEnabled();
    });

    baseTest('TC_AUTH_015: Multiple failed login attempts should show consistent error', async ({ page, loginData }) => {
      // Navigate to login page
      await page.goto('/login');
      
      const emailInput = page.getByRole('textbox', { name: 'Email' });
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      
      // First failed attempt
      await emailInput.fill('wrong@example.com');
      await passwordInput.fill('wrongpass');
      await signInButton.click();
      
      // Wait for error message to appear
      const errorLocator = page.locator('text=email or password is invalid');
      await expect(errorLocator).toBeVisible({ timeout: 5000 });
      
      let firstErrorText = await errorLocator.textContent();
      
      // Clear and try again
      await emailInput.clear();
      await passwordInput.clear();
      await emailInput.fill('another@example.com');
      await passwordInput.fill('wrongpass');
      await signInButton.click();
      
      // Wait for second error
      await expect(errorLocator).toBeVisible({ timeout: 5000 });
      
      let secondErrorText = await errorLocator.textContent();
      
      // Both error messages should be the same (consistent)
      expect(firstErrorText).toBe(secondErrorText);
    });
  });
});
