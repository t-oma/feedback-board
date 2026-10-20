import type { Route } from "next";
import type * as Navigation from "next/navigation";
import { vi } from "vitest";

import type { ActionError } from "@/shared/action-result";

// The headers of the request an action runs in, as `headers()` returns them.
export const requestHeaders = new Headers({
  cookie: "session=test",
  "user-agent": "Vitest",
  "x-forwarded-for": "203.0.113.7",
});

// Written out rather than taken from `toUnexpectedActionError`, so a test
// checks the words a person reads.
export const unexpectedActionError = {
  ok: false,
  code: "UNEXPECTED",
  message: "We couldn’t complete your request. Please try again.",
} satisfies ActionError;

// What a form submits, one entry per field.
export function formDataOf(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }

  return formData;
}

// A redirect error as Next.js throws it, which `unstable_rethrow` recognises
// by its digest. A plain import here would get the mocked `redirect` of a
// test that mocks `next/navigation`, so this asks for the real module.
export async function realRedirectError(href: Route = "/dashboard") {
  const navigation =
    await vi.importActual<typeof Navigation>("next/navigation");

  try {
    navigation.redirect(href);
  } catch (error) {
    return error;
  }

  throw new Error("Expected `redirect` to throw");
}
