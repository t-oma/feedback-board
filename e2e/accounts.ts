import { expect, type Page } from "@playwright/test";

export async function expectPath(page: Page, pathname: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

// Through the real form, so the session comes from the app rather than from a
// cookie the test sets itself. Without a `returnTo`, account creation ends on
// the form for a new board.
export async function createAccount(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/sign-in?mode=create-account");

  const panel = page.getByRole("tabpanel", { name: "Create account" });
  await panel.getByLabel("Name").fill("E2E User");
  await panel.getByLabel("Email").fill(email);
  await panel.getByLabel("Password", { exact: true }).fill(password);
  await panel.getByRole("button", { name: "Create account" }).click();

  await expectPath(page, "/dashboard/new");
}
