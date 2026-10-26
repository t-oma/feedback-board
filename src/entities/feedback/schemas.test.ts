import { describe, expect, it } from "vitest";

import { isFeedbackId, parseBoardView } from "./schemas";

describe("parseBoardView", () => {
  it("shows all feedback, newest first, for a bare address", () => {
    expect(parseBoardView({})).toEqual({ status: "all", sort: "new" });
  });

  it.each(["all", "open", "planned", "in-progress", "completed"])(
    "keeps the status %s",
    (status) => {
      expect(parseBoardView({ status })).toEqual({ status, sort: "new" });
    },
  );

  it.each(["new", "top"])("keeps the sort %s", (sort) => {
    expect(parseBoardView({ sort })).toEqual({ status: "all", sort });
  });

  it.each(["", "done", "in_progress", "Open", ["open"], ["open", "planned"]])(
    "shows every status for %j",
    (status) => {
      expect(parseBoardView({ status, sort: "top" })).toEqual({
        status: "all",
        sort: "top",
      });
    },
  );

  it.each(["", "votes", "Top", ["top"]])(
    "sorts newest first for %j",
    (sort) => {
      expect(parseBoardView({ status: "planned", sort })).toEqual({
        status: "planned",
        sort: "new",
      });
    },
  );
});

describe("isFeedbackId", () => {
  it("accepts an ID as PostgreSQL generates one", () => {
    expect(isFeedbackId("019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b")).toBe(true);
  });

  it.each([
    "",
    "not-a-uuid",
    "019a1b2c3d4e7f809a1b2c3d4e5f6a7b",
    "{019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b}",
    "019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b0",
  ])("rejects %j", (value) => {
    expect(isFeedbackId(value)).toBe(false);
  });
});
