import "server-only";

import type { ActionError } from "@/shared/action-result";

// For a failure an action did not expect, such as the database being down.
// Returning it keeps the form and what was typed, where a throw would replace
// the page with the route's error boundary. Once the action catches the error,
// Next.js no longer logs it, so this does.
//
// The message makes no claim about whether the write happened: a commit can
// succeed and its acknowledgement still be lost on the way back.
export function toUnexpectedActionError(action: string, error: unknown) {
  console.error(`${action} failed unexpectedly`, error);

  return {
    ok: false,
    code: "UNEXPECTED",
    message: "We couldn’t complete your request. Please try again.",
  } as const satisfies ActionError;
}
