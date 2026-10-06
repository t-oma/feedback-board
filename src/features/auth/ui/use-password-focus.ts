import { useEffect, useRef } from "react";

import type { ActionError } from "@/shared/action-result";

// After an error the form shows in its banner, focus goes to the password.
// React resets the form after every action, which empties the uncontrolled
// password, so it is the field to fill again before a retry can work. Field
// errors need nothing here: Base UI's `Form` focuses the first invalid field.
export function usePasswordFocusAfterFormError(error: ActionError | null) {
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error?.message === undefined || error.fieldErrors !== undefined) {
      return;
    }

    passwordRef.current?.focus();
  }, [error]);

  return passwordRef;
}
