"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { classifyAuthError } from "@/entities/user/errors";
import { parseReturnTo } from "@/entities/user/navigation";
import { toUnexpectedActionError } from "@/server/action-errors";
import { auth } from "@/server/auth";
import { env } from "@/server/env";
import {
  type ActionError,
  toValidationActionError,
} from "@/shared/action-result";

import { type SignInInput, signInSchema } from "./schemas";

export async function signInAction(
  _previousState: ActionError<SignInInput> | null,
  formData: FormData,
): Promise<ActionError<SignInInput>> {
  const parsedInput = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return toValidationActionError(parsedInput.error);
  }

  const returnTo =
    parseReturnTo(formData.get("returnTo"), env.BETTER_AUTH_URL) ?? "/";

  try {
    await auth.api.signInEmail({
      body: parsedInput.data,
      headers: await headers(),
    });
  } catch (error) {
    unstable_rethrow(error);

    if (classifyAuthError(error) === "invalidCredentials") {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "That email and password do not match an account.",
      };
    }

    return toUnexpectedActionError("signInAction", error);
  }

  redirect(returnTo);
}
