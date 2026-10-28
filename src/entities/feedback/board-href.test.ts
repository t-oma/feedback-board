import { describe, expect, it } from "vitest";

import { boardHref } from "./board-href";
import { BOARD_SORTS, BOARD_STATUS_FILTERS } from "./contracts";
import { parseBoardView } from "./schemas";

describe("boardHref", () => {
  it("leaves the default view out of the address", () => {
    expect(boardHref("orbit-cli", { status: "all", sort: "new" })).toBe(
      "/p/orbit-cli",
    );
  });

  it.each([
    [{ status: "planned", sort: "new" }, "/p/orbit-cli?status=planned"],
    [{ status: "all", sort: "top" }, "/p/orbit-cli?sort=top"],
    [
      { status: "in-progress", sort: "top" },
      "/p/orbit-cli?status=in-progress&sort=top",
    ],
  ] as const)("writes %o as %s", (view, href) => {
    expect(boardHref("orbit-cli", view)).toBe(href);
  });

  const views = BOARD_STATUS_FILTERS.flatMap((status) =>
    BOARD_SORTS.map((sort) => ({ status, sort })),
  );

  it.each(views)("leads back to %o", (view) => {
    const { searchParams } = new URL(
      boardHref("orbit-cli", view),
      "https://feedback.example",
    );

    expect(parseBoardView(Object.fromEntries(searchParams))).toEqual(view);
  });
});
