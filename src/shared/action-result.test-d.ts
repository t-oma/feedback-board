import { expectTypeOf } from "vitest";
import type * as z from "zod";

import { type ActionError, toValidationActionError } from "./action-result";

type SignUp = { email: string; password: string };

declare const signUpError: z.ZodError<SignUp>;

expectTypeOf(toValidationActionError(signUpError)).toEqualTypeOf<
  ActionError<SignUp>
>();

export const misspeltField: ActionError<SignUp> = {
  ok: false,
  code: "CONFLICT",
  message: "An account already uses this email.",
  // @ts-expect-error `emial` is not a field of the input.
  fieldErrors: { emial: ["An account already uses this email."] },
};
