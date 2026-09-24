import { expect, type Page, test } from "@playwright/test";

async function expectPath(page: Page, pathname: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

async function expectDashboardReturnTo(page: Page) {
  await expectPath(page, "/sign-in");
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe("/dashboard");
}

async function createAccount(page: Page, email: string, password: string) {
  await page.goto("/sign-in?mode=create-account");

  const panel = page.getByRole("tabpanel", { name: "Create account" });
  await panel.getByLabel("Name").fill("Auth E2E User");
  await panel.getByLabel("Email").fill(email);
  await panel.getByLabel("Password", { exact: true }).fill(password);
  await panel.getByRole("button", { name: "Create account" }).click();

  await expectPath(page, "/dashboard");
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

  await createAccount(page, email, password);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  const signOutPaused: PromiseWithResolvers<void> = Promise.withResolvers();
  const signOutRelease: PromiseWithResolvers<void> = Promise.withResolvers();

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
    // What only a real submission can show: `useFormStatus` is wired, so the
    // button reads the pending state. What that state looks like is the
    // Button's own contract and is asserted in its `Pending` story.
    await expect(signOutButton).toBeDisabled();
    await expect(signOutButton).toHaveAttribute("aria-busy", "true");
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

test("returns a guest to the exact view they asked for", async ({ page }) => {
  const email = `return-to-${crypto.randomUUID()}@example.com`;
  const password = "test password 123";
  // A guest arriving at a filtered view should be handed that view back, not
  // the bare route. `/dashboard` reads no search params yet, so what this
  // pins down is the round trip itself: the proxy puts the query into
  // `returnTo`, and the sign-in action redirects to it unchanged.
  const target = "/dashboard?tab=planned&sort=top";

  await createAccount(page, email, password);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expectPath(page, "/");

  await page.goto(target);
  await expectPath(page, "/sign-in");
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe(target);

  const signInPanel = page.getByRole("tabpanel", { name: "Sign in" });
  await signInPanel.getByLabel("Email").fill(email);
  await signInPanel.getByLabel("Password", { exact: true }).fill(password);
  await signInPanel.getByRole("button", { name: "Sign in" }).click();

  await expect
    .poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}`;
    })
    .toBe(target);
});
