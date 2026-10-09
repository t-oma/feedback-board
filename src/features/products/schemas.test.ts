import { describe, expect, it } from "vitest";
import * as z from "zod";

import {
  type CreateProductInput,
  createProductSchema,
  normalizeProductDescription,
  normalizeProductName,
  normalizeProductSlug,
  suggestProductSlug,
} from "./schemas";

const validInput = {
  name: "Orbit CLI",
  slug: "orbit-cli",
  description: "",
};

function fieldErrorsFor(
  input: Partial<Record<keyof CreateProductInput, unknown>>,
) {
  const result = createProductSchema.safeParse({ ...validInput, ...input });

  if (result.success) return {};
  return z.flattenError(result.error).fieldErrors;
}

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

describe("createProductSchema", () => {
  it("returns the normalized values", () => {
    expect(
      createProductSchema.parse({
        name: "  Orbit   CLI ",
        slug: "Orbit CLI!",
        description: " Tell us\r\nwhat is missing. ",
      }),
    ).toEqual({
      name: "Orbit CLI",
      slug: "orbit-cli",
      description: "Tell us\nwhat is missing.",
    });
  });

  it.each(["", "   "])("asks for a name when it is %j", (name) => {
    expect(fieldErrorsFor({ name })).toEqual({
      name: ["Enter a product name"],
    });
  });

  it.each([
    [1, { name: ["Use at least 2 characters"] }],
    [2, {}],
    [80, {}],
    [81, { name: ["Remove 1 character"] }],
    [83, { name: ["Remove 3 characters"] }],
  ])("checks a name with %i characters", (length, expected) => {
    expect(fieldErrorsFor({ name: "a".repeat(length) })).toEqual(expected);
  });

  it("counts the name after collapsing its whitespace", () => {
    expect(
      fieldErrorsFor({ name: `a${" ".repeat(10)}${"b".repeat(78)}` }),
    ).toEqual({});
  });

  it.each(["", "Орбіта", "!!!"])(
    "asks for Latin characters when the address %j normalizes to nothing",
    (slug) => {
      expect(fieldErrorsFor({ slug })).toEqual({
        slug: ["Use Latin letters, numbers and hyphens"],
      });
    },
  );

  it.each([
    [2, { slug: ["Use at least 3 characters"] }],
    [3, {}],
    [48, {}],
    [49, { slug: ["Remove 1 character"] }],
  ])("checks an address with %i characters", (length, expected) => {
    expect(fieldErrorsFor({ slug: "a".repeat(length) })).toEqual(expected);
  });

  it.each([
    [500, {}],
    [501, { description: ["Remove 1 character"] }],
  ])("checks a description with %i characters", (length, expected) => {
    expect(fieldErrorsFor({ description: "a".repeat(length) })).toEqual(
      expected,
    );
  });

  // What the browser sends for a description the counter shows at 500.
  it("counts a CRLF line break in the description as one character", () => {
    const description = [
      ...Array.from({ length: 4 }, () => "a".repeat(99)),
      "a".repeat(100),
    ].join("\r\n");

    expect(description).toHaveLength(504);
    expect(
      createProductSchema.parse({ ...validInput, description }).description,
    ).toHaveLength(500);
  });
});
