import { Locator, Page } from '@playwright/test';

/**
 * Page Object for the Conduit Settings page (/settings).
 *
 * Field locators use getByRole because the settings form exposes accessible
 * names via placeholder text (e.g. "Username", "Email").
 */
export class SettingsPage {
  readonly page: Page;
  readonly imageInput: Locator;
  readonly usernameInput: Locator;
  readonly bioInput: Locator;
  readonly emailInput: Locator;
  readonly newPasswordInput: Locator;
  readonly updateButton: Locator;
  readonly logoutButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.imageInput = page.getByRole('textbox', { name: 'URL of profile picture' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.bioInput = page.getByRole('textbox', { name: 'Short bio about you' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.newPasswordInput = page.getByRole('textbox', { name: 'New Password' });
    this.updateButton = page.getByRole('button', { name: 'Update Settings' });
    this.logoutButton = page.getByRole('button', { name: /logout|click here to logout/i });
    this.errorMessages = page.locator('ul.error-messages li');
  }

  async goto() {
    await this.page.goto('/settings');
    await this.waitForFormReady();
  }

  /** Waits until the settings form is rendered and profile data has been fetched. */
  async waitForFormReady() {
    await this.updateButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.page
      .waitForResponse(
        resp => resp.url().includes('/api/user') && resp.request().method() === 'GET' && resp.ok(),
        { timeout: 15000 },
      )
      .catch(() => {});
  }

  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getBioValue(): Promise<string> {
    return await this.bioInput.inputValue();
  }

  async getImageValue(): Promise<string> {
    return await this.imageInput.inputValue();
  }

  /**
   * Fills only the fields provided. Clears & refills text fields to
   * avoid Angular reactive-form issues with simple .fill().
   */
  async fillSettings(opts: {
    image?: string;
    username?: string;
    bio?: string;
    email?: string;
    password?: string;
  }) {
    if (opts.image !== undefined) {
      await this.clearAndFill(this.imageInput, opts.image);
    }
    if (opts.username !== undefined) {
      await this.clearAndFill(this.usernameInput, opts.username);
    }
    if (opts.bio !== undefined) {
      await this.clearAndFill(this.bioInput, opts.bio);
    }
    if (opts.email !== undefined) {
      await this.clearAndFill(this.emailInput, opts.email);
    }
    if (opts.password !== undefined) {
      await this.newPasswordInput.fill(opts.password);
    }
  }

  /** Select-all then fill — required for Angular reactive forms. */
  private async clearAndFill(field: Locator, value: string) {
    await field.click();
    await field.press('ControlOrMeta+A');
    await field.fill(value);
  }

  /** Submits the form and waits for the PUT /api/user response. Returns HTTP status. */
  async clickUpdate(): Promise<number> {
    const response = await Promise.all([
      this.page.waitForResponse(
        resp =>
          resp.url().includes('/api/user') &&
          resp.request().method() === 'PUT',
        { timeout: 15000 },
      ),
      this.updateButton.click(),
    ]).then(([resp]) => resp);
    return response.status();
  }

  /** Clicks "Update Settings" without waiting for an API response. */
  async clickUpdateNoWait() {
    await this.updateButton.click();
  }

  async getErrorMessages(): Promise<string[]> {
    const items = await this.errorMessages.all();
    return Promise.all(items.map(e => e.textContent().then(t => t?.trim() ?? '')));
  }

  async hasErrors(): Promise<boolean> {
    return (await this.errorMessages.count()) > 0;
  }
}
