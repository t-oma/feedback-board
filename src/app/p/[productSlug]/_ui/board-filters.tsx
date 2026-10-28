import { clsx } from "clsx";
import Link from "next/link";

import { SkeletonText } from "@/components/skeleton";
import { boardHref } from "@/entities/feedback/board-href";
import {
  BOARD_SORTS,
  BOARD_STATUS_FILTERS,
  type BoardSort,
  type BoardStatusFilter,
  type BoardView,
  FEEDBACK_STATUS_BY_FILTER,
} from "@/entities/feedback/contracts";

import { feedbackStatusLabels, StatusDot } from "./status-chip";

function statusLabel(filter: BoardStatusFilter) {
  const status = FEEDBACK_STATUS_BY_FILTER[filter];
  return status === null ? "All" : feedbackStatusLabels[status];
}

const sortLabels = {
  new: "Newest",
  top: "Top",
} satisfies Record<BoardSort, string>;

type BoardFiltersProps = {
  productSlug: string;
  view: BoardView;
  counts: Record<BoardStatusFilter, number>;
};

// Links rather than controls, so they work before hydration and without
// JavaScript, and each keeps the other half of the view. A click keeps the
// page where it is: the list below changes, the filters stay in view.
//
// Below `sm` the statuses scroll sideways in a band from edge to edge, fading
// at the end, without their dots, and every target is 44px tall, as the mobile
// design draws them; from `sm` up the filters and the sort share a line.
export function BoardFilters({ productSlug, view, counts }: BoardFiltersProps) {
  return (
    <div className="layout-subgrid gap-y-2.5 py-3.5 sm:col-content sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:py-5">
      <div className="relative col-full sm:col-auto">
        <ul
          aria-label="Status"
          className="flex gap-x-1.5 overflow-x-auto px-5 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0"
        >
          {BOARD_STATUS_FILTERS.map((filter) => {
            const current = filter === view.status;
            const status = FEEDBACK_STATUS_BY_FILTER[filter];

            return (
              <li key={filter} className="flex shrink-0">
                <Link
                  href={boardHref(productSlug, { ...view, status: filter })}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className={clsx(
                    "inline-flex items-center gap-x-1.5 rounded-full border px-3 py-4 text-xs/none focus-ring-inside sm:py-1.5",
                    current
                      ? "border-foreground bg-foreground font-medium text-surface"
                      : "border-border bg-surface text-foreground-secondary hover:border-foreground-subtle",
                  )}
                >
                  {status !== null && (
                    <span className="flex max-sm:hidden">
                      <StatusDot status={status} />
                    </span>
                  )}
                  {statusLabel(filter)}
                  <span
                    className={clsx(
                      "font-mono font-medium",
                      current ? "text-surface/70" : "text-foreground-subtle",
                    )}
                  >
                    {counts[filter]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background sm:hidden"
        />
      </div>
      <div className="flex items-center justify-end gap-x-2.5">
        <span
          aria-hidden="true"
          className="font-mono text-xs text-foreground-subtle"
        >
          sort
        </span>
        <ul
          aria-label="Sort"
          className="flex divide-x divide-border-subtle overflow-hidden rounded-md border border-border bg-surface"
        >
          {BOARD_SORTS.map((sort) => {
            const current = sort === view.sort;

            return (
              <li key={sort}>
                <Link
                  href={boardHref(productSlug, { ...view, sort })}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className={clsx(
                    "block px-3.5 py-4 text-xs/none focus-ring-inside sm:py-1.5",
                    current
                      ? "bg-surface-muted font-medium text-foreground"
                      : "text-foreground-subtle hover:text-foreground",
                  )}
                >
                  {sortLabels[sort]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// The loading state cannot know the counts or the view, so it stands in for
// the default one with a typical board's counts.
export const sampleCounts = {
  all: 24,
  open: 12,
  planned: 5,
  "in-progress": 3,
  completed: 4,
} satisfies Record<BoardStatusFilter, number>;

export function BoardFiltersSkeleton() {
  return (
    <div className="layout-subgrid gap-y-2.5 py-3.5 sm:col-content sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:py-5">
      <div className="col-full sm:col-auto">
        <ul className="flex gap-x-1.5 overflow-hidden px-5 sm:flex-wrap sm:gap-2 sm:px-0">
          {BOARD_STATUS_FILTERS.map((filter) => {
            const status = FEEDBACK_STATUS_BY_FILTER[filter];

            return (
              <li key={filter} className="flex shrink-0">
                <span className="inline-flex items-center gap-x-1.5 rounded-full border border-transparent bg-surface-muted px-3 py-4 text-xs/none text-transparent select-none sm:py-1.5">
                  {status !== null && (
                    <span className="size-2.5 shrink-0 max-sm:hidden" />
                  )}
                  {statusLabel(filter)}
                  <span className="font-mono font-medium">
                    {sampleCounts[filter]}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center justify-end gap-x-2.5">
        <span className="font-mono text-xs">
          <SkeletonText>sort</SkeletonText>
        </span>
        <span className="flex rounded-md border border-transparent bg-surface-muted text-transparent select-none">
          {BOARD_SORTS.map((sort) => (
            <span
              key={sort}
              className="block px-3.5 py-4 text-xs/none sm:py-1.5"
            >
              {sortLabels[sort]}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
