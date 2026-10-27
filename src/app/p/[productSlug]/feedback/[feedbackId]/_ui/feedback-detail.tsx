import type { ReactNode } from "react";

import { CopyLinkButton } from "@/components/copy-link-button";
import { PageMain } from "@/components/page-main";
import { BackLink, BackLinkSkeleton } from "@/components/site-header";
import { Skeleton } from "@/components/skeleton";
import type { PublicFeedback } from "@/entities/feedback/queries.server";

import { BoardHeader, BoardHeaderSkeleton } from "../../../_ui/board-header";
import { FeedbackBody, FeedbackBodySkeleton } from "./feedback-body";
import { FeedbackByline, FeedbackBylineSkeleton } from "./feedback-byline";
import {
  FeedbackActions,
  FeedbackBand,
  FeedbackColumns,
} from "./feedback-frame";
import { FeedbackHeading, FeedbackHeadingSkeleton } from "./feedback-heading";
import { FeedbackVotes, FeedbackVotesSkeleton } from "./feedback-votes";

type FeedbackDetailProps = {
  productName: string;
  productSlug: string;
  feedback: PublicFeedback;
  // The page's own address, which Copy link copies.
  url: string;
  // The page passes `ViewerControl`, which reads the session, and a story
  // passes what it renders.
  viewer: ReactNode;
};

// The way back names the product: on a phone it stands in the bar in place of
// the product's name, and a link opened cold still says whose item it is.
export function FeedbackDetail({
  productName,
  productSlug,
  feedback,
  url,
  viewer,
}: FeedbackDetailProps) {
  const { title, body, status, createdAt, authorName, voteCount } = feedback;

  return (
    <>
      <BoardHeader
        productName={productName}
        viewer={viewer}
        back={
          <BackLink
            href={`/p/${productSlug}` as const}
            label={`Back to ${productName}`}
          />
        }
      />
      <PageMain>
        <FeedbackBand as="article">
          <FeedbackColumns votes={<FeedbackVotes count={voteCount} />}>
            <FeedbackHeading title={title} status={status} />
            <FeedbackByline
              authorName={authorName}
              createdAt={createdAt}
              voteCount={voteCount}
            />
            <FeedbackBody body={body} />
            <FeedbackActions>
              <CopyLinkButton url={url} />
            </FeedbackActions>
          </FeedbackColumns>
        </FeedbackBand>
      </PageMain>
    </>
  );
}

// The loading state cannot know the item, so it stands in for a typical one,
// and its text takes the room this title, author and body would.
export const sampleFeedback = {
  productName: "Orbit CLI",
  feedback: {
    title: "Watch mode that survives a failed build",
    authorName: "Marta K.",
    body: "Right now a syntax error kills the watcher and I have to restart the whole thing. It should log the error and keep watching the file tree.",
    status: "open",
    voteCount: 128,
    createdAt: new Date("2026-08-14T09:00:00Z"),
  },
} satisfies {
  productName: string;
  feedback: Omit<PublicFeedback, "id">;
};

export function FeedbackDetailSkeleton() {
  const { productName, feedback } = sampleFeedback;

  return (
    <>
      <BoardHeaderSkeleton
        productName={productName}
        back={<BackLinkSkeleton />}
      />
      <PageMain>
        <FeedbackBand as="div">
          <Skeleton label="Loading the feedback">
            <FeedbackColumns
              votes={<FeedbackVotesSkeleton count={feedback.voteCount} />}
            >
              <FeedbackHeadingSkeleton
                title={feedback.title}
                status={feedback.status}
              />
              <FeedbackBylineSkeleton
                authorName={feedback.authorName}
                createdAt={feedback.createdAt}
                voteCount={feedback.voteCount}
              />
              <FeedbackBodySkeleton body={feedback.body} />
              <FeedbackActions>
                <div className="h-12 rounded-lg bg-surface-muted sm:w-31" />
              </FeedbackActions>
            </FeedbackColumns>
          </Skeleton>
        </FeedbackBand>
      </PageMain>
    </>
  );
}
