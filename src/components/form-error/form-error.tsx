import { CircleAlert } from "lucide-react";
import type { Ref } from "react";

type FormErrorProps = {
  // Absent when the fields say everything there is to say.
  message: string | undefined;
  ref?: Ref<HTMLDivElement> | undefined;
};

export function FormError({ message, ref }: FormErrorProps) {
  if (message === undefined) return null;

  return (
    // `tabIndex={-1}` lets a form move focus here after a failed submit
    // without adding a Tab stop.
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-surface px-3 py-3 text-sm text-foreground-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-danger"
      />
      <p>{message}</p>
    </div>
  );
}
