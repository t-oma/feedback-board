import { CircleCheck, Info, X } from "lucide-react";
import type { Ref } from "react";

export type NoticeMessage = {
  text: string;
  variant: "success" | "info";
};

type NoticeProps = {
  message: NoticeMessage;
  onDismiss: () => void;
  ref?: Ref<HTMLDivElement> | undefined;
};

export function Notice({ message, onDismiss, ref }: NoticeProps) {
  const Icon = message.variant === "success" ? CircleCheck : Info;

  return (
    // `tabIndex={-1}` lets the page move focus here when the notice appears
    // without adding a Tab stop.
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-muted py-2 pr-2 pl-3 text-sm text-foreground-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
      <p className="flex-1 font-medium">{message.text}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
