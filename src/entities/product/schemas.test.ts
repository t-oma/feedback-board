import { describe, expect, it } from "vitest";

import {
  normalizeProductDescription,
  normalizeProductName,
  normalizeProductSlug,
  suggestProductSlug,
} from "./schemas";

describe("normalizeProductName", () => {
  it("trims the name and collapses whitespace inside it", () => {
    expect(normalizeProductName("  Orbit \t  CLI \n ")).toBe("Orbit CLI");
  });
});

describe("normalizeProductDescription", () => {
  it("turns CRLF and lone CR into LF and trims the outer whitespace", () => {
    expect(normalizeProductDescription(" \r\nOne\r\nTwo\rThree\r\n ")).toBe(
      "One\nTwo\nThree",
    );
  });

  it("keeps blank lines inside the text", () => {
    expect(normalizeProductDescription("One\n\nTwo")).toBe("One\n\nTwo");
  });
});

describe("normalizeProductSlug", () => {
  it.each([
    ["Orbit CLI!", "orbit-cli"],
    ["  my_app  ", "my-app"],
    ["--Orbit -- CLI--", "orbit-cli"],
    ["a__b", "a-b"],
    ["next.js", "nextjs"],
    ["Café Noir", "caf-noir"],
    ["Орбіта", ""],
  ])("normalizes %j to %j", (value, expected) => {
    expect(normalizeProductSlug(value)).toBe(expected);
  });
});

describe("suggestProductSlug", () => {
  it("suggests the normalized name", () => {
    expect(suggestProductSlug("Orbit CLI")).toBe("orbit-cli");
  });

  it("cuts a long name to the 48 characters an address may have", () => {
    expect(suggestProductSlug("a".repeat(80))).toBe("a".repeat(48));
  });

  it("drops the hyphen a cut leaves at the end", () => {
    expect(suggestProductSlug(`${"a".repeat(47)} b`)).toBe("a".repeat(47));
  });
});
