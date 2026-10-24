import { expect, type Page, test } from "@playwright/test";

import {
  createAccount,
  expectPath,
  expectPathAndQuery,
  signInAgainHref,
  signOut,
} from "./accounts";

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
  await expect(page).toHaveTitle("Sign in · Feedback Board");
});

test("completes the credential session lifecycle", async ({ page }) => {
  const email = `auth-${crypto.randomUUID()}@example.com`;
  const password = "test password 123";

  await createAccount(page, email, password);
  await expect(
    page.getByRole("heading", { level: 1, name: "Create your board" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Create your board · Feedback Board");

  const signOutPaused: PromiseWithResolvers<void> = Promise.withResolvers();
  const signOutRelease: PromiseWithResolvers<void> = Promise.withResolvers();

  await page.route("**/dashboard/new", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    signOutPaused.resolve();
    await signOutRelease.promise;
    await route.continue();
  });

  await page.getByRole("button", { name: "Account" }).click();
  // Its name changes while the action runs.
  const signOutItem = page.getByRole("menuitem", { name: /^Sign(ing)? out/ });

  const signOutSubmission = signOutItem.click();
  await signOutPaused.promise;

  try {
    // What only a real submission can show: `useFormStatus` is wired, so the
    // item reads the pending state. What that state looks like is the item's
    // own contract and is asserted in its `StaysOpenWhilePending` story.
    await expect(signOutItem).toHaveText("Signing out…");
    await expect(signOutItem).toHaveAttribute("aria-busy", "true");
  } finally {
    signOutRelease.resolve();
  }

  await signOutSubmission;
  await expectPathAndQuery(page, signInAgainHref("/dashboard/new"));

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
    page.getByRole("heading", { level: 1, name: "You don’t have a board yet" }),
  ).toBeVisible();
});

// The tab still shows a dashboard page after the session ended elsewhere. Its
// sign-out is a POST to that page, which the proxy must leave to the action
// instead of sending it to sign in like a page request.
test("signs out from a tab whose session has already ended", async ({
  page,
  context,
}) => {
  await createAccount(
    page,
    `ended-${crypto.randomUUID()}@example.com`,
    "test password 123",
  );
  await context.clearCookies();

  await signOut(page);

  await expectPathAndQuery(page, signInAgainHref("/dashboard/new"));
});

test("sends a signed-in visitor past sign-in", async ({ page }) => {
  const target = "/dashboard?tab=planned&sort=top";

  await createAccount(
    page,
    `signed-in-${crypto.randomUUID()}@example.com`,
    "test password 123",
  );

  // Account creation is the mode that matters most: its form would switch
  // the visitor to a new user.
  await page.goto("/sign-in?mode=create-account");
  await expectPath(page, "/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: "You don’t have a board yet" }),
  ).toBeVisible();

  await page.goto(`/sign-in?${new URLSearchParams({ returnTo: target })}`);
  await expectPathAndQuery(page, target);
});

// The cookie comes from the app, and the session behind it ends the way the
// app ends one: the second context holds a copy, and signing out in the first
// deletes the session. The dashboard rejects that cookie mid-render and sends
// it to sign in, and the proxy must show it the form rather than send it back.
test("shows sign-in to a cookie whose session has ended", async ({
  browser,
  context,
  page,
}) => {
  await createAccount(
    page,
    `stale-${crypto.randomUUID()}@example.com`,
    "test password 123",
  );
  const staleContext = await browser.newContext({
    storageState: await context.storageState(),
  });

  try {
    await signOut(page);
    await expectPathAndQuery(page, signInAgainHref("/dashboard/new"));

    const stalePage = await staleContext.newPage();
    await stalePage.goto("/dashboard");

    await expectDashboardReturnTo(stalePage);
    await expect(
      stalePage.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeVisible();
    // Better Auth expires a cookie it finds no session behind, and the
    // browser only drops it if the proxy passed that on. The same path
    // carries a cookie the lookup refreshes.
    expect(
      (await staleContext.cookies()).map((cookie) => cookie.name),
    ).not.toContain("better-auth.session_token");
  } finally {
    await staleContext.close();
  }
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
  await signOut(page);
  await expectPathAndQuery(page, signInAgainHref("/dashboard/new"));

  await page.goto(target);
  await expectPath(page, "/sign-in");
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe(target);

  const signInPanel = page.getByRole("tabpanel", { name: "Sign in" });
  await signInPanel.getByLabel("Email").fill(email);
  await signInPanel.getByLabel("Password", { exact: true }).fill(password);
  await signInPanel.getByRole("button", { name: "Sign in" }).click();

  await expectPathAndQuery(page, target);
});

test("leaves authentication after switching modes and remains a guest", async ({
  page,
}) => {
  await page.goto("/sign-in?returnTo=%2Fdashboard");

  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page).toHaveURL(/mode=create-account/);
  await page.getByRole("link", { name: "Back to Feedback Board" }).click();

  await expectPath(page, "/");

  await page.goto("/dashboard");
  await expectDashboardReturnTo(page);
});

test("goes back to the page before sign-in after switching modes", async ({
  page,
}) => {
  await page.goto("/");
  await page.goto("/sign-in?returnTo=%2Fdashboard");

  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page).toHaveURL(/mode=create-account/);
  await page.getByRole("tab", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/mode=create-account/);

  await page.goBack();
  await expectPath(page, "/");
});

test("preserves the public exit destination through auth mode switches", async ({
  page,
}) => {
  const returnTo = "/p/orbit-cli?sort=top#vote";
  const query = new URLSearchParams({ returnTo, intent: "feedback" });
  await page.goto(`/sign-in?${query}`);

  const exitLink = page.getByRole("link", { name: "Back to orbit-cli" });
  await expect(exitLink).toHaveAttribute("href", returnTo);

  const email = "visitor@example.com";
  await page
    .getByRole("tabpanel", { name: "Sign in" })
    .getByLabel("Email")
    .fill(email);

  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page).toHaveURL(/mode=create-account/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Create an account" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Your name is shown next to anything you post. Nothing else is public.",
    ),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get("intent")).toBe("feedback");
  await expect(exitLink).toHaveAttribute("href", returnTo);
  await expect(
    page.getByRole("tabpanel", { name: "Create account" }).getByLabel("Email"),
  ).toHaveValue(email);

  await page.getByRole("tab", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/mode=create-account/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeVisible();
  await expect(page.getByText("Sign in to add feedback.")).toBeVisible();
  expect(new URL(page.url()).searchParams.get("intent")).toBe("feedback");
  await expect(exitLink).toHaveAttribute("href", returnTo);
  await expect(
    page.getByRole("tabpanel", { name: "Sign in" }).getByLabel("Email"),
  ).toHaveValue(email);
});
