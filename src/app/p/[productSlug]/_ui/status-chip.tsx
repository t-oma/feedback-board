import { clsx } from "clsx";

import type { FeedbackStatus } from "@/entities/feedback/contracts";

export const feedbackStatusLabels = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
} satisfies Record<FeedbackStatus, string>;

// The dot's shape tells the statuses apart, not a colour, as in the design: a
// ring, half filled, hatched, and full.
const dotClassNames = {
  open: "border-[1.5px] border-foreground-muted",
  planned:
    "border-[1.5px] border-foreground-muted bg-[linear-gradient(90deg,var(--color-foreground-muted)_50%,transparent_50%)]",
  in_progress:
    "border-[1.5px] border-foreground-muted bg-[repeating-linear-gradient(45deg,var(--color-foreground-muted)_0_1.5px,transparent_1.5px_3px)]",
  completed: "bg-foreground-muted",
} satisfies Record<FeedbackStatus, string>;

type StatusChipProps = {
  status: FeedbackStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-x-1.5 rounded-md border px-2.5 py-1 font-mono text-xs/snug font-semibold tracking-widest uppercase",
        status === "completed"
          ? "border-foreground-muted bg-surface-muted text-foreground"
          : "border-border bg-background text-foreground-secondary",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "size-2.5 shrink-0 rounded-full",
          dotClassNames[status],
        )}
      />
      {feedbackStatusLabels[status]}
    </span>
  );
}
