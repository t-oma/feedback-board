import type * as z from "zod";

// A `validate` function for a Base UI field, made from the Zod schema the
// Server Action parses the same field with, so the browser and the server
// reject a value for the same reasons and in the same words. Base UI shows the
// messages under the field and blocks the submit while any are present.
export function fieldValidator(schema: z.ZodType) {
  return (value: unknown) => {
    const result = schema.safeParse(value);

    return result.success
      ? null
      : result.error.issues.map((issue) => issue.message);
  };
}
