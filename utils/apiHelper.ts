import type { APIRequestContext } from '@playwright/test';

export const API_BASE_URL = 'https://conduit-api.bondaracademy.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticlePayload {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface UserUpdates {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
  password?: string;
}

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

/**
 * Creates an article via the Conduit REST API.
 * Returns the new article's slug and title for downstream use.
 */
export async function createArticleViaApi(
  request: APIRequestContext,
  token: string,
  article: ArticlePayload,
): Promise<{ slug: string; title: string }> {
  const response = await request.post(`${API_BASE_URL}/api/articles`, {
    headers: { Authorization: `Token ${token}` },
    data: { article },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create article: ${response.status()} ${await response.text()}`);
  }
  const { article: created } = await response.json();
  return { slug: created.slug as string, title: created.title as string };
}

/**
 * Deletes a single article by slug via the Conduit REST API.
 */
export async function deleteArticleViaApi(
  request: APIRequestContext,
  token: string,
  slug: string,
): Promise<void> {
  await request.delete(`${API_BASE_URL}/api/articles/${slug}`, {
    headers: { Authorization: `Token ${token}` },
  });
}

/**
 * Posts a comment on an article via the Conduit REST API.
 * Returns the new comment's id.
 */
export async function addCommentViaApi(
  request: APIRequestContext,
  token: string,
  slug: string,
  body: string,
): Promise<number> {
  const response = await request.post(`${API_BASE_URL}/api/articles/${slug}/comments`, {
    headers: { Authorization: `Token ${token}` },
    data: { comment: { body } },
  });
  if (!response.ok()) {
    throw new Error(`Failed to add comment: ${response.status()} ${await response.text()}`);
  }
  const { comment } = await response.json();
  return comment.id as number;
}

/** Returns the authenticated user's profile from GET /api/user. */
export async function getUserProfileViaApi(
  request: APIRequestContext,
  token: string,
): Promise<{
  username: string;
  email: string;
  bio: string | null;
  image: string;
}> {
  const response = await request.get(`${API_BASE_URL}/api/user`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok()) {
    throw new Error(`Failed to get user profile: ${response.status()} ${await response.text()}`);
  }
  const { user } = await response.json();
  return {
    username: user.username as string,
    email: user.email as string,
    bio: (user.bio as string | null) ?? null,
    image: user.image as string,
  };
}

/** Registers a disposable user for isolated test scenarios (e.g. posting comments as another user). */
export async function registerUserViaApi(
  request: APIRequestContext,
  username: string,
  email: string,
  password: string,
): Promise<{ token: string; username: string }> {
  const response = await request.post(`${API_BASE_URL}/api/users`, {
    data: { user: { username, email, password } },
  });
  if (!response.ok()) {
    throw new Error(`Failed to register user: ${response.status()} ${await response.text()}`);
  }
  const { user } = await response.json();
  return { token: user.token as string, username: user.username as string };
}

/** Returns all comments on an article via GET /api/articles/{slug}/comments. */
export async function getArticleCommentsViaApi(
  request: APIRequestContext,
  slug: string,
): Promise<{ body: string; authorUsername: string }[]> {
  const response = await request.get(
    `${API_BASE_URL}/api/articles/${encodeURIComponent(slug)}/comments`,
  );
  if (!response.ok()) return [];
  const { comments } = await response.json();
  return (comments ?? []).map((c: { body: string; author: { username: string } }) => ({
    body: c.body,
    authorUsername: c.author.username,
  }));
}

/**
 * Finds the first global-feed article authored by someone other than `excludeUsername`.
 * Returns slug, title, and author username.
 */
export async function findOtherUsersArticleViaApi(
  request: APIRequestContext,
  excludeUsername: string,
  maxScan = 300,
): Promise<{ slug: string; title: string; authorUsername: string } | null> {
  const limit = 20;
  for (let offset = 0; offset < maxScan; offset += limit) {
    const response = await request.get(
      `${API_BASE_URL}/api/articles?limit=${limit}&offset=${offset}`,
    );
    if (!response.ok()) break;
    const { articles = [], articlesCount = 0 } = await response.json();
    const match = articles.find(
      (a: { author: { username: string } }) => a.author.username !== excludeUsername,
    );
    if (match) {
      return {
        slug: match.slug,
        title: match.title,
        authorUsername: match.author.username,
      };
    }
    if (offset + limit >= articlesCount) break;
  }
  return null;
}

/**
 * Updates the currently authenticated user's profile via the Conduit REST API.
 * Only the fields provided in `updates` are changed.
 */
export async function updateUserViaApi(
  request: APIRequestContext,
  token: string,
  updates: UserUpdates,
): Promise<void> {
  const response = await request.put(`${API_BASE_URL}/api/user`, {
    headers: { Authorization: `Token ${token}` },
    data: { user: updates },
  });
  if (!response.ok()) {
    throw new Error(`Failed to update user: ${response.status()} ${await response.text()}`);
  }
}
