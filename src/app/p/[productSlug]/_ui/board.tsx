import type { ReactNode } from "react";

import { PageMain } from "@/components/page-main";
import { Skeleton } from "@/components/skeleton";
import { FeedbackListSkeleton } from "@/entities/feedback/ui/feedback-list";

import { BoardFiltersSkeleton } from "./board-filters";
import { BoardHeader, BoardHeaderSkeleton } from "./board-header";
import { BoardIntro, BoardIntroSkeleton } from "./board-intro";

type BoardProps = {
  productName: string;
  // Empty when the owner wrote none.
  description: string;
  // The page passes `ViewerControl`, which reads the session, and a story
  // passes what it renders.
  viewer: ReactNode;
  // The page passes the region that reads the board's feedback for the
  // address's view, and a story passes what it renders.
  feedback: ReactNode;
};

export function Board({
  productName,
  description,
  viewer,
  feedback,
}: BoardProps) {
  return (
    <>
      <BoardHeader productName={productName} viewer={viewer} />
      <PageMain>
        <BoardIntro description={description} />
        {feedback}
      </PageMain>
    </>
  );
}

// The loading state cannot know the board, so it stands in for a typical
// one, and its text takes the room this name and description would.
export const sampleBoard = {
  productName: "Orbit CLI",
  description:
    "Orbit CLI is a deploy tool for small teams. Tell us what is missing and vote on what matters most.",
} satisfies Omit<BoardProps, "viewer" | "feedback">;

// Most boards a visitor opens have feedback, so the loading state draws the
// filters and a few rows rather than the empty state.
export function BoardSkeleton() {
  return (
    <>
      <BoardHeaderSkeleton productName={sampleBoard.productName} />
      <PageMain>
        <BoardIntroSkeleton description={sampleBoard.description} />
        <Skeleton band label="Loading the board">
          <BoardFiltersSkeleton />
          <FeedbackListSkeleton />
        </Skeleton>
      </PageMain>
    </>
  );
}
