import { CircleAlert } from "lucide-react";

import type { ActionError } from "@/shared/action-result";

type AuthFormMessageProps = {
  error: ActionError | null;
};

export function AuthFormMessage({ error }: AuthFormMessageProps) {
  if (error === null || error.fieldErrors !== undefined) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-surface px-3 py-3 text-sm text-foreground-secondary"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-danger"
      />
      <p>{error.message}</p>
    </div>
  );
}
