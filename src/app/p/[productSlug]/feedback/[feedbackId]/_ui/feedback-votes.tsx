import { votesLabel } from "../../../_ui/votes-label";

type FeedbackVotesProps = {
  count: number;
};

// From `sm` up. A phone shows the count in the byline instead, since the
// mobile design draws it only in the vote button pinned to the bottom of the
// screen.
export function FeedbackVotes({ count }: FeedbackVotesProps) {
  return (
    <p className="flex w-18 shrink-0 flex-col items-center gap-y-1 rounded-lg border border-border bg-surface py-3.5 max-sm:hidden">
      <span aria-hidden="true" className="text-sm/none text-foreground-muted">
        ▲
      </span>
      <span className="font-mono text-2xl/none font-semibold">{count}</span>
      <span className="font-mono text-xs/none tracking-widest text-foreground-subtle uppercase">
        {votesLabel(count)}
      </span>
    </p>
  );
}

export function FeedbackVotesSkeleton({ count }: FeedbackVotesProps) {
  return (
    <p className="flex w-18 shrink-0 flex-col items-center gap-y-1 rounded-lg border border-transparent bg-surface-muted py-3.5 text-transparent select-none max-sm:hidden">
      <span className="text-sm/none">▲</span>
      <span className="font-mono text-2xl/none font-semibold">{count}</span>
      <span className="font-mono text-xs/none tracking-widest uppercase">
        {votesLabel(count)}
      </span>
    </p>
  );
}
