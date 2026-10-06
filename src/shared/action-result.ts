import * as z from "zod";

export type FieldErrors<Input> = { [Field in keyof Input]?: string[] };

export type ActionError<Input = Record<string, unknown>> = {
  ok: false;
  code:
    "VALIDATION" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT";
  message: string;
  fieldErrors?: FieldErrors<Input>;
};

export type ActionResult<T = undefined, Input = Record<string, unknown>> =
  { ok: true; data: T } | ActionError<Input>;

export function toValidationActionError<Input>(
  error: z.ZodError<Input>,
): ActionError<Input> {
  return {
    ok: false,
    code: "VALIDATION",
    message: "Check the highlighted fields",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}
