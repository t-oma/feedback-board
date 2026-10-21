"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { classifyAuthError } from "@/entities/user/errors";
import { parseReturnTo } from "@/entities/user/navigation";
import { toUnexpectedActionError } from "@/server/action-errors";
import { auth } from "@/server/auth";
import { appOrigin } from "@/server/env";
import {
  type ActionError,
  toValidationActionError,
} from "@/shared/action-result";

import { type CreateAccountInput, createAccountSchema } from "./schemas";

export async function createAccountAction(
  _previousState: ActionError<CreateAccountInput> | null,
  formData: FormData,
): Promise<ActionError<CreateAccountInput>> {
  const parsedInput = createAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return toValidationActionError(parsedInput.error);
  }

  // Someone who signs up to vote arrives with a board in `returnTo`. Without
  // one, the account is most likely for a board of its own.
  const returnTo =
    parseReturnTo(formData.get("returnTo"), appOrigin) ?? "/dashboard/new";

  try {
    await auth.api.signUpEmail({
      body: parsedInput.data,
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);

    if (classifyAuthError(error) === "emailAlreadyRegistered") {
      return {
        ok: false,
        code: "CONFLICT",
        fieldErrors: { email: ["An account already uses this email."] },
      };
    }

    return toUnexpectedActionError("createAccountAction", error);
  }

  redirect(returnTo);
}
