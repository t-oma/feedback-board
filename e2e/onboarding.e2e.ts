import { expect, type Page, test } from "@playwright/test";

import { E2E_BASE_URL } from "../test/environment";
import { createAccount } from "./accounts";

// The onboarding form is laid out for phones, so the journey runs at a
// phone's width, with the submit button stuck to the bottom of the screen.
test.use({ viewport: { width: 390, height: 844 } });

const board = {
  name: "Orbit CLI",
  description: "Tell us what is missing.",
};

async function signUp(page: Page) {
  await createAccount(
    page,
    `onboarding-${crypto.randomUUID()}@example.com`,
    "test password 123",
  );
}

function boardFields(page: Page) {
  return {
    name: page.getByRole("textbox", { name: "Product name" }),
    address: page.getByRole("textbox", { name: "Public address" }),
    description: page.getByRole("textbox", { name: "Description optional" }),
  };
}

// A UUID is lowercase hexadecimal groups joined by single hyphens, so it is a
// valid address that no other run claims.
function uniqueSlug() {
  return crypto.randomUUID();
}

async function fillBoard(page: Page, slug: string) {
  const { name, address, description } = boardFields(page);
  await name.fill(board.name);
  await address.fill(slug);
  await description.fill(board.description);
}

async function expectBoardKept(page: Page, slug: string) {
  const { name, address, description } = boardFields(page);
  await expect(name).toHaveValue(board.name);
  await expect(address).toHaveValue(slug);
  await expect(description).toHaveValue(board.description);
}

test("creates the owner's board from the dashboard", async ({ page }) => {
  await signUp(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Create your board" }),
  ).toBeVisible();

  const { name, address } = boardFields(page);
  await name.fill(board.name);
  await expect(address).toHaveValue("orbit-cli");

  const slug = uniqueSlug();
  await fillBoard(page, slug);
  await page.getByRole("button", { name: "Create board" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: board.name }),
  ).toBeVisible();
  const notice = page
    .getByRole("status")
    .filter({ hasText: "Your board is live" });
  await expect(notice).toBeFocused();
  await expect(
    page.getByText(`${new URL(E2E_BASE_URL).host}/p/${slug}`),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "No feedback yet" }),
  ).toBeVisible();

  // The notice belongs to the visit that created the board.
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: board.name }),
  ).toBeVisible();
  await expect(notice).toHaveCount(0);
});

test("keeps what was typed when the address is taken", async ({
  browser,
  page,
}) => {
  const slug = uniqueSlug();

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signUp(otherPage);
  await fillBoard(otherPage, slug);
  await otherPage.getByRole("button", { name: "Create board" }).click();
  await expect(
    otherPage.getByRole("heading", { level: 1, name: board.name }),
  ).toBeVisible();
  await otherContext.close();

  await signUp(page);
  await fillBoard(page, slug);
  await page.getByRole("button", { name: "Create board" }).click();

  await expect(
    page.getByText("This slug is already taken. Choose another one."),
  ).toBeVisible();
  await expectBoardKept(page, slug);
  await expect(boardFields(page).address).toBeFocused();
});

// The session can end in another tab while this one still shows the form.
test("keeps what was typed when the session ended before the submit", async ({
  page,
  context,
}) => {
  await signUp(page);
  const slug = uniqueSlug();
  await fillBoard(page, slug);
  await context.clearCookies();

  await page.getByRole("button", { name: "Create board" }).click();

  // Next.js's route announcer is an alert too, so the banner is found by text.
  await expect(
    page.getByRole("alert").filter({ hasText: "Your session has ended." }),
  ).toBeFocused();
  await expectBoardKept(page, slug);
  await expect(
    page.getByRole("link", { name: "Sign in again" }),
  ).toHaveAttribute("href", "/sign-in?returnTo=%2Fdashboard");
});
