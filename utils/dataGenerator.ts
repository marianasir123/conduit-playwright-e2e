import { faker } from '@faker-js/faker';

/**
 * Generates a unique article title.
 * @param prefix  - Optional label that identifies which test created this article.
 *                  Defaults to 'Article'. A random suffix is always appended so
 *                  parallel test runs never collide on title uniqueness.
 */
export function generateArticleTitle(prefix = 'Article'): string {
  return `${prefix} ${faker.word.words(3)}`;
}

/**
 * Returns a complete, ready-to-use article payload.
 * One call replaces three separate faker lines in every test.
 */
export function generateArticleData(titlePrefix = 'Article'): {
  title: string;
  description: string;
  body: string;
} {
  return {
    title: generateArticleTitle(titlePrefix),
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(2),
  };
}

/**
 * Generates a random username within the 20-character limit enforced by Conduit.
 */
export function generateUsername(): string {
  return faker.internet.username().substring(0, 20);
}

/**
 * Generates a random email address.
 */
export function generateEmail(): string {
  return faker.internet.email();
}
