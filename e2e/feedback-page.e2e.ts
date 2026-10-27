import { expect, type Page, test } from "@playwright/test";

import { expectPathAndQuery } from "./accounts";
import { insertBoard, insertFeedback } from "./database";

const item = {
  title: "Watch mode that survives a failed build",
  body: "Right now a syntax error kills the watcher.\n\nIt should keep watching.",
};

// The page has started streaming by the time it knows there is no such item,
// so the status stays 200 and the page asks not to be indexed.
async function expectNotFound(page: Page, path: string) {
  const response = await page.goto(path);

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "This page doesn’t exist" }),
  ).toBeVisible();
  await expect(
    page.locator('meta[name="robots"][content="noindex"]').first(),
  ).toBeAttached();
  await expect(page).toHaveTitle("Page not found · Feedback Board");
}

test("shows an item on its own page and leads back to the bare board", async ({
  page,
}) => {
  const board = await insertBoard();
  const feedback = await insertFeedback(board.id, {
    ...item,
    status: "planned",
  });

  await page.goto(`/p/${board.slug}/feedback/${feedback.id}`);

  await expect(
    page.getByRole("heading", { level: 1, name: item.title }),
  ).toBeVisible();
  await expect(page).toHaveTitle(`${item.title} · Feedback Board`);
  await expect(page.getByText("Planned", { exact: true })).toBeVisible();
  await expect(
    page.getByText(feedback.authorName, { exact: false }),
  ).toBeVisible();
  await expect(page.getByText(/^Right now a syntax error/)).toBeVisible();

  await page.getByRole("link", { name: `Back to ${board.name}` }).click();
  await expectPathAndQuery(page, `/p/${board.slug}`);
});

test("answers a hidden item with the not-found page", async ({ page }) => {
  const board = await insertBoard();
  const hidden = await insertFeedback(board.id, {
    ...item,
    hiddenAt: new Date(),
  });

  await expectNotFound(page, `/p/${board.slug}/feedback/${hidden.id}`);
});

test("answers another board's item with the not-found page", async ({
  page,
}) => {
  const [board, otherBoard] = await Promise.all([insertBoard(), insertBoard()]);
  const elsewhere = await insertFeedback(otherBoard.id, item);

  await expectNotFound(page, `/p/${board.slug}/feedback/${elsewhere.id}`);
});

test("answers a value that is not an ID with the not-found page", async ({
  page,
}) => {
  const board = await insertBoard();

  await expectNotFound(page, `/p/${board.slug}/feedback/not-a-uuid`);
});
