import * as z from "zod";

export type FieldErrors<Input> = { [Field in keyof Input]?: string[] };

export type ActionError<Input = Record<string, unknown>> = {
  ok: false;
  code:
    | "VALIDATION"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNEXPECTED";
  // Form-level text, which the form shows in its banner. Absent when the
  // fields say everything there is to say.
  message?: string;
  // Absent rather than empty, so its presence means a field has an error.
  fieldErrors?: FieldErrors<Input>;
};

export type ActionResult<T = undefined, Input = Record<string, unknown>> =
  { ok: true; data: T } | ActionError<Input>;

export function toValidationActionError<Input>(
  error: z.ZodError<Input>,
): ActionError<Input> {
  // Issues without a path, such as an object-level `refine`, land in
  // `formErrors`. They have no field to show under, so they become the
  // banner's message. Zod runs such a check even after a field has failed,
  // so a result can carry both halves.
  const { formErrors, fieldErrors } = z.flattenError(error);
  const actionError: ActionError<Input> = { ok: false, code: "VALIDATION" };

  if (formErrors.length > 0) actionError.message = formErrors.join(" ");
  if (Object.keys(fieldErrors).length > 0) {
    actionError.fieldErrors = fieldErrors;
  }

  return actionError;
}
