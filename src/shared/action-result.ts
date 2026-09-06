import * as z from "zod";

export type ActionError = {
  ok: false;
  code:
    "VALIDATION" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T = undefined> = { ok: true; data: T } | ActionError;

export function toValidationActionError<T extends Record<string, unknown>>(
  error: z.ZodError<T>,
): ActionError {
  const fieldErrors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(
    z.flattenError(error).fieldErrors,
  )) {
    if (messages !== undefined) fieldErrors[field] = messages;
  }

  return {
    ok: false,
    code: "VALIDATION",
    message: "Check the highlighted fields",
    fieldErrors,
  };
}
