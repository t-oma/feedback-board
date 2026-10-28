import { clsx } from "clsx";

import type { FeedbackStatus } from "@/entities/feedback/contracts";

export const feedbackStatusLabels = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
} satisfies Record<FeedbackStatus, string>;

// The dot's shape tells the statuses apart, not a colour, as in the design: a
// ring, half filled, hatched, and full. It is drawn in the text's colour, so
// it stays visible on whatever holds it, a dark filter included.
const dotClassNames = {
  open: "border-[1.5px] border-current",
  planned:
    "border-[1.5px] border-current bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]",
  in_progress:
    "border-[1.5px] border-current bg-[repeating-linear-gradient(45deg,currentColor_0_1.5px,transparent_1.5px_3px)]",
  completed: "bg-current",
} satisfies Record<FeedbackStatus, string>;

type StatusChipProps = {
  status: FeedbackStatus;
};

export function StatusDot({ status }: StatusChipProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-block size-2.5 shrink-0 rounded-full",
        dotClassNames[status],
      )}
    />
  );
}

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
      <StatusDot status={status} />
      {feedbackStatusLabels[status]}
    </span>
  );
}

export function StatusChipSkeleton({ status }: StatusChipProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-x-1.5 rounded-md border border-transparent bg-surface-muted px-2.5 py-1 font-mono text-xs/snug font-semibold tracking-widest text-transparent uppercase select-none">
      <span className="size-2.5 shrink-0" />
      {feedbackStatusLabels[status]}
    </span>
  );
}
