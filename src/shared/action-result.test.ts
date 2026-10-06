import { describe, expect, it } from "vitest";
import * as z from "zod";

import { toValidationActionError } from "./action-result";

const schema = z
  .object({
    email: z.email({ error: "Enter a complete email address" }),
    phone: z.string(),
  })
  .refine((input) => input.phone !== input.email, {
    error: "Use a phone number that differs from your email",
  });

function validationErrorFor(input: unknown) {
  const result = schema.safeParse(input);
  if (result.success) throw new Error("Expected the input to be invalid");

  return toValidationActionError(result.error);
}

describe("toValidationActionError", () => {
  it("puts field issues under their fields and adds no message", () => {
    expect(
      validationErrorFor({ email: "ada@invalid", phone: "1" }),
    ).toStrictEqual({
      ok: false,
      code: "VALIDATION",
      fieldErrors: { email: ["Enter a complete email address"] },
    });
  });

  it("turns object-level issues into the message and adds no field errors", () => {
    const error = validationErrorFor({
      email: "ada@example.com",
      phone: "ada@example.com",
    });

    expect(error).toStrictEqual({
      ok: false,
      code: "VALIDATION",
      message: "Use a phone number that differs from your email",
    });
  });

  it("keeps both halves when a field and the object fail together", () => {
    expect(
      validationErrorFor({ email: "ada@invalid", phone: "ada@invalid" }),
    ).toStrictEqual({
      ok: false,
      code: "VALIDATION",
      message: "Use a phone number that differs from your email",
      fieldErrors: { email: ["Enter a complete email address"] },
    });
  });
});
