import { describe, expect, it } from "vitest";

import { formatLongDate, formatShortDate } from "./format-date";

// Both ends of one day in UTC. Anywhere else, one of them falls on another
// local day, so a date formatted in the local time zone fails here.
const startOfDay = new Date("2026-08-14T00:30:00Z");
const endOfDay = new Date("2026-08-14T23:30:00Z");

describe("formatShortDate", () => {
  it.each([startOfDay, endOfDay])("writes %s as its day in UTC", (date) => {
    expect(formatShortDate(date)).toBe("14 Aug 2026");
  });
});

describe("formatLongDate", () => {
  it.each([startOfDay, endOfDay])("writes %s as its day in UTC", (date) => {
    expect(formatLongDate(date)).toBe("14 August 2026");
  });
});
