"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { toUnexpectedActionError } from "@/server/action-errors";
import { auth } from "@/server/auth";
import { env } from "@/server/env";
import {
  type ActionError,
  toValidationActionError,
} from "@/shared/action-result";

import { classifyAuthError } from "./errors";
import { parseReturnTo } from "./navigation";
import {
  type CreateAccountInput,
  createAccountSchema,
  type SignInInput,
  signInSchema,
} from "./schemas";

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

  const returnTo =
    parseReturnTo(formData.get("returnTo"), env.BETTER_AUTH_URL) ??
    "/dashboard";

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

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
