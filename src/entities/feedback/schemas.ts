import * as z from "zod";

import {
  BOARD_SORTS,
  BOARD_STATUS_FILTERS,
  type BoardView,
  DEFAULT_BOARD_VIEW,
} from "./contracts";

// Anyone can type a board's address, so a value the board does not know,
// one given twice included, shows the default view instead of an error.
const boardViewSchema = z.object({
  status: z.enum(BOARD_STATUS_FILTERS).catch(DEFAULT_BOARD_VIEW.status),
  sort: z.enum(BOARD_SORTS).catch(DEFAULT_BOARD_VIEW.sort),
});

export function parseBoardView(searchParams: {
  status?: unknown;
  sort?: unknown;
}): BoardView {
  return boardViewSchema.parse(searchParams);
}

const feedbackIdSchema = z.uuid();

// Whether a value is an ID as PostgreSQL writes one. The database rejects a
// malformed value with an error rather than finding no row, so a feedback
// address that cannot name an item is answered before any query.
export function isFeedbackId(value: string) {
  return feedbackIdSchema.safeParse(value).success;
}
