import { Locator, Page } from '@playwright/test';

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
  async getErrorMessage() {
    return this.errorMessage;
  }

  async publish() {
    await this.publishButton.click();
  }
}
