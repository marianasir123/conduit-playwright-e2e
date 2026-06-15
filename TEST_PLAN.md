# Conduit Test Plan & Test Cases

## 1. Test Objectives
- Verify authentication flows (login, signup, logout)
- Validate article creation, editing, deletion, and listing
- Test user interactions with articles (favorite, unfavorite, comment)
- Verify navigation between pages
- Test user profile and settings
- Ensure proper error handling

## 2. Test Scope
### In Scope
- User authentication (Sign In, Sign Up, Logout)
- Article Management (Create, Read, Update, Delete)
- Article Interactions (Like, Unlike, Comments)
- Navigation
- User Profile Management
- Settings
- API is used hybrid for login, cleanup, and lookups

### Out of Scope
- Dedicated API-only test suite 
- Performance testing
- Security testing (SSL, XSS, CSRF)
- Mobile responsiveness

### Automation Status (June 2026)
| Status | Count | Notes |
|--------|------:|-------|
| Automated | 107 | See Section 8 — Existing Test Coverage |
| Skipped | 1 | TC_ART_012 — known app bug (empty title on edit saves) |
| Planned | 25+ | Settings, Tags, Comments, Pagination — Section 4.5–4.7 |

## 3. Test Environment
- **URL**: https://conduit.bondaracademy.com/
- **Browser**: Chromium (CI); Firefox/WebKit available locally
- **Framework**: Playwright with TypeScript
- **Credentials**: `USER_EMAIL`, `USER_PASSWORD` via `.env` / GitHub Secrets
- **Reporting**: HTML + JUnit + JSON reports; GitHub Actions job summary

## 4. Test Cases by Category

### 4.1 Authentication Tests

#### TC_AUTH_001: Valid Login
- **Objective**: User can login with valid credentials
- **Steps**: 
  1. Navigate to login page
  2. Enter valid email and password
  3. Click Sign In
- **Expected**: User is on home page with logged-in state

#### TC_AUTH_002: Invalid Email Login
- **Objective**: Login fails with invalid email
- **Steps**: 
  1. Navigate to login page
  2. Enter invalid email format
  3. Click Sign In
- **Expected**: Error message displayed

#### TC_AUTH_003: Logout Functionality
- **Objective**: User can logout successfully
- **Steps**:
  1. Login with valid credentials
  2. Click Settings/Profile menu
  3. Click Logout
- **Expected**: User redirected to home, logged-out state

#### TC_AUTH_004: Session Persistence
- **Objective**: Session persists on page refresh
- **Steps**:
  1. Login successfully
  2. Refresh page
  3. Verify still logged in
- **Expected**: User remains logged in

### 4.2 Article Management Tests

#### TC_ART_001: Create Article with Valid Data
- **Objective**: User can create a new article with all required fields
- **Steps**:
  1. Login with valid credentials
  2. Navigate to "New Article"
  3. Fill title, description, and body
  4. Click "Publish Article"
- **Expected**: Article is created and displayed with correct content
- **Test Type**: Happy Path

#### TC_ART_002: Article Appears in Feed
- **Objective**: Created article appears in home feed
- **Steps**:
  1. Create new article
  2. Return to home feed
  3. Verify article is visible
- **Expected**: Article appears at top of feed with correct title and description
- **Test Type**: Happy Path / Integration

#### TC_ART_003: Editor Form Empty State
- **Objective**: New article form starts with empty fields
- **Steps**:
  1. Navigate to "New Article"
  2. Verify all form fields
- **Expected**: Title, description, and body fields are empty
- **Test Type**: UI Behavior

#### TC_ART_004: Publish Button Disabled Without Title
- **Objective**: Publish button is disabled when title is missing
- **Steps**:
  1. Navigate to editor
  2. Fill description and body, leave title empty
  3. Check publish button state
- **Expected**: Publish button is disabled
- **Test Type**: Form Validation

#### TC_ART_005: Create Fails with Empty Title
- **Objective**: Cannot create article without title
- **Steps**:
  1. Navigate to editor
  2. Leave title empty, fill other fields
  3. Attempt to publish
- **Expected**: Publish button is disabled, article not created
- **Test Type**: Negative - Required Field

#### TC_ART_006: Create Fails with Empty Body
- **Objective**: Cannot create article without body content
- **Steps**:
  1. Navigate to editor
  2. Fill title and description, leave body empty
  3. Attempt to publish
- **Expected**: Publish button is disabled
- **Test Type**: Negative - Required Field

#### TC_ART_007: Very Long Title Handling
- **Objective**: Very long titles are handled appropriately
- **Steps**:
  1. Create article with title >200 characters
  2. Attempt to publish
- **Expected**: Title is truncated or rejected with error
- **Test Type**: Edge Case

#### TC_ART_008: Special Characters in Title
- **Objective**: Special characters in title are preserved
- **Steps**:
  1. Create article with @#$%^ in title
  2. Publish and view
- **Expected**: Special characters are properly encoded and displayed
- **Test Type**: Edge Case / Security

#### TC_ART_009: Edit Article Successfully
- **Objective**: User can edit own article content
- **Steps**:
  1. Create article
  2. Click "Edit Article"
  3. Modify title, description, body
  4. Publish changes
- **Expected**: Changes are saved and visible on article page
- **Test Type**: Happy Path

#### TC_ART_010: Edit Form Prepopulation
- **Objective**: Edit form is prepopulated with current content
- **Steps**:
  1. Create article
  2. Click "Edit Article"
  3. Verify form fields contain current content
- **Expected**: Title, description, body match current article content
- **Test Type**: UI Behavior

#### TC_ART_011: Edit Updates Timestamp
- **Objective**: Article timestamp updates when edited
- **Steps**:
  1. Create article and note timestamp
  2. Edit article (wait 1+ second)
  3. Check updated timestamp
- **Expected**: Timestamp reflects edit time
- **Test Type**: Data Validation

#### TC_ART_012: Edit Fails Without Title
- **Objective**: Cannot remove title when editing
- **Steps**:
  1. Create article
  2. Edit and clear title
  3. Attempt to publish
- **Expected**: Publish button disabled
- **Test Type**: Negative - Required Field
- **Automation**: Skipped — app currently saves article with empty title (known bug)

#### TC_ART_013: Edit Preserves Metadata
- **Objective**: Tags and metadata are preserved during edit
- **Steps**:
  1. Create article with tags
  2. Edit article
  3. Verify tags still exist
- **Expected**: Tags/metadata remain unchanged
- **Test Type**: Data Integrity

#### TC_ART_014: Delete Article Successfully
- **Objective**: User can delete own article
- **Steps**:
  1. Create article
  2. Click "Delete Article"
  3. Confirm deletion
- **Expected**: Article removed, user redirected to home
- **Test Type**: Happy Path

#### TC_ART_015: Delete Redirects to Home
- **Objective**: User is redirected to home after deletion
- **Steps**:
  1. Create and view article
  2. Click "Delete Article"
- **Expected**: Redirected to home page (/), article no longer visible
- **Test Type**: Navigation

#### TC_ART_016: No Delete Button on Others' Articles
- **Objective**: Delete button not visible on other users' articles
- **Steps**:
  1. View another user's article
  2. Check for delete button
- **Expected**: Delete button is not visible
- **Test Type**: Access Control / Security

#### TC_ART_017: Delete Doesn't Affect Other Articles
- **Objective**: Deleting one article doesn't affect others
- **Steps**:
  1. Create two articles
  2. Delete second article
  3. Verify first still exists
- **Expected**: Other articles remain intact
- **Test Type**: Data Isolation

#### TC_ART_018: Favorite Article Successfully
- **Objective**: User can favorite an article
- **Steps**:
  1. View article
  2. Click heart/favorite button
  3. Verify count increases
- **Expected**: Favorite count increases by 1
- **Test Type**: Happy Path

#### TC_ART_019: Favorite Button Shows Active State
- **Objective**: Favorite button visual state changes when active
- **Steps**:
  1. View article
  2. Click favorite button
  3. Observe button styling
- **Expected**: Button shows active/pressed state (different color/styling)
- **Test Type**: UI Behavior

#### TC_ART_020: Favorite Appears in Profile
- **Objective**: Favorited articles appear in user profile
- **Steps**:
  1. Favorite an article
  2. Navigate to profile
  3. Check favorited articles section
- **Expected**: Favorited article visible in "Favorited Articles" tab/section
- **Test Type**: Integration

#### TC_ART_021: Unfavorite Article Successfully
- **Objective**: User can unfavorite a previously favorited article
- **Steps**:
  1. Favorite an article
  2. Click favorite button again
  3. Verify count decreases
- **Expected**: Favorite count decreases by 1
- **Test Type**: Happy Path

#### TC_ART_022: Unfavorite Resets Button State
- **Objective**: Button returns to inactive state when unfavorited
- **Steps**:
  1. Favorite article
  2. Unfavorite article
  3. Check button styling
- **Expected**: Button returns to inactive/unpressed state
- **Test Type**: UI Behavior

#### TC_ART_023: HTML Content Safety
- **Objective**: HTML in article body is safely displayed
- **Steps**:
  1. Create article with HTML/script tags in body
  2. View article
- **Expected**: HTML is displayed as text, not executed
- **Test Type**: Security / Edge Case

#### TC_ART_024: Rapid Create and Edit
- **Objective**: Article handles rapid create/edit operations
- **Steps**:
  1. Create article
  2. Immediately edit without leaving page
  3. Publish changes
- **Expected**: Both operations complete successfully
- **Test Type**: Edge Case / Stress

#### TC_ART_025: Multi-user Article Operations
- **Objective**: Multiple users can operate on articles independently
- **Steps**:
  1. Create article as user A
  2. Favorite article as user A
  3. Verify isolation
- **Expected**: User A's favorites don't affect other users
- **Test Type**: Isolation / Concurrency

#### TC_ART_026: Article URL Format
- **Objective**: Article URL is properly formatted as slug
- **Steps**:
  1. Create article with special characters and spaces
  2. Check resulting URL
- **Expected**: URL contains article slug in format /article/[slug]
- **Test Type**: Format Validation


### 4.3 Navigation Tests

#### TC_NAV_001: Home Link Navigation
- **Objective**: Home link navigates to feed
- **Steps**: Click "Home" link
- **Expected**: On home page with article feed

#### TC_NAV_002: Logo Navigation
- **Objective**: Logo navigates to home
- **Steps**: Click Conduit logo
- **Expected**: On home page

#### TC_NAV_003: Sign In Link
- **Objective**: Sign In link navigates to login page
- **Steps**: Click "Sign in" (when logged out)
- **Expected**: On login page

#### TC_NAV_004: Sign Up Link
- **Objective**: Sign Up link navigates to register page
- **Steps**: Click "Sign up"
- **Expected**: On registration page

> **Note:** TC_NAV_005–TC_NAV_030 are automated in `tests/navigation.spec.ts` (logged-in nav, New Article, Settings link, profile menu, feed tabs, etc.). See Section 8 for the full mapping.

### 4.4 Tag Filter Tests

#### TC_TAG_001: Filter by Tag
- **Objective**: Articles can be filtered by tag
- **Preconditions**: At least one article with a known tag exists in the feed
- **Steps**:
  1. Navigate to home feed
  2. Click a tag on an article preview or in the sidebar
- **Expected**: Feed shows only articles with that tag; URL reflects tag filter
- **Automation**: Planned

#### TC_TAG_002: Popular Tags Display
- **Objective**: Popular tags are displayed in the sidebar
- **Preconditions**: User on home feed
- **Steps**:
  1. Look at the sidebar tag list
- **Expected**: Multiple tags visible; tags are clickable
- **Automation**: Planned

#### TC_TAG_003: Tag Filter from Article Detail Page
- **Objective**: Clicking a tag on an article page filters the feed by that tag
- **Preconditions**: User viewing an article that has at least one tag
- **Steps**:
  1. Open an article with tags
  2. Click a tag link on the article page
- **Expected**: Navigated to tag-filtered feed; article list matches selected tag
- **Automation**: Planned

#### TC_TAG_004: Tag Filter Persists in URL
- **Objective**: Tag filter state is reflected in the URL
- **Preconditions**: User on home feed
- **Steps**:
  1. Click a tag in the sidebar
  2. Observe URL
  3. Refresh the page
- **Expected**: URL contains tag parameter/path; filtered feed persists after refresh
- **Automation**: Planned

#### TC_TAG_005: Clear Tag Filter Returns to Global Feed
- **Objective**: User can return to unfiltered global feed from tag view
- **Preconditions**: User viewing tag-filtered feed
- **Steps**:
  1. Apply a tag filter
  2. Click "Global Feed" tab or home link
- **Expected**: Full global feed restored; tag filter no longer applied
- **Automation**: Planned

### 4.5 Settings Tests

#### TC_SET_001: Settings Page Loads with Current Profile Data
- **Objective**: Settings form displays the logged-in user's current profile
- **Preconditions**: User logged in
- **Steps**:
  1. Navigate to Settings (`/settings`)
  2. Compare form field values with GET `/api/user` profile
- **Expected (ideal)**: Username, email, bio, and image fields are populated with current user data
- **Actual / Known bug (APP-BUG-SET-001)**: Bio, image URL, and email are **not** pre-populated in the form even when the API returns values
- **Automation**: Automated — `tests/settings.spec.ts` (documents bug via assertion + annotation)

#### TC_SET_002: Update Username Successfully
- **Objective**: User can change username and see it reflected across the app
- **Preconditions**: User logged in on Settings page
- **Steps**:
  1. Change username to a unique value
  2. Click "Update Settings"
  3. Navigate to profile and header
- **Expected**: New username shown in navbar and profile URL; old username no longer used
- **Automation**: Planned

#### TC_SET_003: Update Bio and Profile Image
- **Objective**: User can update bio and image URL
- **Preconditions**: User logged in on Settings page
- **Steps**:
  1. Update bio text and image URL (valid Conduit API image URL)
  2. Click "Update Settings"
  3. Open user profile and inspect navbar
- **Expected**: Bio appears on profile under username; profile image appears in top navigation bar
- **Automation**: Automated — `tests/settings.spec.ts`

#### TC_SET_004: Settings Validation — Empty Username
- **Objective**: Settings rejects empty username
- **Preconditions**: User on Settings page
- **Steps**:
  1. Clear username field
  2. Click "Update Settings"
- **Expected (ideal)**: Update blocked or validation error shown; username unchanged
- **Actual / Known bug (APP-BUG-SET-002)**: Empty username is accepted; API silently retains previous username
- **Automation**: Automated — `tests/settings.spec.ts` (documents bug via assertion + annotation)

#### TC_SET_005: Settings Validation — Invalid Email Format
- **Objective**: Settings rejects invalid email
- **Preconditions**: User on Settings page
- **Steps**:
  1. Enter invalid email (e.g. `not-an-email`)
  2. Click "Update Settings"
- **Expected (ideal)**: Validation error; email not saved
- **Actual / Known bug (APP-BUG-SET-003)**: Invalid email format is saved without validation
- **Automation**: Automated — `tests/settings.spec.ts` (documents bug via assertion + annotation)

#### TC_SET_006: Change Password Successfully
- **Objective**: User can update password and login with new credentials
- **Preconditions**: User logged in on Settings page
- **Steps**:
  1. Enter current password and new password
  2. Click "Update Settings"
  3. Log out and log in with new password
- **Expected**: Login succeeds with new password; old password rejected
- **Automation**: Planned

#### TC_SET_007: Change Password — Wrong Current Password
- **Objective**: Password change fails when current password is incorrect
- **Preconditions**: User on Settings page
- **Steps**:
  1. Enter wrong current password and a new password
  2. Click "Update Settings"
- **Expected**: Error message; password unchanged
- **Automation**: Planned

#### TC_SET_008: Settings Persistence After Refresh
- **Objective**: Saved settings survive page refresh
- **Preconditions**: User updated profile fields successfully
- **Steps**:
  1. Update bio on Settings
  2. Refresh Settings page
- **Expected**: Updated bio still displayed in form
- **Automation**: Planned

#### TC_SET_009: Settings Requires Authentication
- **Objective**: Unauthenticated users cannot access Settings
- **Preconditions**: User logged out
- **Steps**:
  1. Navigate directly to `/settings`
- **Expected**: Redirected to login or home; settings form not accessible
- **Automation**: Planned

### 4.6 Comment Tests

#### TC_CMT_001: Add Comment on Own Article
- **Objective**: Logged-in user can post a comment on an article
- **Preconditions**: User logged in; viewing an article (own or other user's)
- **Steps**:
  1. Enter comment text in comment form
  2. Click "Post Comment"
- **Expected**: Comment appears in comment list with author and body
- **Automation**: Planned (locators exist in `pages/article.page.ts`)

#### TC_CMT_002: Add Comment as Article Author
- **Objective**: Article author can comment on their own article
- **Preconditions**: User logged in; viewing own article
- **Steps**:
  1. Post a comment
- **Expected**: Comment visible; author matches logged-in user
- **Automation**: Planned

#### TC_CMT_003: Delete Own Comment
- **Objective**: User can delete a comment they authored
- **Preconditions**: User has posted a comment on an article
- **Steps**:
  1. Click delete on own comment
  2. Confirm if prompted
- **Expected**: Comment removed from list
- **Automation**: Planned

#### TC_CMT_004: View Comments from Other Users on Global Feed Articles
- **Objective**: Logged-in user can see comments authored by other users on articles accessed from Global Feed
- **Preconditions**: Global Feed article has a comment from another user (seeded via disposable API user in test setup)
- **Steps**:
  1. Navigate to Global Feed
  2. Open an article with a comment from another user
  3. Verify comment body, author, and association with the article
- **Expected**: Comment visible with correct author name and body text
- **Automation**: Automated — `tests/comments.spec.ts`

#### TC_CMT_005: Comment Form Hidden When Logged Out
- **Objective**: Guest users cannot post comments
- **Preconditions**: User logged out
- **Steps**:
  1. Open any article
  2. Look for comment input
- **Expected**: Comment form hidden or replaced with sign-in prompt
- **Automation**: Planned

#### TC_CMT_006: Empty Comment Not Submitted
- **Objective**: Empty comment cannot be posted
- **Preconditions**: User logged in on article page
- **Steps**:
  1. Leave comment field empty
  2. Click "Post Comment"
- **Expected (ideal)**: Post button disabled or submission blocked
- **Actual behavior**: Post Comment button stays enabled; API returns validation error **"body can't be blank"** shown in UI; no comment added
- **Automation**: Automated — `tests/comments.spec.ts`

### 4.7 Pagination Tests

#### TC_PAG_001: Global Feed Shows Pagination When Articles Exceed Page Size
- **Objective**: Pagination controls appear when feed has more articles than one page
- **Preconditions**: Global feed has sufficient articles (or seed via API)
- **Steps**:
  1. Navigate to home — Global Feed tab
  2. Scroll to bottom of feed
- **Expected**: Page navigation (e.g. page numbers or next/prev) visible
- **Automation**: Planned

#### TC_PAG_002: Navigate to Next Page on Global Feed
- **Objective**: User can load the next page of global feed articles
- **Preconditions**: Pagination visible on global feed
- **Steps**:
  1. Note articles on page 1
  2. Click next page or page 2
- **Expected**: Different set of articles displayed; URL/page indicator updates
- **Automation**: Planned

#### TC_PAG_003: Navigate Back to Previous Page
- **Objective**: User can return to previous feed page
- **Preconditions**: User on page 2+ of global feed
- **Steps**:
  1. Click previous page or page 1
- **Expected**: Original page 1 articles restored
- **Automation**: Planned

#### TC_PAG_004: Your Feed Pagination
- **Objective**: Your Feed tab supports pagination when followed content exceeds page size
- **Preconditions**: User follows authors with many articles
- **Steps**:
  1. Switch to "Your Feed" tab
  2. Navigate to page 2 if available
- **Expected**: Pagination works on Your Feed same as Global Feed
- **Automation**: Planned

#### TC_PAG_005: Pagination Resets When Switching Feed Tabs
- **Objective**: Switching between Global and Your Feed resets to page 1
- **Preconditions**: User on page 2 of Global Feed
- **Steps**:
  1. Go to page 2 on Global Feed
  2. Switch to Your Feed
  3. Switch back to Global Feed
- **Expected**: Feed returns to page 1 (or consistent default)
- **Automation**: Planned

### 4.8 Profile Tests

#### TC_ART_027: Created Article in "My Posts" Profile Section
- **Objective**: Article created by user appears in their profile "My Posts" section
- **Steps**:
  1. Create new article
  2. Navigate to user profile
  3. Verify article in "My Posts" tab
- **Expected**: Created article visible in profile's "My Posts" tab
- **Test Type**: Integration / Profile
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_028: "My Posts" Shows All User Articles
- **Objective**: Profile "My Posts" displays all articles created by the user
- **Steps**:
  1. Get article count before creation
  2. Create new article
  3. Navigate to profile
  4. Verify count increased and new article visible
- **Expected**: Article count increases, new article appears in "My Posts"
- **Test Type**: Integration / Data Consistency
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_029: "My Posts" Shows Only User Articles
- **Objective**: Other users' articles not shown in "My Posts"
- **Steps**:
  1. Navigate to own profile
  2. Verify articles shown belong to user
- **Expected**: Articles in "My Posts" are authored by logged-in user
- **Test Type**: Access Control / Filtering
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_030: Deleted Article Removed from "My Posts"
- **Objective**: Deleted article is removed from user profile
- **Steps**:
  1. Create article
  2. Verify in profile "My Posts"
  3. Delete article
  4. Verify removed from profile
- **Expected**: Article no longer appears in profile after deletion
- **Test Type**: Integration / Data Sync
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_031: Edited Article Reflects Changes in Profile
- **Objective**: Article edits are reflected in profile "My Posts"
- **Steps**:
  1. Create article
  2. Edit article title
  3. Verify updated title in profile
  4. Verify old title not visible
- **Expected**: Profile shows updated article title, old title removed
- **Test Type**: Integration / Data Consistency
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_032: "Favorited Posts" Tab Shows Favorited Articles
- **Objective**: User's favorited articles appear in "Favorited Posts" profile tab
- **Steps**:
  1. Create and favorite an article
  2. Navigate to profile
  3. Click "Favorited Posts" tab
  4. Verify article visible
- **Expected**: Favorited article appears in "Favorited Posts" section
- **Test Type**: Integration / Feature
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_033: Unfavoriting Removes Article from "Favorited Posts"
- **Objective**: Unfavoriting removes article from profile's "Favorited Posts"
- **Steps**:
  1. Favorite an article
  2. Verify in "Favorited Posts"
  3. Unfavorite the article
  4. Verify removed from "Favorited Posts"
- **Expected**: Article disappears from "Favorited Posts" after unfavoriting
- **Test Type**: Integration / State Management
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_034: Profile Displays Correct Article Count
- **Objective**: Article count in profile reflects actual user articles
- **Steps**:
  1. Get initial article count
  2. Create 2 articles
  3. Return to profile
  4. Verify count increased by 2
- **Expected**: Article count increments correctly with new articles
- **Test Type**: Data Validation
- **Automation**: Automated — `tests/profile.spec.ts`

#### TC_ART_035: "My Posts" and "Favorited Posts" Tabs Switchable
- **Objective**: User can switch between "My Posts" and "Favorited Posts" tabs
- **Steps**:
  1. Navigate to profile
  2. Click "Favorited Posts" tab
  3. Verify URL includes "/favorites"
  4. Click "My Posts" tab
  5. Verify URL doesn't include "/favorites"
- **Expected**: Tabs switch correctly with proper URL changes
- **Test Type**: Navigation / UI
- **Automation**: Automated — `tests/profile.spec.ts`

### 4.9 Edge Cases & Error Handling

#### TC_ERR_001: Empty Article Title
- **Objective**: Cannot create article without title
- **Steps**:
  1. Try to publish article without title
- **Expected**: Error message or field validation
- **Automation**: Covered by TC_ART_004, TC_ART_005

#### TC_ERR_002: Network Error Handling
- **Objective**: App handles network errors gracefully
- **Steps**: (Simulate network issue)
- **Expected**: User-friendly error message
- **Automation**: Planned

> **Note:** Authentication test IDs TC_AUTH_001–TC_AUTH_017, TC_SIGNUP_001–TC_SIGNUP_016, and TC_LOGOUT_001–TC_LOGOUT_010 are automated in `tests/auth.login.spec.ts`, `tests/auth.signup.spec.ts`, and `tests/auth.logout.spec.ts`. The scenarios in Section 4.1 (TC_AUTH_001–004) are a subset; see Section 8 for the full mapping.

## 5. Test Execution Strategy
- Run tests in parallel (CI uses Chromium; local can target all browsers)
- Serial mode for `article.spec.ts` and `profile.spec.ts` (shared article state)
- Retries on CI for transient failures (max 2)
- Capture screenshots and traces on failure
- Generate HTML, JUnit, and JSON reports; GitHub Actions job summary via `scripts/generate-test-report.mjs`

## 6. Non-Flaky Test Practices
- Use role-based locators (getByRole)
- Add explicit waits for state changes
- Avoid hard waits (use waitForURL, waitForSelector)
- Use POM pattern to abstract locators
- Retry on transient failures
- Resolve username via API (`loginData.username`) — do not derive from email prefix

## 7. Reporting
- HTML report with test results
- JUnit XML for GitHub Checks (`dorny/test-reporter`)
- JSON report for custom summary (`summary.md` / `summary.html`)
- Screenshots on failure
- Video recording (optional)
- Execution time metrics

## 8. Existing Test Coverage

| Spec file | Test IDs | Count | Status |
|-----------|----------|------:|--------|
| `tests/auth.login.spec.ts` | TC_AUTH_001–017 | 17 | Automated |
| `tests/auth.signup.spec.ts` | TC_SIGNUP_001–016 | 16 | Automated |
| `tests/auth.logout.spec.ts` | TC_LOGOUT_001–010 | 10 | Automated |
| `tests/article.spec.ts` | TC_ART_001–026 | 26 | 25 pass, 1 skip (TC_ART_012) |
| `tests/profile.spec.ts` | TC_ART_027–035 | 9 | Automated |
| `tests/navigation.spec.ts` | TC_NAV_001–030 | 30 | Automated |
| **Total automated** | | **108** | |
| **Planned (this plan)** | TC_SET_*, TC_TAG_*, TC_CMT_*, TC_PAG_* | 25 | Not yet automated |

### Coverage by feature area

| Feature | Automated | Gaps (planned IDs) |
|---------|-----------|-------------------|
| Login / Signup / Logout | TC_AUTH, TC_SIGNUP, TC_LOGOUT | — |
| Article CRUD & favorites | TC_ART_001–026 | TC_ART_012 skipped (app bug) |
| Profile tabs & counts | TC_ART_027–035 | — |
| Navigation & header | TC_NAV_001–030 | Settings deep tests |
| Settings | TC_NAV_020, 023, 029 (nav only) | TC_SET_001–009 |
| Tag filter | — | TC_TAG_001–005 |
| Comments | Locators only | TC_CMT_001–006 |
| Pagination | — | TC_PAG_001–005 |

## 9. Suggestions for Improvement

1. **Automate planned scenarios** — Add `settings.spec.ts`, `tags.spec.ts`, `comments.spec.ts`, and `feed.spec.ts` (pagination) using existing POMs and `loginPage.fixture.ts`.
2. **API seeding for pagination/tags** — Use `apiHelper.ts` to create enough tagged articles or pages when UI data is insufficient.
3. **Settings cleanup** — Restore original username/password after TC_SET_002/006 to avoid polluting shared test account.
4. **Comment delete confirmation** — Verify whether Conduit uses a confirm dialog before automating TC_CMT_003.
5. **Track TC_ART_012** — Re-enable when app validates empty title on edit; link to app bug ticket if available.
6. **Align Section 4.1 auth IDs** — Expand documented TC_AUTH entries to match TC_AUTH_001–017 in code, or keep summary note (Section 8) as source of truth.
7. **CI stability** — Keep serial article/profile suites; avoid parallel runs that share the same user’s articles.
