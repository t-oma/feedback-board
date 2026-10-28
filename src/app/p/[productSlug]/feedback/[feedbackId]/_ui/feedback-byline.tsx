import { SkeletonText } from "@/components/skeleton";
import { formatLongDate, formatShortDate } from "@/shared/format-date";

import { votesLabel } from "../../../_ui/votes-label";

type FeedbackBylineProps = {
  authorName: string;
  createdAt: Date;
  voteCount: number;
};

// A phone writes the short date, as the mobile design does, and ends with the
// count that the vote block shows from `sm` up.
export function FeedbackByline({
  authorName,
  createdAt,
  voteCount,
}: FeedbackBylineProps) {
  return (
    <p className="mt-3 font-mono text-xs/normal wrap-anywhere text-foreground-subtle sm:mt-4">
      {authorName} ·{" "}
      <time dateTime={createdAt.toISOString()}>
        <span className="sm:hidden">{formatShortDate(createdAt)}</span>
        <span className="max-sm:hidden">{formatLongDate(createdAt)}</span>
      </time>
      <span className="sm:hidden">
        {" "}
        · {voteCount} {votesLabel(voteCount)}
      </span>
    </p>
  );
}

export function FeedbackBylineSkeleton({
  authorName,
  createdAt,
  voteCount,
}: FeedbackBylineProps) {
  return (
    <p className="mt-3 font-mono text-xs/normal wrap-anywhere sm:mt-4">
      <span className="sm:hidden">
        <SkeletonText>{`${authorName} · ${formatShortDate(createdAt)} · ${String(voteCount)} ${votesLabel(voteCount)}`}</SkeletonText>
      </span>
      <span className="max-sm:hidden">
        <SkeletonText>{`${authorName} · ${formatLongDate(createdAt)}`}</SkeletonText>
      </span>
    </p>
  );
}
