import { expect, type Page, test } from "@playwright/test";

import { expectPath, expectPathAndQuery } from "./accounts";
import { insertBoard, insertFeedback, insertVotes } from "./database";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Three visible items, each under another status and with other votes, and
// a hidden one that the board must neither show nor count.
async function insertBoardWithFeedback() {
  const board = await insertBoard();
  const watch = await insertFeedback(board.id, {
    title: "Watch mode that survives a failed build",
    body: "It should keep watching.",
    createdAt: daysAgo(3),
  });
  const secrets = await insertFeedback(board.id, {
    title: "Per-environment secrets",
    body: "One block per environment.",
    status: "planned",
    createdAt: daysAgo(2),
  });
  const rollback = await insertFeedback(board.id, {
    title: "Rollback to a named release",
    body: "Roll back to a tag by name.",
    status: "in_progress",
    createdAt: daysAgo(1),
  });
  await insertFeedback(board.id, {
    title: "A hidden item",
    body: "Hidden by the owner.",
    hiddenAt: new Date(),
  });
  await Promise.all([
    insertVotes(watch.id, 3),
    insertVotes(secrets.id, 1),
    insertVotes(rollback.id, 2),
  ]);

  return { board, watch };
}

function titles(page: Page) {
  return page.getByRole("heading", { level: 2 }).allTextContents();
}

function statusFilter(page: Page, name: string) {
  return page.getByRole("list", { name: "Status" }).getByRole("link", { name });
}

test("lists the board's visible feedback, newest first, with counts", async ({
  page,
}) => {
  const { board } = await insertBoardWithFeedback();

  await page.goto(`/p/${board.slug}`);

  await expect
    .poll(() => titles(page))
    .toEqual([
      "Rollback to a named release",
      "Per-environment secrets",
      "Watch mode that survives a failed build",
    ]);
  await expect(statusFilter(page, "All 3")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(statusFilter(page, "Completed 0")).toBeVisible();
  await expect(page.getByText("A hidden item")).toHaveCount(0);
});

test("sorts by votes, and narrows to one status", async ({ page }) => {
  const { board } = await insertBoardWithFeedback();
  await page.goto(`/p/${board.slug}`);

  await page
    .getByRole("list", { name: "Sort" })
    .getByRole("link", { name: "Top" })
    .click();
  await expectPathAndQuery(page, `/p/${board.slug}?sort=top`);
  await expect
    .poll(() => titles(page))
    .toEqual([
      "Watch mode that survives a failed build",
      "Rollback to a named release",
      "Per-environment secrets",
    ]);

  await statusFilter(page, "Planned 1").click();
  await expectPathAndQuery(page, `/p/${board.slug}?status=planned&sort=top`);
  await expect.poll(() => titles(page)).toEqual(["Per-environment secrets"]);
});

test("says when a status has nothing, and resets to the bare board", async ({
  page,
}) => {
  const { board } = await insertBoardWithFeedback();
  await page.goto(`/p/${board.slug}`);

  await statusFilter(page, "Completed 0").click();
  await expectPathAndQuery(page, `/p/${board.slug}?status=completed`);
  await expect(
    page.getByRole("heading", { name: "Nothing matches this filter" }),
  ).toBeVisible();
  await expect(
    page.getByText("There are 3 items on the board under other statuses."),
  ).toBeVisible();

  await page.getByRole("link", { name: "Reset filters" }).click();
  await expectPathAndQuery(page, `/p/${board.slug}`);
  await expect.poll(() => titles(page)).toHaveLength(3);
});

test("opens an item from its row", async ({ page }) => {
  const { board, watch } = await insertBoardWithFeedback();
  await page.goto(`/p/${board.slug}`);

  await page.getByRole("link", { name: watch.title }).click();

  await expectPath(page, `/p/${board.slug}/feedback/${watch.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: watch.title }),
  ).toBeVisible();
});

test("shows every status for a status the board does not know", async ({
  page,
}) => {
  const { board } = await insertBoardWithFeedback();

  await page.goto(`/p/${board.slug}?status=done&sort=votes`);

  await expect(statusFilter(page, "All 3")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect.poll(() => titles(page)).toHaveLength(3);
});
