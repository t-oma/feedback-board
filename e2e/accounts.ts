import { expect, type Page } from "@playwright/test";

export async function expectPath(page: Page, pathname: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(pathname);
}

export async function expectPathAndQuery(page: Page, pathAndQuery: string) {
  await expect
    .poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}`;
    })
    .toBe(pathAndQuery);
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

// Through the real form on `/dashboard/new`, where `createAccount` ends.
export async function createBoard(page: Page, slug: string) {
  await page.getByRole("textbox", { name: "Product name" }).fill("Orbit CLI");
  await page.getByRole("textbox", { name: "Public address" }).fill(slug);
  await page.getByRole("button", { name: "Create board" }).click();

  await expectPath(page, "/dashboard");
}

// Through the account menu in the header, as a visitor signs out.
export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
}

// Where signing out of a protected page ends: the proxy asks to sign in again
// and keeps the page as the way back.
export function signInAgainHref(returnTo: string) {
  return `/sign-in?${new URLSearchParams({ returnTo })}`;
}
