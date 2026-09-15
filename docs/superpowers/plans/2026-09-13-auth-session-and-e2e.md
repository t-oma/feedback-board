# Auth Session and E2E Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish credential authentication with a reusable server-side session check, a protected placeholder dashboard, idempotent sign-out, and a real Playwright account lifecycle against PostgreSQL.

**Architecture:** A server-only auth module reads and memoizes the Better Auth session for one React render, while each protected page calls an explicit `requireSession()` guard. Playwright loads a separate test environment, refuses any database except `feedback_board_test`, applies checked-in Drizzle migrations, and drives the public UI without test-only auth shortcuts.

**Tech Stack:** Next.js 16.3.1 App Router, React 19.2.8, Better Auth 1.7.1, Drizzle ORM 1.0.0-rc.4, PostgreSQL 18, Vitest 4.1.11, Playwright Test, Zod 4.4.3, Tailwind CSS 4, pnpm 11.9.0, Node.js 24.

## Global constraints

- Read `node_modules/next/dist/docs/01-app/02-guides/authentication.md`, `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`, and `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` before changing Next.js code or test configuration.
- Name the session module `src/features/auth/session.server.ts` and import `server-only` inside it.
- Do not export the session module through `src/features/auth/index.ts`; Client Components must not be able to reach it through the mixed feature barrel.
- Protect `/dashboard` in its page component. Do not add a layout-only guard or `proxy.ts`.
- Mark `/dashboard` with `export const instant = false`; the whole protected page intentionally waits for its request-bound session result instead of streaming a placeholder shell.
- Keep sign-out idempotent. It does not call `requireSession()` and redirects to `/` only after `auth.api.signOut()` resolves.
- Keep the dashboard to a `Dashboard` heading and sign-out form. Product onboarding and final dashboard styling remain out of scope.
- E2E runs only when both database URLs decode to the exact path `/feedback_board_test` and `FEEDBACK_BOARD_ENV` is `test`.
- Use `.next-e2e` as the Next.js `distDir` only when `FEEDBACK_BOARD_ENV` is `test`, so the Playwright server can run beside the regular development server without sharing its lock or cache.
- Never create, drop, reset, or truncate a database from the E2E runner. The test database must already exist.
- Apply checked-in Drizzle migrations before browser tests and use unique account emails so tests do not depend on database cleanup or execution order.
- Keep browser tests in `e2e/*.e2e.ts`. Vitest tests retain the `.test.ts` suffix.
- Use the existing account-creation fallback `/dashboard`, bare sign-in fallback `/`, generic invalid-credentials message, Button spinner, and theme tokens unchanged.

## File map

- Create `.env.test.example` as the non-secret template copied to ignored `.env.test.local`.
- Create `e2e/environment.ts` for pure parsing and test-database URL validation.
- Create `e2e/environment.test.ts` for the safety guard's Vitest coverage.
- Create `e2e/load-environment.ts` to load Next.js test env files and expose validated values.
- Create `e2e/global-setup.ts` to apply Drizzle migrations to the validated test database.
- Create `e2e/README.md` with exact local setup and execution commands.
- Create `playwright.config.ts` for one isolated Chromium project and its Next.js web server.
- Modify `.gitignore`, `next.config.ts`, `package.json`, and `pnpm-lock.yaml` for Playwright, `@next/env`, scripts, examples, and generated artifacts.
- Create `src/features/auth/session.server.ts` and `src/features/auth/session.server.test.ts` for the reusable session boundary.
- Create `src/app/dashboard/page.tsx` for page-level protection and the placeholder UI.
- Modify `src/features/auth/actions.ts` and `src/features/auth/actions.test.ts` for sign-out.
- Create `src/features/auth/ui/sign-out-button.tsx` for the pending submit state.
- Modify `src/features/auth/index.ts` to expose the sign-out action and UI, but not the session helper.
- Create `e2e/auth.e2e.ts` for guest protection and the complete credential lifecycle.

---

### Task 1: Add a guarded Playwright harness

**Files:**

- Create: `.env.test.example`
- Create: `e2e/environment.ts`
- Create: `e2e/environment.test.ts`
- Create: `e2e/load-environment.ts`
- Create: `e2e/global-setup.ts`
- Create: `e2e/README.md`
- Create: `playwright.config.ts`
- Modify: `.gitignore:13-15,35-38`
- Modify: `eslint.config.mjs:8-17`
- Modify: `next.config.ts:1-7`
- Modify: `tsconfig.json:24-37` (Next.js adds the isolated development type paths when the E2E server first starts)
- Modify: `package.json:6-22,39-58`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Existing `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `FEEDBACK_BOARD_ENV` names from `src/server/env.ts`.
- Produces: `E2E_BASE_URL`, `parseE2EEnvironment(environment)`, and `e2eEnvironment` for Playwright configuration and migration setup.
- Produces: `pnpm test:e2e` and an isolated Chromium installation documented in `e2e/README.md`.

- [ ] **Step 1: Install the test-runner dependencies**

Run:

```bash
pnpm add -D @playwright/test@latest
pnpm add -D --save-exact @next/env@16.3.1
```

Expected: `package.json` contains both packages under `devDependencies`, and `pnpm-lock.yaml` records their resolved versions. `@next/env` matches the installed Next.js version exactly.

- [ ] **Step 2: Write the failing environment-guard tests**

Create `e2e/environment.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { E2E_BASE_URL, parseE2EEnvironment } from "./environment";

const validEnvironment = {
  DATABASE_URL:
    "postgresql://feedback:password@127.0.0.1:5432/feedback_board_test",
  DATABASE_URL_UNPOOLED:
    "postgresql://feedback:password@127.0.0.1:5432/feedback_board_test",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: E2E_BASE_URL,
  FEEDBACK_BOARD_ENV: "test",
} satisfies Record<string, string>;

describe("parseE2EEnvironment", () => {
  it("returns an explicitly configured test environment", () => {
    expect(parseE2EEnvironment(validEnvironment)).toEqual(validEnvironment);
  });

  it.each(["DATABASE_URL", "DATABASE_URL_UNPOOLED"] as const)(
    "rejects a non-test %s",
    (key) => {
      expect(() =>
        parseE2EEnvironment({
          ...validEnvironment,
          [key]: "postgresql://feedback:password@127.0.0.1:5432/feedback_board",
        }),
      ).toThrow(`${key}: Database URL must point to feedback_board_test`);
    },
  );

  it("rejects a non-test application environment", () => {
    expect(() =>
      parseE2EEnvironment({
        ...validEnvironment,
        FEEDBACK_BOARD_ENV: "dev",
      }),
    ).toThrow("FEEDBACK_BOARD_ENV");
  });

  it("rejects an auth URL that does not match the isolated web server", () => {
    expect(() =>
      parseE2EEnvironment({
        ...validEnvironment,
        BETTER_AUTH_URL: "http://localhost:3000",
      }),
    ).toThrow("BETTER_AUTH_URL");
  });
});
```

- [ ] **Step 3: Run the guard test to verify it fails**

Run:

```bash
pnpm exec vitest run e2e/environment.test.ts
```

Expected: FAIL because `e2e/environment.ts` does not exist.

- [ ] **Step 4: Implement the pure environment parser**

Create `e2e/environment.ts`:

```ts
import * as z from "zod";

export const E2E_BASE_URL = "http://127.0.0.1:3100";

function pointsToTestDatabase(value: string) {
  try {
    return (
      decodeURIComponent(new URL(value).pathname) === "/feedback_board_test"
    );
  } catch {
    return false;
  }
}

const testDatabaseUrlSchema = z
  .url({ protocol: /^postgres(ql)?$/ })
  .refine(pointsToTestDatabase, {
    error: "Database URL must point to feedback_board_test",
  });

const e2eEnvironmentSchema = z.object({
  DATABASE_URL: testDatabaseUrlSchema,
  DATABASE_URL_UNPOOLED: testDatabaseUrlSchema,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.literal(E2E_BASE_URL),
  FEEDBACK_BOARD_ENV: z.literal("test"),
});

export function parseE2EEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  const parsed = e2eEnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid E2E environment:\n${issues}`);
  }

  return parsed.data;
}
```

The error contains field names and validation messages but never prints connection strings or secrets.

- [ ] **Step 5: Run the guard test to verify it passes**

Run:

```bash
pnpm exec vitest run e2e/environment.test.ts
```

Expected: PASS with 5 tests. The parameterized database case runs once for each URL variable.

- [ ] **Step 6: Add test-environment loading and the local template**

Create `e2e/load-environment.ts`:

```ts
import nextEnv from "@next/env";
import { parseE2EEnvironment } from "./environment";

Object.assign(process.env, { NODE_ENV: "test" });
nextEnv.loadEnvConfig(process.cwd(), false);

export const e2eEnvironment = parseE2EEnvironment(process.env);
```

Create `.env.test.example`:

```dotenv
DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5432/feedback_board_test
DATABASE_URL_UNPOOLED=postgresql://<user>:<password>@127.0.0.1:5432/feedback_board_test

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://127.0.0.1:3100

FEEDBACK_BOARD_ENV=test
```

Update `.gitignore` so the testing and env sections contain:

```gitignore
# testing
/coverage
/playwright-report/
/test-results/

# env files (can opt-in for committing if needed)
.env*
!.env.example
!.env.test.example
```

Also ignore the isolated Next.js output beside the existing `.next` entry:

```gitignore
# next.js
/.next/
/.next-e2e/
/out/
```

Add the same generated directory to the global ignores in `eslint.config.mjs`:

```js
globalIgnores([
  ".next/**",
  ".next-e2e/**",
  "out/**",
  "build/**",
  "storybook-static/**",
  "next-env.d.ts",
]);
```

`loadEnvConfig()` now loads `.env.test.local` before `.env.test` and `.env`, while process variables supplied by CI keep precedence. The parser rejects any development values that fill missing test variables from `.env`.

- [ ] **Step 7: Add migration setup and Playwright configuration**

Create `e2e/global-setup.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";
import { Pool } from "pg";
import { e2eEnvironment } from "./load-environment";

export default async function globalSetup() {
  const pool = new Pool({
    connectionString: e2eEnvironment.DATABASE_URL_UNPOOLED,
    max: 1,
  });
  const database = drizzle({ client: pool });

  try {
    const result = await migrate(database, {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });

    if (result) {
      throw new Error(`Drizzle migration setup failed: ${result.exitCode}`);
    }
  } finally {
    await pool.end();
  }
}
```

The one-connection pool belongs only to the short-lived migration process. It is not the application pool deployed to Vercel.

Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  distDir: process.env.FEEDBACK_BOARD_ENV === "test" ? ".next-e2e" : ".next",
};

export default nextConfig;
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";
import { e2eEnvironment } from "./e2e/load-environment";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: e2eEnvironment.BETTER_AUTH_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    url: e2eEnvironment.BETTER_AUTH_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
```

Because the config imports `e2eEnvironment`, invalid database URLs fail during config evaluation, before Playwright can launch the Next.js server. `reuseExistingServer: false` also prevents the suite from silently attaching to a development process on port 3100.

Add the script to `package.json` after the Vitest scripts:

```json
"test:e2e": "playwright test",
```

- [ ] **Step 8: Document local E2E setup**

Create `e2e/README.md`:

````markdown
# Auth E2E tests

The browser suite uses the existing local PostgreSQL container but a separate database named `feedback_board_test`.

Create that database once:

```bash
docker compose exec postgres sh -c 'createdb --username "$POSTGRES_USER" feedback_board_test'
```

Copy the test environment template and replace its PostgreSQL credentials:

```bash
cp .env.test.example .env.test.local
openssl rand -base64 32
```

Put the generated value in `BETTER_AUTH_SECRET`. Keep `.env.test.local` untracked.

Install Chromium once, then run the suite:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The runner refuses to start unless both database URLs point to `feedback_board_test`. It applies migrations but does not create, reset, truncate, or drop the database.

The Playwright server uses `.next-e2e`, so it can run while the regular development server is active on port `3000`.
````

- [ ] **Step 9: Install Chromium and verify the harness types and safety tests**

Run:

```bash
pnpm exec playwright install chromium
pnpm exec vitest run e2e/environment.test.ts
pnpm typecheck
git diff --check
```

Expected: Chromium installs or reports an existing cached installation, all 5 environment tests pass, TypeScript exits with code 0, and Git reports no whitespace errors. Do not run Playwright until `.env.test.local` points to an existing `feedback_board_test` database.

- [ ] **Step 10: Commit the isolated harness**

```bash
git add .env.test.example .gitignore e2e/environment.ts e2e/environment.test.ts e2e/load-environment.ts e2e/global-setup.ts e2e/README.md eslint.config.mjs next.config.ts playwright.config.ts package.json pnpm-lock.yaml tsconfig.json
git commit -m "test(e2e): add isolated Playwright harness"
```

---

### Task 2: Add the session boundary and protect the dashboard

**Files:**

- Create: `e2e/auth.e2e.ts`
- Create: `src/features/auth/session.server.test.ts`
- Create: `src/features/auth/session.server.ts`
- Create: `src/app/dashboard/page.tsx`

**Interfaces:**

- Consumes: `auth.api.getSession({ headers })`, Next.js `headers()` and `redirect()`, and `buildSignInHref({ returnTo })`.
- Produces: `requireSession({ returnTo: string })`, the module's only public function, which returns the no-option `auth.api.getSession()` value narrowed to a non-null session.
- Produces: a protected `/dashboard` route whose first implementation renders only its heading.

- [ ] **Step 1: Write the failing guest-protection browser test**

Create `e2e/auth.e2e.ts`:

```ts
import { expect, test } from "@playwright/test";

test("redirects a dashboard guest to sign in", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in\?/);

  const signInUrl = new URL(page.url());
  expect(signInUrl.pathname).toBe("/sign-in");
  expect(signInUrl.searchParams.get("returnTo")).toBe("/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeVisible();
});
```

- [ ] **Step 2: Run the guest test to verify it fails**

After creating `.env.test.local` and the database as documented, run:

```bash
pnpm exec playwright test e2e/auth.e2e.ts --grep "redirects a dashboard guest"
```

Expected: FAIL because `/dashboard` still returns not-found instead of redirecting.

- [ ] **Step 3: Write the failing session-module unit tests**

Create `src/features/auth/session.server.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("react", () => ({
  cache: <Value>(value: Value) => value,
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

import { requireSession } from "./session.server";

const redirectSignal = new Error("NEXT_REDIRECT");
const requestHeaders = new Headers({ cookie: "session=test" });
const validSession = {
  session: { id: "session-id" },
  user: { id: "user-id" },
};

describe("auth session boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("reads and returns the current Better Auth session", async () => {
    mocks.getSession.mockResolvedValueOnce(validSession);

    await expect(requireSession({ returnTo: "/dashboard" })).resolves.toBe(
      validSession,
    );
    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.getSession).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects a missing session to sign in with returnTo", async () => {
    mocks.getSession.mockResolvedValueOnce(null);

    await expect(requireSession({ returnTo: "/dashboard" })).rejects.toBe(
      redirectSignal,
    );
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(
      "/sign-in?returnTo=%2Fdashboard",
    );
  });

  it("rethrows an unexpected session lookup failure", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.getSession.mockRejectedValueOnce(unexpectedError);

    await expect(requireSession({ returnTo: "/dashboard" })).rejects.toBe(
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
```

Mocking `cache()` as the identity keeps each unit test independent. Production still uses React's request memoization.

- [ ] **Step 4: Run the session test to verify it fails**

Run:

```bash
pnpm exec vitest run src/features/auth/session.server.test.ts
```

Expected: FAIL because `src/features/auth/session.server.ts` does not exist.

- [ ] **Step 5: Implement the server-only session boundary**

Create `src/features/auth/session.server.ts`:

```ts
import "server-only";

import { auth } from "@/server/auth";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildSignInHref } from "./navigation";

type RequireSessionInput = {
  returnTo: string;
};

const readCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession({ returnTo }: RequireSessionInput) {
  const session = await readCurrentSession();

  if (!session) redirect(buildSignInHref({ returnTo }));

  return session;
}
```

Do not add this module to `src/features/auth/index.ts`.

- [ ] **Step 6: Run the session tests to verify they pass**

Run:

```bash
pnpm exec vitest run src/features/auth/session.server.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 7: Add the protected placeholder page**

Create `src/app/dashboard/page.tsx`:

```tsx
import { requireSession } from "@/features/auth/session.server";

export const instant = false;

export default async function Dashboard() {
  await requireSession({ returnTo: "/dashboard" });

  return (
    <main className="flex flex-1 flex-col gap-y-6 px-5 py-6">
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>
    </main>
  );
}
```

The page deliberately checks the session itself instead of delegating security to a layout.

- [ ] **Step 8: Run focused and static verification**

Run:

```bash
pnpm exec vitest run src/features/auth/session.server.test.ts e2e/environment.test.ts
pnpm exec playwright test e2e/auth.e2e.ts --grep "redirects a dashboard guest"
pnpm lint
pnpm typecheck
git diff --check
```

Expected: 8 Vitest tests pass, the one Chromium test passes, ESLint and TypeScript exit with code 0, and Git reports no whitespace errors.

- [ ] **Step 9: Commit dashboard protection**

```bash
git add e2e/auth.e2e.ts src/features/auth/session.server.test.ts src/features/auth/session.server.ts src/app/dashboard/page.tsx
git commit -m "feat(auth): protect dashboard with session boundary"
```

---

### Task 3: Add sign-out and the complete browser lifecycle

**Files:**

- Modify: `e2e/auth.e2e.ts`
- Modify: `src/features/auth/actions.test.ts:1-221`
- Modify: `src/features/auth/actions.ts:1-88`
- Create: `src/features/auth/ui/sign-out-button.tsx`
- Modify: `src/features/auth/index.ts:1-5`
- Modify: `src/app/dashboard/page.tsx`

**Interfaces:**

- Consumes: `auth.api.signOut({ headers })`, the existing `Button`, React DOM `useFormStatus()`, and the Task 2 dashboard guard.
- Produces: `signOutAction(): Promise<never>` by successful redirect, with thrown Better Auth failures left unchanged.
- Produces: `SignOutButton()` as the pending submit control exported through `@/features/auth`.
- Produces: two passing `e2e/auth.e2e.ts` scenarios using real account, session, cookie, and redirect behavior.

- [ ] **Step 1: Add the failing complete lifecycle browser test**

Replace `e2e/auth.e2e.ts` with:

```ts
import { expect, test, type Page } from "@playwright/test";

async function expectPath(page: Page, pathname: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

async function expectDashboardReturnTo(page: Page) {
  await expectPath(page, "/sign-in");
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe("/dashboard");
}

test("redirects a dashboard guest to sign in", async ({ page }) => {
  await page.goto("/dashboard");

  await expectDashboardReturnTo(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeVisible();
});

test("completes the credential session lifecycle", async ({ page }) => {
  const email = `auth-${crypto.randomUUID()}@example.com`;
  const password = "test password 123";

  await page.goto("/sign-in?mode=create-account");

  const createAccountPanel = page.getByRole("tabpanel", {
    name: "Create account",
  });
  await createAccountPanel.getByLabel("Name").fill("Auth E2E User");
  await createAccountPanel.getByLabel("Email").fill(email);
  await createAccountPanel
    .getByLabel("Password", { exact: true })
    .fill(password);
  await createAccountPanel
    .getByRole("button", { name: "Create account" })
    .click();

  await expectPath(page, "/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  const signOutPaused = Promise.withResolvers<void>();
  const signOutRelease = Promise.withResolvers<void>();

  await page.route("**/dashboard", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    signOutPaused.resolve();
    await signOutRelease.promise;
    await route.continue();
  });

  const signOutButton = page.getByRole("button", { name: "Sign out" });
  await expect(signOutButton).toBeVisible();

  const signOutSubmission = signOutButton.click();
  await signOutPaused.promise;

  try {
    await expect(signOutButton).toBeDisabled();
    await expect(signOutButton).toHaveAttribute("aria-busy", "true");
    await expect(signOutButton).toHaveText("Sign out");
    await expect(signOutButton.locator("svg")).toBeVisible();
  } finally {
    signOutRelease.resolve();
  }

  await signOutSubmission;
  await expectPath(page, "/");

  await page.goto("/dashboard");
  await expectDashboardReturnTo(page);

  const signInPanel = page.getByRole("tabpanel", { name: "Sign in" });
  await signInPanel.getByLabel("Email").fill(email);
  await signInPanel
    .getByLabel("Password", { exact: true })
    .fill("wrong password");
  await signInPanel.getByRole("button", { name: "Sign in" }).click();

  await expect(signInPanel.getByRole("alert")).toHaveText(
    "That email and password do not match an account.",
  );
  await expect(signInPanel.getByLabel("Password", { exact: true })).toHaveValue(
    "",
  );

  await signInPanel.getByLabel("Password", { exact: true }).fill(password);
  await signInPanel.getByRole("button", { name: "Sign in" }).click();

  await expectPath(page, "/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();
});
```

The paused POST makes the pending state deterministic without adding test-only behavior to production code.

- [ ] **Step 2: Run the lifecycle test to verify it fails**

Run:

```bash
pnpm exec playwright test e2e/auth.e2e.ts --grep "completes the credential session lifecycle"
```

Expected: FAIL after registration because the protected dashboard does not contain a `Sign out` button.

- [ ] **Step 3: Extend the action test mocks and write failing sign-out tests**

Add `headers` and `signOut` to the hoisted mocks at the top of `src/features/auth/actions.test.ts`:

```ts
const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  redirect: vi.fn(),
  signInEmail: vi.fn(),
  signOut: vi.fn(),
  signUpEmail: vi.fn(),
}));
```

Add the Next.js headers mock after the hoisted values:

```ts
vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));
```

Add `signOut` to the mocked Better Auth API:

```ts
vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      signInEmail: mocks.signInEmail,
      signOut: mocks.signOut,
      signUpEmail: mocks.signUpEmail,
    },
  },
}));
```

Replace the action import with:

```ts
import { createAccountAction, signInAction, signOutAction } from "./actions";
```

Append these tests after the existing account-creation tests:

```ts
describe("signOutAction", () => {
  const requestHeaders = new Headers({ cookie: "session=test" });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signOut.mockResolvedValue({ success: true });
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("signs out the current request and redirects home", async () => {
    await expect(signOutAction()).rejects.toBe(redirectSignal);

    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("rethrows an unexpected sign-out failure without redirecting", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signOut.mockRejectedValueOnce(unexpectedError);

    await expect(signOutAction()).rejects.toBe(unexpectedError);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Run the action tests to verify the new cases fail**

Run:

```bash
pnpm exec vitest run src/features/auth/actions.test.ts
```

Expected: FAIL because `signOutAction` is not exported yet.

- [ ] **Step 5: Implement the sign-out Server Action**

Add the request API import to `src/features/auth/actions.ts`:

```ts
import { headers } from "next/headers";
```

Append the action:

```ts
export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
```

Do not catch Better Auth errors and do not call `requireSession()` from this action.

- [ ] **Step 6: Run the action tests to verify they pass**

Run:

```bash
pnpm exec vitest run src/features/auth/actions.test.ts
```

Expected: PASS with the existing 10 tests and the 2 new sign-out tests.

- [ ] **Step 7: Add the pending sign-out control**

Create `src/features/auth/ui/sign-out-button.tsx`:

```tsx
"use client";

import { Button } from "@/components/button";
import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      showSpinner={pending}
      aria-busy={pending}
    >
      Sign out
    </Button>
  );
}
```

Replace `src/features/auth/index.ts` with:

```ts
export { AuthForms } from "./ui/auth-forms";
export { AuthHeader } from "./ui/auth-header";
export { SignOutButton } from "./ui/sign-out-button";

export { createAccountAction, signInAction, signOutAction } from "./actions";
export { parseAuthNavigation, buildSignInHref } from "./navigation";
```

The barrel still does not export `session.server.ts`.

- [ ] **Step 8: Add the sign-out form to the protected page**

Replace `src/app/dashboard/page.tsx` with:

```tsx
import { SignOutButton, signOutAction } from "@/features/auth";
import { requireSession } from "@/features/auth/session.server";

export const instant = false;

export default async function Dashboard() {
  await requireSession({ returnTo: "/dashboard" });

  return (
    <main className="flex flex-1 flex-col gap-y-6 px-5 py-6">
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>

      <form action={signOutAction} className="w-full max-w-48">
        <SignOutButton />
      </form>
    </main>
  );
}
```

- [ ] **Step 9: Run focused unit and browser verification**

Run:

```bash
pnpm exec vitest run src/features/auth/actions.test.ts src/features/auth/session.server.test.ts e2e/environment.test.ts
pnpm exec playwright test e2e/auth.e2e.ts
```

Expected: all focused Vitest tests pass and Chromium reports 2 passed browser tests. The lifecycle test verifies registration, the session cookie, the sign-out pending state, cookie removal, protected-route redirect, invalid credentials, password clearing, and successful sign-in with `returnTo`.

- [ ] **Step 10: Run the full repository verification sequence**

Run each command separately and stop at the first failure:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
pnpm test:e2e
git diff --check
git status --short
```

Expected: every command exits with code 0, Playwright reports 2 passed tests, and Git status lists only the Task 3 files. Under browser network throttling, manually confirm that `Sign out` remains visible beside the spinner until navigation completes.

- [ ] **Step 11: Commit the completed auth lifecycle**

```bash
git add e2e/auth.e2e.ts src/features/auth/actions.test.ts src/features/auth/actions.ts src/features/auth/ui/sign-out-button.tsx src/features/auth/index.ts src/app/dashboard/page.tsx
git commit -m "feat(auth): complete credential session lifecycle"
```

## Completion criteria

- A guest cannot render `/dashboard` and receives a safe sign-in URL with `returnTo=/dashboard`.
- Registration creates a real Better Auth session and reaches the protected dashboard.
- Sign-out shows a stable pending state, clears the session, and redirects to `/`.
- A signed-out user cannot reopen `/dashboard` without authenticating again.
- Invalid credentials retain the existing generic message, and valid credentials honor `returnTo`.
- Session and sign-out failures propagate instead of being misclassified as guest or success states.
- Unit, build, Storybook, and real PostgreSQL browser checks all pass.
- No test command can start against the development database, and no reset or cleanup operation exists.
