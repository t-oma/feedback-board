import { describe, expect, it } from "vitest";
import * as z from "zod";

import { signInSchema } from "./schemas";

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

  // The sign-up minimum is policy for new passwords. An existing one was set
  // under whatever policy held at the time, so sign-in must not re-judge it.
  it.each([
    ["accepts", 1, true],
    ["accepts", 7, true],
    ["accepts", 128, true],
    ["rejects", 129, false],
  ])("%s a password with %i characters", (_, length, expected) => {
    expect(
      signInSchema.safeParse({
        email: "ada@example.com",
        password: "a".repeat(length),
      }).success,
    ).toBe(expected);
  });

  it("asks for a password when none was entered", () => {
    const result = signInSchema.safeParse({
      email: "ada@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(z.flattenError(result.error).fieldErrors).toEqual({
      password: ["Enter your password"],
    });
  });
});
