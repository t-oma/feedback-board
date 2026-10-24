import { expect, test } from "@playwright/test";

import {
  createAccount,
  createBoard,
  expectPath,
  expectPathAndQuery,
  signInAgainHref,
  signOut,
} from "./accounts";

const password = "test password 123";

test("keeps a visitor on the board through signing out and in", async ({
  page,
}) => {
  const email = `header-${crypto.randomUUID()}@example.com`;
  // A UUID is a valid address that no other run claims.
  const slug = crypto.randomUUID();
  const board = `/p/${slug}`;

  await createAccount(page, email, password);
  await createBoard(page, slug);
  await page.goto(board);

  await signOut(page);
  await expectPath(page, board);

  const header = page.getByRole("banner");
  const signIn = header.getByRole("link", { name: "Sign in" });
  await expect(signIn).toHaveAttribute(
    "href",
    `/sign-in?${new URLSearchParams({ returnTo: board })}`,
  );
  await signIn.click();

  const panel = page.getByRole("tabpanel", { name: "Sign in" });
  await panel.getByLabel("Email").fill(email);
  await panel.getByLabel("Password", { exact: true }).fill(password);
  await panel.getByRole("button", { name: "Sign in" }).click();

  await expectPath(page, board);
  await header.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Dashboard" }).click();

  await expectPath(page, "/dashboard");
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("asks a visitor who signs out of the dashboard to sign in", async ({
  page,
}) => {
  await createAccount(
    page,
    `header-${crypto.randomUUID()}@example.com`,
    password,
  );
  await page.goto("/dashboard");

  await signOut(page);

  await expectPathAndQuery(page, signInAgainHref("/dashboard"));
});
