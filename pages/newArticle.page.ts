import { Locator, Page, expect } from '@playwright/test';

export class NewArticlePage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly publishButton: Locator;
  readonly errorMessage: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByRole('textbox', { name: 'Article Title' });
    this.descriptionInput = page.getByRole('textbox', { name: /What's this article about/ });
    this.bodyInput = page.getByRole('textbox', { name: /Write your article/ });
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.errorMessage = page.locator('ul.error-messages li');
  }

  async fillArticle(title: string, description: string, body: string) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);
  }

  /**
   * Angular reactive forms ignore locator.clear() — select-all then fill instead.
   */
  async setFieldValue(field: Locator, value: string) {
    await field.click();
    await field.press('ControlOrMeta+A');
    await field.fill(value);
  }

  /** Wait until the edit form is hydrated from the API before changing fields. */
  async waitForEditFormReady() {
    await this.titleInput.waitFor({ state: 'visible' });
    await expect(this.titleInput).not.toHaveValue('', { timeout: 15000 });
  }

  async updateArticle(title: string, description: string, body: string) {
    await this.waitForEditFormReady();
    await this.setFieldValue(this.titleInput, title);
    await this.setFieldValue(this.descriptionInput, description);
    await this.setFieldValue(this.bodyInput, body);
  }

  async getErrorMessage() {
    return this.errorMessage;
  }

  async publish() {
    await this.publishButton.click();
  }

  async publishAndWaitForArticlePage() {
    await Promise.all([
      this.page.waitForURL(/\/article\//, { timeout: 15000 }),
      this.publishButton.click(),
    ]);
  }
}
