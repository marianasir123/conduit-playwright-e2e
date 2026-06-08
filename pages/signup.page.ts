import { Locator, Page } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signUpButton = page.getByRole('button', { name: /Sign up|Register/ });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async clickSignUpLink() {
    await this.signUpLink.click();
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async signup(username: string, email: string, password: string) {
    await this.fillUsername(username);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.signUpButton.click();
  }
}
