import type { ReactNode } from "react";

import { PageMain } from "@/components/page-main";
import { Skeleton } from "@/components/skeleton";

import { BoardFeedback, BoardFeedbackSkeleton } from "./board-feedback";
import { BoardHeader, BoardHeaderSkeleton } from "./board-header";
import { BoardIntro, BoardIntroSkeleton } from "./board-intro";

type BoardProps = {
  productName: string;
  // Empty when the owner wrote none.
  description: string;
  // The page passes `ViewerControl`, which reads the session, and a story
  // passes what it renders.
  viewer: ReactNode;
};

export function Board({ productName, description, viewer }: BoardProps) {
  return (
    <>
      <BoardHeader productName={productName} viewer={viewer} />
      <PageMain>
        <BoardIntro description={description} />
        <BoardFeedback productName={productName} />
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
} satisfies Omit<BoardProps, "viewer">;

export function BoardSkeleton() {
  return (
    <>
      <BoardHeaderSkeleton productName={sampleBoard.productName} />
      <PageMain>
        <BoardIntroSkeleton description={sampleBoard.description} />
        <Skeleton label="Loading the board">
          <BoardFeedbackSkeleton productName={sampleBoard.productName} />
        </Skeleton>
      </PageMain>
    </>
  );
}
