import type { PublicFeedback } from "@/entities/feedback/queries.server";

import { FeedbackRow, FeedbackRowSkeleton } from "./feedback-row";

// Below `sm` the list is a band of the surface from edge to edge, with lines
// between its rows across the screen, as the mobile design draws it; from
// `sm` up it is a card in the content area.
const listClassName =
  "layout-subgrid divide-y divide-border-subtle border-y border-border-subtle bg-surface sm:col-content sm:flex sm:flex-col sm:overflow-hidden sm:rounded-lg sm:border";

type FeedbackListProps = {
  productSlug: string;
  feedback: PublicFeedback[];
};

// Ordered, since its order is the board's sort.
export function FeedbackList({ productSlug, feedback }: FeedbackListProps) {
  return (
    <ol className={listClassName}>
      {feedback.map((item) => (
        <FeedbackRow key={item.id} productSlug={productSlug} feedback={item} />
      ))}
    </ol>
  );
}

// The loading state cannot know the items, so it stands in for typical ones,
// and its text takes the room their titles, bodies and bylines would.
export const sampleFeedbackList = [
  {
    title: "Watch mode that survives a failed build",
    body: "Right now a syntax error kills the watcher and I have to restart the whole thing. It should log the error and keep watching the file tree.",
    status: "open",
    createdAt: new Date("2026-08-14T09:00:00Z"),
    authorName: "Marta K.",
    voteCount: 128,
  },
  {
    title: "Per-environment secrets in the config file",
    body: "One block per environment instead of a separate file each. Staging and production drift apart constantly.",
    status: "planned",
    createdAt: new Date("2026-08-09T09:00:00Z"),
    authorName: "Dmytro S.",
    voteCount: 96,
  },
  {
    title: "Rollback to a named release, not just the previous one",
    body: "We tag releases already; let me roll back to a tag by name.",
    status: "in_progress",
    createdAt: new Date("2026-08-02T09:00:00Z"),
    authorName: "Ren Okafor",
    voteCount: 61,
  },
] satisfies Omit<PublicFeedback, "id">[];

export function FeedbackListSkeleton() {
  return (
    <ol className={listClassName}>
      {sampleFeedbackList.map((item) => (
        <FeedbackRowSkeleton key={item.title} feedback={item} />
      ))}
    </ol>
  );
}
