import { useEffect, useRef } from "react";

import type { ActionError } from "./action-result";

// After an error that only the form's banner shows, focus moves to the element
// the form attaches the returned ref to: wherever the person acts next. Field
// errors need nothing here, because Base UI's `Form` focuses the first invalid
// field.
export function useFocusAfterFormError<Element extends HTMLElement>(
  error: ActionError | null,
) {
  const ref = useRef<Element>(null);

  useEffect(() => {
    if (error?.message === undefined || error.fieldErrors !== undefined) {
      return;
    }

    ref.current?.focus();
  }, [error]);

  return ref;
}
