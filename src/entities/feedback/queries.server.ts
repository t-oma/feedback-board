import "server-only";

import { and, count, desc, eq, isNull, type SQL } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth";
import { feedbacks } from "@/server/db/schema/feedbacks";
import { votes } from "@/server/db/schema/votes";

import {
  type BoardStatusFilter,
  type BoardView,
  FEEDBACK_STATUS_BY_FILTER,
} from "./contracts";
import { isFeedbackId } from "./schemas";

// Pagination is not built yet. The bound keeps any one list query finite, and
// a board that reaches it is the sign that pagination is due.
export const BOARD_FEEDBACK_LIMIT = 100;

// Counting the vote's user rather than every row gives an item without votes
// zero: the left join still yields one row for it, with no user.
const voteCount = count(votes.userId);

function isVisibleOn(productId: string) {
  return and(eq(feedbacks.productId, productId), isNull(feedbacks.hiddenAt));
}

function selectFeedback(where: SQL | undefined) {
  return db
    .select({
      id: feedbacks.id,
      title: feedbacks.title,
      body: feedbacks.body,
      status: feedbacks.status,
      createdAt: feedbacks.createdAt,
      authorName: users.name,
      voteCount,
    })
    .from(feedbacks)
    .innerJoin(users, eq(users.id, feedbacks.authorId))
    .leftJoin(votes, eq(votes.feedbackId, feedbacks.id))
    .where(where)
    .groupBy(feedbacks.id, users.id);
}

export async function getBoardStatusCounts(
  productId: string,
): Promise<Record<BoardStatusFilter, number>> {
  const rows = await db
    .select({ status: feedbacks.status, count: count() })
    .from(feedbacks)
    .where(isVisibleOn(productId))
    .groupBy(feedbacks.status);

  function countOf(filter: BoardStatusFilter) {
    const status = FEEDBACK_STATUS_BY_FILTER[filter];

    return rows
      .filter((row) => status === null || row.status === status)
      .reduce((sum, row) => sum + row.count, 0);
  }

  return {
    all: countOf("all"),
    open: countOf("open"),
    planned: countOf("planned"),
    "in-progress": countOf("in-progress"),
    completed: countOf("completed"),
  };
}

export async function getBoardFeedback(
  productId: string,
  { status, sort }: BoardView,
) {
  const storedStatus = FEEDBACK_STATUS_BY_FILTER[status];
  const newestFirst = [desc(feedbacks.createdAt), desc(feedbacks.id)];

  return selectFeedback(
    and(
      isVisibleOn(productId),
      storedStatus === null ? undefined : eq(feedbacks.status, storedStatus),
    ),
  )
    .orderBy(
      ...(sort === "top" ? [desc(voteCount), ...newestFirst] : newestFirst),
    )
    .limit(BOARD_FEEDBACK_LIMIT);
}

// One query per request, for the page and its metadata alike. A value that
// cannot be an ID names no item, so it is answered without one.
export const getVisibleFeedback = cache(
  async (productId: string, feedbackId: string) => {
    if (!isFeedbackId(feedbackId)) return null;

    const [feedback] = await selectFeedback(
      and(isVisibleOn(productId), eq(feedbacks.id, feedbackId)),
    );

    return feedback ?? null;
  },
);
