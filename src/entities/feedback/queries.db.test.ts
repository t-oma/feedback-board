import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { db } from "@/server/db";
import {
  insertTestBoard,
  insertTestFeedback,
  insertTestVotes,
} from "@/server/db/feedback.testing";
import { feedbacks } from "@/server/db/schema/feedbacks";
import { insertTestUser } from "@/server/db/users.testing";

import {
  BOARD_FEEDBACK_LIMIT,
  getBoardFeedback,
  getBoardStatusCounts,
  getVisibleFeedback,
} from "./queries.server";

const newest = { status: "all", sort: "new" } as const;
const top = { status: "all", sort: "top" } as const;

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function titles(rows: { title: string }[]) {
  return rows.map(({ title }) => title);
}

describe("getBoardFeedback", () => {
  it("lists the board's visible feedback with its author and votes", async () => {
    const board = await insertTestBoard();
    const author = await insertTestUser();
    const item = await insertTestFeedback({
      productId: board.id,
      authorId: author.id,
      title: "Visible",
    });
    await insertTestVotes(item.id, 2);
    await insertTestFeedback({
      productId: board.id,
      title: "Hidden",
      hiddenAt: daysAgo(1),
    });
    const otherBoard = await insertTestBoard();
    await insertTestFeedback({ productId: otherBoard.id, title: "Elsewhere" });

    await expect(getBoardFeedback(board.id, newest)).resolves.toEqual([
      {
        id: item.id,
        title: "Visible",
        body: item.body,
        status: "open",
        createdAt: item.createdAt,
        authorName: author.name,
        voteCount: 2,
      },
    ]);
  });

  it.each([newest, top])(
    "keeps an item without votes, at zero, under %o",
    async (view) => {
      const board = await insertTestBoard();
      const voted = await insertTestFeedback({ productId: board.id });
      await insertTestVotes(voted.id, 1);
      const unvoted = await insertTestFeedback({ productId: board.id });

      const rows = await getBoardFeedback(board.id, view);

      expect(rows).toContainEqual(
        expect.objectContaining({ id: unvoted.id, voteCount: 0 }),
      );
      expect(rows).toHaveLength(2);
    },
  );

  it("puts the newest first, and the greater ID first at the same moment", async () => {
    const board = await insertTestBoard();
    const moment = daysAgo(2);
    await insertTestFeedback({
      productId: board.id,
      title: "Oldest",
      createdAt: daysAgo(3),
    });
    const tied = [
      await insertTestFeedback({ productId: board.id, createdAt: moment }),
      await insertTestFeedback({ productId: board.id, createdAt: moment }),
    ];
    await insertTestFeedback({
      productId: board.id,
      title: "Newest",
      createdAt: daysAgo(1),
    });

    const rows = await getBoardFeedback(board.id, newest);

    const tiedByIdDescending = tied
      .map(({ id }) => id)
      .sort()
      .reverse();
    expect(rows.map(({ id }) => id).slice(1, 3)).toEqual(tiedByIdDescending);
    expect(titles(rows)[0]).toBe("Newest");
    expect(titles(rows)[3]).toBe("Oldest");
  });

  it("puts the most votes first, then the newest", async () => {
    const board = await insertTestBoard();
    const most = await insertTestFeedback({
      productId: board.id,
      title: "Most votes",
      createdAt: daysAgo(4),
    });
    await insertTestVotes(most.id, 3);
    const older = await insertTestFeedback({
      productId: board.id,
      title: "Two votes, older",
      createdAt: daysAgo(3),
    });
    await insertTestVotes(older.id, 2);
    const newer = await insertTestFeedback({
      productId: board.id,
      title: "Two votes, newer",
      createdAt: daysAgo(2),
    });
    await insertTestVotes(newer.id, 2);
    await insertTestFeedback({
      productId: board.id,
      title: "No votes, newest",
      createdAt: daysAgo(1),
    });

    await expect(getBoardFeedback(board.id, top).then(titles)).resolves.toEqual(
      [
        "Most votes",
        "Two votes, newer",
        "Two votes, older",
        "No votes, newest",
      ],
    );
  });

  it("narrows the list to one status, as the address spells it", async () => {
    const board = await insertTestBoard();
    await insertTestFeedback({ productId: board.id, title: "Open" });
    await insertTestFeedback({
      productId: board.id,
      title: "In progress",
      status: "in_progress",
    });

    await expect(
      getBoardFeedback(board.id, { status: "in-progress", sort: "new" }).then(
        titles,
      ),
    ).resolves.toEqual(["In progress"]);
  });

  it(`returns at most ${String(BOARD_FEEDBACK_LIMIT)} items`, async () => {
    const board = await insertTestBoard();
    const author = await insertTestUser();
    await db.insert(feedbacks).values(
      Array.from({ length: BOARD_FEEDBACK_LIMIT + 1 }, (_, index) => ({
        productId: board.id,
        authorId: author.id,
        title: `Item ${String(index)}`,
        body: "One of many.",
      })),
    );

    await expect(getBoardFeedback(board.id, newest)).resolves.toHaveLength(
      BOARD_FEEDBACK_LIMIT,
    );
  });
});

describe("getBoardStatusCounts", () => {
  it("counts the board's visible feedback per status and in all", async () => {
    const board = await insertTestBoard();
    await insertTestFeedback({ productId: board.id });
    await insertTestFeedback({ productId: board.id });
    await insertTestFeedback({ productId: board.id, status: "in_progress" });
    await insertTestFeedback({
      productId: board.id,
      status: "planned",
      hiddenAt: daysAgo(1),
    });
    const otherBoard = await insertTestBoard();
    await insertTestFeedback({ productId: otherBoard.id });

    await expect(getBoardStatusCounts(board.id)).resolves.toEqual({
      all: 3,
      open: 2,
      planned: 0,
      "in-progress": 1,
      completed: 0,
    });
  });
});

describe("getVisibleFeedback", () => {
  it("finds a visible item of the board with its author and votes", async () => {
    const board = await insertTestBoard();
    const author = await insertTestUser();
    const item = await insertTestFeedback({
      productId: board.id,
      authorId: author.id,
      status: "completed",
      completedAt: daysAgo(1),
    });
    await insertTestVotes(item.id, 1);

    await expect(getVisibleFeedback(board.id, item.id)).resolves.toEqual({
      id: item.id,
      title: item.title,
      body: item.body,
      status: "completed",
      createdAt: item.createdAt,
      authorName: author.name,
      voteCount: 1,
    });
  });

  it("finds nothing for a hidden item", async () => {
    const board = await insertTestBoard();
    const item = await insertTestFeedback({
      productId: board.id,
      hiddenAt: daysAgo(1),
    });

    await expect(getVisibleFeedback(board.id, item.id)).resolves.toBeNull();
  });

  it("finds nothing for an item of another board", async () => {
    const [board, otherBoard] = await Promise.all([
      insertTestBoard(),
      insertTestBoard(),
    ]);
    const item = await insertTestFeedback({ productId: otherBoard.id });

    await expect(getVisibleFeedback(board.id, item.id)).resolves.toBeNull();
  });

  it("answers a value that is not an ID without a query", async () => {
    const board = await insertTestBoard();
    const select = vi.spyOn(db, "select");
    try {
      await expect(
        getVisibleFeedback(board.id, "not-a-uuid"),
      ).resolves.toBeNull();
      expect(select).not.toHaveBeenCalled();
    } finally {
      select.mockRestore();
    }
  });
});
