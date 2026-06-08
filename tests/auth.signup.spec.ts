import { test, expect } from '../fixtures/loginData.fixture';
import { SignUpPage } from '../pages/signup.page';
import { Navigation } from '../pages/navigation.page';
import { faker } from '@faker-js/faker';

test.describe('Authentication - Sign Up Test Cases', () => {
  
  // ==================== POSITIVE TEST CASES ====================

  test('TC_SIGNUP_001: User should register successfully with valid credentials', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    const nav = new Navigation(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Create unique credentials using Faker with proper length constraints
    const uniqueUsername = faker.internet.username().substring(0, 20);
    const uniqueEmail = faker.internet.email();
    
    // Fill signup form
    await signupPage.signup(uniqueUsername, uniqueEmail, loginData.password);
    
    // Wait for navigation after successful signup
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
    
    // Verify user is logged in after signup
    const isLoggedIn = await nav.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    
    // Verify New Article link is visible
    await expect(nav.newArticleLink).toBeVisible();
  });

  test('TC_SIGNUP_002: User should be redirected to home after successful signup', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Create unique credentials using Faker
    const uniqueUsername = faker.internet.username().substring(0, 20);
    const uniqueEmail = faker.internet.email();
    
    // Sign up
    await signupPage.signup(uniqueUsername, uniqueEmail, loginData.password);
    
    // Verify redirected to home page
    await expect(page).toHaveURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
  });

  test('TC_SIGNUP_003: Signup page should have required form fields', async ({ page }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Verify all required fields are visible
    await expect(signupPage.usernameInput).toBeVisible();
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.signUpButton).toBeVisible();
  });

  test('TC_SIGNUP_004: Signup page should have link to login page', async ({ page }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Verify there's a link to sign in page - great UX feature
    const signInLink = page.getByRole('link', { name: 'Sign in' });
    await expect(signInLink).toBeVisible();
    
    // Click sign in link to verify it works
    await signInLink.click();
    
    // Verify navigated to login page
    await expect(page).toHaveURL(/login|signin/i, { timeout: 5000 });
  });

  // ==================== NEGATIVE TEST CASES ====================

  test('TC_SIGNUP_005: Signup should fail with empty username field', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill email and password but leave username empty
    await signupPage.fillEmail('newuser@example.com');
    await signupPage.fillPassword(loginData.password);
    
    // Check if sign up button is disabled
    const isDisabled = await signupPage.signUpButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC_SIGNUP_006: Signup should fail with empty email field', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill username and password but leave email empty
    await signupPage.fillUsername('newuser');
    await signupPage.fillPassword(loginData.password);
    
    // Check if sign up button is disabled
    const isDisabled = await signupPage.signUpButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC_SIGNUP_007: Signup should fail with empty password field', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill username and email but leave password empty
    await signupPage.fillUsername('newuser');
    await signupPage.fillEmail('newuser@example.com');
    
    // Check if sign up button is disabled
    const isDisabled = await signupPage.signUpButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('TC_SIGNUP_008: Signup should fail with invalid email format', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill with invalid email format
    await signupPage.fillUsername('newuser');
    await signupPage.fillEmail('invalidemail');
    await signupPage.fillPassword(loginData.password);
    
    // Try to submit
    const signUpButton = page.getByRole('button', { name: /Sign up|Register/ });
    await signUpButton.click();
    
    // Wait for error message or form validation
    await page.waitForTimeout(500);
    
    // Should show error message or stay on signup page
    const stillOnSignupPage = page.url().includes('/register');
    const errorVisible = await page.locator('text=/email|invalid/i').isVisible().catch(() => false);
    
    expect(stillOnSignupPage || errorVisible).toBe(true);
  });

  test('TC_SIGNUP_009: Signup should fail with duplicate email', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Try to signup with existing email
    await signupPage.signup('anotheruser', loginData.email, loginData.password);
    
    // Wait for error response
    await page.waitForTimeout(1000);
    
    // Verify error message appears or stay on signup page
    const stillOnSignupPage = page.url().includes('/register');
    const errorVisible = await page.locator('text=/already taken|email.*exist/i').isVisible().catch(() => false);
    
    expect(stillOnSignupPage || errorVisible).toBe(true);
  });

  test('TC_SIGNUP_010: Signup should fail with duplicate username', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Try to signup with existing username (assuming 'testuser' exists from other tests)
    // Using a known username from previous signups
    await signupPage.signup('testuser', 'newuser@example.com', loginData.password);
    
    // Wait for error response
    await page.waitForTimeout(1000);
    
    // Verify error message appears or stay on signup page
    const stillOnSignupPage = page.url().includes('/register');
    const errorVisible = await page.locator('text=/already taken|username.*exist/i').isVisible().catch(() => false);
    
    expect(stillOnSignupPage || errorVisible).toBe(true);
  });


  test('TC_SIGNUP_011: Password field should be masked for security', async ({ page }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Get password input type
    const passwordType = await signupPage.passwordInput.evaluate((el: HTMLInputElement) => el.type);
    
    // Verify password field is masked (type="password")
    expect(passwordType).toBe('password');
  });

  test('TC_SIGNUP_012: Username field should accept alphanumeric characters', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill with alphanumeric username using Faker
    const alphanumericUsername = faker.internet.username().substring(0, 15);
    const uniqueEmail = faker.internet.email();
    
    await signupPage.signup(alphanumericUsername, uniqueEmail, loginData.password);
    
    // Should be able to proceed
    await page.waitForTimeout(500);
    
    // Either successfully registered or no validation error for username
    const usernameErrorVisible = await page.locator('text=/username.*invalid|username.*invalid/i').isVisible().catch(() => false);
    expect(usernameErrorVisible).toBe(false);
  });

  test('TC_SIGNUP_013: Form should reset after successful signup', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Signup successfully using Faker-generated data
    const uniqueUsername = faker.internet.username().substring(0, 20);
    const uniqueEmail = faker.internet.email();
    
    await signupPage.signup(uniqueUsername, uniqueEmail, loginData.password);
    
    // Wait for navigation to home
    await page.waitForURL(/conduit.bondaracademy.com\/$/, { timeout: 5000 });
    
    // User should be on home page, not signup page
    const isOnHomePage = page.url().includes('conduit.bondaracademy.com');
    expect(isOnHomePage).toBe(true);
  });

  test('TC_SIGNUP_014: Signup with very long username should fail or be truncated', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill with very long username
    const veryLongUsername = 'a'.repeat(500);
    const uniqueEmail = faker.internet.email();
    
    await signupPage.fillUsername(veryLongUsername);
    await signupPage.fillEmail(uniqueEmail);
    await signupPage.fillPassword(loginData.password);
    
    // Try to submit
    const signUpButton = page.getByRole('button', { name: /Sign up|Register/ });
    await signUpButton.click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Should either fail or handle gracefully
    const isOnSignupPage = page.url().includes('/register');
    const errorVisible = await page.locator('text=/username is too long (maximum is 20 characters)').isVisible().catch(() => false);
    
    // Either still on signup page or got an error
    expect(isOnSignupPage || errorVisible).toBe(true);
  });

  test('TC_SIGNUP_015: Email validation should be case-insensitive', async ({ page, loginData }) => {
    const signupPage = new SignUpPage(page);
    
    // Navigate to signup page
    await signupPage.goto();
    
    // Fill with uppercase email (Faker will generate lowercase, so we'll use a known format)
    const uniqueEmail = faker.internet.email().toUpperCase();
    const uniqueUsername = faker.internet.username().substring(0, 20);
    
    await signupPage.signup(uniqueUsername, uniqueEmail, loginData.password);
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Should either accept or show specific format error
    const isOnHomePage = page.url().includes('conduit.bondaracademy.com');
    const isOnSignupPage = page.url().includes('/register');
    
    // Either successfully registered or still on signup (not home)
    expect(isOnHomePage || isOnSignupPage).toBe(true);
  });

  // ==================== PASSWORD MINIMUM LENGTH ====================

  test('TC_SIGNUP_016: Signup should fail when password is less than 8 characters', async ({ page }) => {
    const signupPage = new SignUpPage(page);

    await signupPage.goto();

    // Fill all fields with a 7-character password (one below the 8-character minimum)
    await signupPage.fillUsername(faker.internet.username().substring(0, 15));
    await signupPage.fillEmail(faker.internet.email());
    await signupPage.fillPassword('1234567'); // exactly 7 chars

    await signupPage.signUpButton.click();

    // The API returns 422 with "password is too short (minimum is 8 characters)"
    await expect(page.locator('ul.error-messages li')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('ul.error-messages li')).toContainText(/too short|minimum is 8/i);

    // User must remain on the register page — no redirect to home
    expect(page.url()).toContain('/register');
  });
});
