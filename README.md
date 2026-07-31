# conduit-playwright-e2e

[![Playwright E2E Tests](https://github.com/marianasir123/conduit-playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/marianasir123/conduit-playwright-e2e/actions/workflows/playwright.yml)

End-to-end test suite for the [Conduit](https://conduit.bondaracademy.com) (RealWorld) demo application, built with **Playwright** and **TypeScript**.

**Live Allure report (main branch):** [GitHub Pages](https://marianasir123.github.io/conduit-playwright-e2e/)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation & test runner |
| [TypeScript](https://www.typescriptlang.org) | Type-safe test authoring |
| [@faker-js/faker](https://fakerjs.dev) | Unique test data generation |
| [allure-playwright](https://www.npmjs.com/package/allure-playwright) | Rich test reporting with steps, screenshots & videos |
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
│   ├── auth.signup.spec.ts  # Registration flows
│   ├── settings.spec.ts     # Settings page (TC_SET_001–009)
│   ├── tags.spec.ts         # Tag filter (TC_TAG_001–005)
│   ├── comments.spec.ts     # Comments (TC_CMT_001–006)
│   └── feed.spec.ts         # Pagination (TC_PAG_001–005)
│
├── pages/                   # Page Object Model classes
├── fixtures/                # Playwright fixture extensions
├── utils/                   # Reusable helpers (apiHelper, waitHelper, env)
├── screenshots/             # Visual-regression baselines (committed)
├── scripts/                 # Report generator script
├── .env.example             # Environment variable template
├── playwright.config.ts     # Playwright + Allure configuration
└── .github/workflows/
    └── playwright.yml       # GitHub Actions CI pipeline
```

### Generated folders (not in git)

These folders are **created when you run tests** and are listed in `.gitignore`. They will not appear in the repo until you run the commands below:

| Folder | Created by | Contents |
|---|---|---|
| `allure-results/` | `playwright test` (allure-playwright reporter) | Raw JSON result files |
| `allure-report/` | `npm run allure:generate` | Interactive HTML Allure report |
| `playwright-report/` | `playwright test` (html reporter) | Playwright HTML report |
| `test-results/` | `playwright test` | Traces, screenshots, JSON/XML results |

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**
- **Allure CLI** (for generating HTML reports locally) — install via [Scoop](https://scoop.sh), [Homebrew](https://brew.sh), or `npm install -g allure-commandline`

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/marianasir123/conduit-playwright-e2e.git
cd conduit-playwright-e2e

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps chromium

# 4. Configure environment
cp .env.example .env
# Edit .env with your test account credentials
```

---

## Configuration

Copy `.env.example` to `.env` and fill in your test credentials:

```env
BASE_URL=https://conduit.bondaracademy.com
USER_EMAIL=your-test-email@example.com
USER_PASSWORD=your-secure-password
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
| `npm run report` | Open the last Playwright HTML report |

### Run a single file

```bash
npx playwright test tests/auth.login.spec.ts --project=chromium
```

### Run a single test by name

```bash
npx playwright test --grep "TC_AUTH_016" --project=chromium
```

---

## Allure Reporting (Local)

Allure folders are **not committed to git**. Generate them locally in two steps:

```bash
# Step 1 — run tests (creates allure-results/)
npm run test:chromium

# Step 2 — build HTML report (creates allure-report/)
npm run allure:generate

# Step 3 — open in browser
npm run allure:open
```

Or in one command after tests have run:

```bash
npm run allure:report
```

After step 1 you should see files like `allure-results/*-result.json`. After step 2, open `allure-report/index.html` in a browser.

---

## CI / CD

Tests run automatically on every **push** and **pull request** to `main` via [GitHub Actions](https://github.com/marianasir123/conduit-playwright-e2e/actions/workflows/playwright.yml).

### Required GitHub secrets / variables

| Name | Where | Description |
|---|---|---|
| `USER_EMAIL` | Secret | Dedicated test account email |
| `USER_PASSWORD` | Secret | Dedicated test account password |
| `BASE_URL` | Variable (optional) | Defaults to `https://conduit.bondaracademy.com` |

Configure at: **Repository → Settings → Secrets and variables → Actions**

### CI artifacts (download from Actions run)

| Artifact | Description | Retention |
|---|---|---|
| `allure-report` | Full interactive Allure HTML report | 14 days |
| `allure-results` | Raw Allure JSON (for replay/regeneration) | 14 days |
| `playwright-report` | Playwright built-in HTML report | 14 days |
| `test-summary-report` | Markdown + HTML summary, JSON, JUnit XML | 14 days |
| `test-results` | Traces, screenshots, videos (failures only) | 7 days |

To download: open a workflow run → **Artifacts** section at the bottom.

### GitHub Pages — live Allure report

On every push to `main`, the Allure HTML report is deployed to GitHub Pages.

**One-time setup (required):**

1. Go to **Repository → Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Push to `main` — the `deploy-allure-report` job publishes the report

**Report URL:** `https://marianasir123.github.io/conduit-playwright-e2e/`

> If the page is empty after the first run, wait for the workflow to finish and refresh. The report updates after each push to `main`.

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
| `settings.spec.ts` | 9 | Settings page updates, validation, known bugs |
| `tags.spec.ts` | 5 | Tag filter sidebar, active tab, navigation |
| `comments.spec.ts` | 6 | Add/delete comments, guest access, validation |
| `feed.spec.ts` | 5 | Global Feed pagination, tab switching |

See [TEST_PLAN.md](./TEST_PLAN.md) for the full test plan with automation status.

---

## Architecture Decisions

- **Page Object Model** — all selectors and page actions live in `pages/`. Tests never contain raw selectors.
- **Fixture chain** — `loginData` → `loginPage` → `cleanupData` fixtures compose cleanly to avoid test boilerplate.
- **No hard waits** — every `waitForTimeout` has been replaced with `waitForResponse`, `waitForURL`, or `expect(...).toBeVisible()`.
- **API-based setup/cleanup** — `beforeAll`/`afterAll` hooks create and delete test data through the REST API.
- **Environment variables** — credentials and base URL are injected at runtime; the codebase contains no secrets.
- **Serial mode for stateful suites** — suites that share state use `test.describe.configure({ mode: 'serial' })`.
- **Visual regression** — screenshot baselines stored in `screenshots/`; compared via `expect(page).toHaveScreenshot()`.

---

## Known Limitations

- Tests share a single test account. Running on multiple browsers simultaneously in CI is disabled (`workers: 1`) to avoid race conditions.
- `TC_ART_012` is skipped — documents a known application bug where submitting an empty title saves the article instead of showing a validation error.
- `allure-results/` and `allure-report/` are gitignored — they only exist after running tests locally or downloading CI artifacts.
