import Link from "next/link";

import { SkeletonText } from "@/components/skeleton";
import { formatShortDate } from "@/shared/format-date";

import { type FeedbackHref, feedbackHref } from "../feedback-href";
import type { PublicFeedback } from "../queries.server";
import { StatusChip, StatusChipSkeleton } from "./status-chip";
import { votesLabel } from "./votes-label";

type RowVotesProps = {
  count: number;
};

function RowVotes({ count }: RowVotesProps) {
  return (
    <p className="flex w-13 shrink-0 flex-col items-center gap-y-1 rounded-lg border border-border bg-surface py-2.5 sm:w-15">
      <span aria-hidden="true" className="text-xs/none text-foreground-muted">
        ▲
      </span>
      <span className="font-mono text-base/none font-semibold">
        {count}
        <span className="sr-only"> {votesLabel(count)}</span>
      </span>
    </p>
  );
}

function RowVotesSkeleton({ count }: RowVotesProps) {
  return (
    <p className="flex w-13 shrink-0 flex-col items-center gap-y-1 rounded-lg border border-transparent bg-surface-muted py-2.5 text-transparent select-none sm:w-15">
      <span className="text-xs/none">▲</span>
      <span className="font-mono text-base/none font-semibold">{count}</span>
    </p>
  );
}

type RowTitleProps = {
  href: FeedbackHref;
  title: string;
};

// The title links to the item and is stretched over the whole row, so a
// click anywhere on the row opens the item and the focus ring goes around it.
function RowTitle({ href, title }: RowTitleProps) {
  return (
    <h2 className="font-serif text-base/snug font-semibold wrap-anywhere sm:text-lg/snug">
      <Link
        href={href}
        className="focus-ring-stretched after:absolute after:inset-0"
      >
        {/* The title wraps in an inline block of its own: Chromium does not
            wrap a line `pretty` around the link's stretched `::after`. A
            text decoration does not reach into an inline block, so the
            underline is set here. */}
        <span className="inline-block underline decoration-border underline-offset-3">
          {title}
        </span>
      </Link>
    </h2>
  );
}

function RowTitleSkeleton({ title }: Pick<RowTitleProps, "title">) {
  return (
    <p className="font-serif text-base/snug font-semibold wrap-anywhere sm:text-lg/snug">
      <SkeletonText>{title}</SkeletonText>
    </p>
  );
}

type RowBodyProps = {
  body: string;
};

// Cut to two lines, and left out below `sm`, as the mobile design does.
function RowBody({ body }: RowBodyProps) {
  return (
    <p className="mt-2 line-clamp-2 max-w-2xl text-sm/relaxed wrap-anywhere text-foreground-muted max-sm:hidden">
      {body}
    </p>
  );
}

function RowBodySkeleton({ body }: RowBodyProps) {
  return (
    <p className="mt-2 line-clamp-2 max-w-2xl text-sm/relaxed wrap-anywhere max-sm:hidden">
      <SkeletonText>{body}</SkeletonText>
    </p>
  );
}

type RowBylineProps = {
  authorName: string;
  createdAt: Date;
};

function RowByline({ authorName, createdAt }: RowBylineProps) {
  return (
    <p className="font-mono text-xs/normal wrap-anywhere text-foreground-subtle sm:mt-3">
      {authorName} ·{" "}
      <time dateTime={createdAt.toISOString()}>
        {formatShortDate(createdAt)}
      </time>
    </p>
  );
}

function RowBylineSkeleton({ authorName, createdAt }: RowBylineProps) {
  return (
    <p className="font-mono text-xs/normal wrap-anywhere sm:mt-3">
      <SkeletonText>{`${authorName} · ${formatShortDate(createdAt)}`}</SkeletonText>
    </p>
  );
}

type FeedbackRowProps = {
  productSlug: string;
  feedback: PublicFeedback;
};

// Below `sm` the status stands under the title, as the mobile design puts
// it; from `sm` up at the end of the row.
export function FeedbackRow({ productSlug, feedback }: FeedbackRowProps) {
  const { id, title, body, status, createdAt, authorName, voteCount } =
    feedback;

  return (
    <li className="relative layout-subgrid sm:block sm:px-6">
      <div className="flex min-w-0 items-start gap-x-3.5 py-5 sm:gap-x-6 sm:py-6">
        <RowVotes count={voteCount} />
        <div className="flex min-w-0 flex-1 flex-col gap-y-2 sm:gap-y-0">
          <RowTitle href={feedbackHref(productSlug, id)} title={title} />
          <div className="sm:hidden">
            <StatusChip status={status} />
          </div>
          <RowBody body={body} />
          <RowByline authorName={authorName} createdAt={createdAt} />
        </div>
        <div className="shrink-0 max-sm:hidden">
          <StatusChip status={status} />
        </div>
      </div>
    </li>
  );
}

type FeedbackRowSkeletonProps = {
  feedback: Omit<PublicFeedback, "id">;
};

export function FeedbackRowSkeleton({ feedback }: FeedbackRowSkeletonProps) {
  const { title, body, status, createdAt, authorName, voteCount } = feedback;

  return (
    <li className="layout-subgrid sm:block sm:px-6">
      <div className="flex min-w-0 items-start gap-x-3.5 py-5 sm:gap-x-6 sm:py-6">
        <RowVotesSkeleton count={voteCount} />
        <div className="flex min-w-0 flex-1 flex-col gap-y-2 sm:gap-y-0">
          <RowTitleSkeleton title={title} />
          <div className="sm:hidden">
            <StatusChipSkeleton status={status} />
          </div>
          <RowBodySkeleton body={body} />
          <RowBylineSkeleton authorName={authorName} createdAt={createdAt} />
        </div>
        <div className="shrink-0 max-sm:hidden">
          <StatusChipSkeleton status={status} />
        </div>
      </div>
    </li>
  );
}
