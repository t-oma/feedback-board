import * as z from "zod";
import { describe, expect, it } from "vitest";
import { createAccountSchema, signInSchema } from "./schemas";

const maxLengthEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;

describe("signInSchema", () => {
  it("trims the email without changing the password", () => {
    const password = "  pass word  ";

    expect(
      signInSchema.parse({
        email: "  ada@example.com  ",
        password,
      }),
    ).toEqual({
      email: "ada@example.com",
      password,
    });
  });

  it("rejects an invalid email address", () => {
    expect(
      signInSchema.safeParse({
        email: "not-an-email",
        password: "password",
      }).success,
    ).toBe(false);
  });

  it("accepts an email at 254 characters and rejects one at 255", () => {
    expect(maxLengthEmail).toHaveLength(254);
    expect(
      signInSchema.safeParse({
        email: maxLengthEmail,
        password: "password",
      }).success,
    ).toBe(true);
    expect(
      signInSchema.safeParse({
        email: `a${maxLengthEmail}`,
        password: "password",
      }).success,
    ).toBe(false);
  });

  it.each([
    ["accepts", 8, true],
    ["accepts", 128, true],
    ["rejects", 7, false],
    ["rejects", 129, false],
  ])("%s a password with %i characters", (_, length, expected) => {
    expect(
      signInSchema.safeParse({
        email: "ada@example.com",
        password: "a".repeat(length),
      }).success,
    ).toBe(expected);
  });
});

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
