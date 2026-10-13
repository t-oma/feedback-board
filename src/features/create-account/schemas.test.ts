import { describe, expect, it } from "vitest";
import * as z from "zod";

import { createAccountSchema } from "./schemas";

describe("createAccountSchema", () => {
  it("trims the name and email without changing the password", () => {
    const password = "  pass word  ";

    expect(
      createAccountSchema.parse({
        name: "  Ada Lovelace  ",
        email: "  ada@example.com  ",
        password,
      }),
    ).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password,
    });
  });

  it.each([
    ["accepts", 1, true],
    ["accepts", 80, true],
    ["rejects", 81, false],
  ])("%s a name with %i characters", (_, length, expected) => {
    expect(
      createAccountSchema.safeParse({
        name: "a".repeat(length),
        email: "ada@example.com",
        password: "password",
      }).success,
    ).toBe(expected);
  });

  it("rejects a name that is empty after trimming", () => {
    expect(
      createAccountSchema.safeParse({
        name: "   ",
        email: "ada@example.com",
        password: "password",
      }).success,
    ).toBe(false);
  });

  it.each([
    ["an invalid email", { email: "not-an-email" }],
    ["a password shorter than 8 characters", { password: "a".repeat(7) }],
    ["a password longer than 128 characters", { password: "a".repeat(129) }],
  ])("rejects %s", (_, invalidField) => {
    expect(
      createAccountSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password",
        ...invalidField,
      }).success,
    ).toBe(false);
  });

  it("returns the designed field messages", () => {
    const result = createAccountSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@invalid",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(z.flattenError(result.error).fieldErrors).toEqual({
      email: ["Enter a complete email address"],
      password: ["Use at least 8 characters"],
    });
  });
});
