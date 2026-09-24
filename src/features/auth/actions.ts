"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { env } from "@/server/env";
import {
  type ActionError,
  toValidationActionError,
} from "@/shared/action-result";

import { classifyAuthError } from "./errors";
import { parseAuthNavigation } from "./navigation";
import { createAccountSchema, signInSchema } from "./schemas";

export async function signInAction(
  _previousState: ActionError | null,
  formData: FormData,
): Promise<ActionError> {
  const parsedInput = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return toValidationActionError(parsedInput.error);
  }

  const navigation = parseAuthNavigation({
    returnTo: formData.get("returnTo"),
    origin: env.BETTER_AUTH_URL,
    fallback: "/",
  });

  try {
    await auth.api.signInEmail({
      body: parsedInput.data,
      headers: await headers(),
    });
  } catch (error) {
    if (classifyAuthError(error) === "invalidCredentials") {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "That email and password do not match an account.",
      };
    }

    throw error;
  }

  redirect(navigation.returnTo);
}

export async function createAccountAction(
  _previousState: ActionError | null,
  formData: FormData,
): Promise<ActionError> {
  const parsedInput = createAccountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return toValidationActionError(parsedInput.error);
  }

  const navigation = parseAuthNavigation({
    returnTo: formData.get("returnTo"),
    origin: env.BETTER_AUTH_URL,
    fallback: "/dashboard",
  });

  try {
    await auth.api.signUpEmail({
      body: parsedInput.data,
      headers: await headers(),
    });
  } catch (error) {
    if (classifyAuthError(error) === "emailAlreadyRegistered") {
      const message = "An account already uses this email.";

      return {
        ok: false,
        code: "CONFLICT",
        message,
        fieldErrors: { email: [message] },
      };
    }

    throw error;
  }

  redirect(navigation.returnTo);
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
