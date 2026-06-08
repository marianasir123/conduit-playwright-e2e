import type { APIRequestContext } from '@playwright/test';

export const API_BASE_URL = 'https://conduit-api.bondaracademy.com';

/**
 * Authenticates via the Conduit REST API.
 * Returns both the JWT token and the username so callers can use either.
 * Used in afterAll hooks that run outside the fixture context.
 */
export async function loginViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; username: string }> {
  const response = await request.post(`${API_BASE_URL}/api/users/login`, {
    data: { user: { email, password } },
  });
  if (!response.ok()) {
    throw new Error(`API login failed: ${response.status()} ${await response.text()}`);
  }
  const { user } = await response.json();
  return { token: user.token as string, username: user.username as string };
}

/**
 * Deletes every article authored by `username` using the Conduit REST API.
 * Returns counts so callers can log the result.
 */
export async function deleteAllArticlesByAuthor(
  request: APIRequestContext,
  token: string,
  username: string,
): Promise<{ deleted: number; total: number }> {
  const listResp = await request.get(
    `${API_BASE_URL}/api/articles?author=${encodeURIComponent(username)}&limit=100`,
    { headers: { Authorization: `Token ${token}` } },
  );
  if (!listResp.ok()) return { deleted: 0, total: 0 };

  const { articles } = (await listResp.json()) as { articles: { slug: string }[] };
  let deleted = 0;

  for (const article of articles) {
    const del = await request.delete(`${API_BASE_URL}/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (del.ok()) deleted++;
  }

  return { deleted, total: articles.length };
}
