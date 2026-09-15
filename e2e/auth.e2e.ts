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
