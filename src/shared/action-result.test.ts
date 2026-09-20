import { describe, expect, it } from "vitest";
import * as z from "zod";

import { toValidationActionError } from "./action-result";

describe("toValidationActionError", () => {
  it("converts Zod field errors to the shared action error shape", () => {
    const schema = z.object({
      email: z.email({ error: "Enter a complete email address" }),
    });
    const result = schema.safeParse({ email: "ada@invalid" });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(toValidationActionError(result.error)).toEqual({
      ok: false,
      code: "VALIDATION",
      message: "Check the highlighted fields",
      fieldErrors: {
        email: ["Enter a complete email address"],
      },
    });
  });
});
