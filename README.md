# conduit-playwright-e2e

End-to-end test suite for the [Conduit](https://conduit.bondaracademy.com) (RealWorld) demo application, built with **Playwright** and **TypeScript**.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation & test runner |
| [TypeScript](https://www.typescriptlang.org) | Type-safe test authoring |
| [@faker-js/faker](https://fakerjs.dev) | Unique test data generation |
| [GitHub Actions](https://docs.github.com/en/actions) | CI/CD pipeline |

---

## Folder Structure

```
conduit-playwright-e2e/
├── tests/                   # Test specifications
│   ├── article.spec.ts      # Create / edit / delete / favorite articles
│   ├── profile.spec.ts      # My Posts & Favourited Posts tabs
│   ├── navigation.spec.ts   # Nav links, routes, auth-state visibility
│   ├── auth.login.spec.ts   # Login happy path + negative cases
│   ├── auth.logout.spec.ts  # Logout flows
│   └── auth.signup.spec.ts  # Registration flows
│
├── pages/                   # Page Object Model classes
│   ├── article.page.ts
│   ├── newArticle.page.ts
│   ├── login.page.ts
│   ├── signup.page.ts
│   ├── profile.page.ts
│   └── navigation.page.ts
│
├── fixtures/                # Playwright fixture extensions
│   ├── loginData.fixture.ts     # Provides { email, password } from env
│   ├── loginPage.fixture.ts     # Auto-logs in before each test
│   └── cleanupData.fixture.ts   # Provides username / cleanup context
│
├── utils/                   # Reusable helpers
│   ├── dataGenerator.ts     # Centralised faker wrappers
│   ├── waitHelper.ts        # Stable async-wait patterns
│   └── apiHelper.ts         # REST API login & bulk article deletion
│
├── .env.example             # Environment variable template
├── .gitignore
├── playwright.config.ts     # Playwright configuration
├── package.json
└── .github/
    └── workflows/
        └── playwright.yml   # GitHub Actions CI pipeline
```

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/conduit-playwright-e2e.git
cd conduit-playwright-e2e

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps chromium
```

---

## Configuration

Copy `.env.example` to `.env` and fill in your test credentials:

```bash
cp .env.example .env
```

```env
BASE_URL=https://conduit.bondaracademy.com
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-secure-password
```

> **Important:** Use a dedicated test account. Never commit real or production credentials.

---

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests (all configured browsers) |
| `npm run test:chromium` | Run on Chromium only (fastest) |
| `npm run test:headed` | Run with a visible browser window |
| `npm run test:ui` | Open Playwright's interactive UI mode |
| `npm run test:debug` | Run in debug / step-through mode |
| `npm run report` | Open the last HTML report |

### Run a single file

```bash
npx playwright test tests/auth.login.spec.ts --project=chromium
```

### Run a single test by name

```bash
npx playwright test --grep "TC_AUTH_016" --project=chromium
```

---

## CI / CD

Tests run automatically on every push and pull request to `main` via GitHub Actions (`.github/workflows/playwright.yml`).

**Required GitHub secrets / variables:**

| Name | Where | Description |
|---|---|---|
| `TEST_EMAIL` | Secret | Test account email |
| `TEST_PASSWORD` | Secret | Test account password |
| `BASE_URL` | Variable (optional) | Defaults to the hosted demo site |

Artefacts uploaded on every run:
- **HTML Report** — retained for 14 days
- **Traces / Screenshots / Videos** — retained for 7 days (failures only)

---

## Test Coverage

| Suite | Tests | Focus |
|---|---|---|
| `article.spec.ts` | 26 | CRUD operations, favorites, slug validation |
| `profile.spec.ts` | 9 | My Posts, Favorited Posts, article counts |
| `navigation.spec.ts` | 30 | All nav links, auth state, route validation |
| `auth.login.spec.ts` | 17 | Login UI, valid & invalid credential flows |
| `auth.logout.spec.ts` | 10 | Logout flows, session termination |
| `auth.signup.spec.ts` | 15 | Registration, validation, edge cases |

---

## Architecture Decisions

- **Page Object Model** — all selectors and page actions live in `pages/`. Tests never contain raw selectors.
- **Fixture chain** — `loginData` → `loginPage` → `cleanupData` fixtures compose cleanly to avoid test boilerplate.
- **No hard waits** — every `waitForTimeout` has been replaced with `waitForResponse`, `waitForURL`, or `expect(...).toBeVisible()`.
- **API-based cleanup** — `afterAll` hooks delete test data through the REST API rather than the UI, making cleanup fast and reliable.
- **Environment variables** — credentials and base URL are injected at runtime; the codebase contains no secrets.
- **Serial mode for stateful suites** — the article suite uses `test.describe.configure({ mode: 'serial' })` to prevent cleanup from racing with running tests.

---

## Known Limitations

- Tests share a single test account. Running on multiple browsers simultaneously in CI is disabled (`workers: 1`) to avoid race conditions.
- `TC_ART_012` intentionally fails — it documents a known application bug where submitting an empty title saves the article instead of showing a validation error.
