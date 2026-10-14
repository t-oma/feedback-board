import { Skeleton } from "@/components/skeleton";

import { BoardFeedback, BoardFeedbackSkeleton } from "./board-feedback";
import { BoardHeader, BoardHeaderSkeleton } from "./board-header";
import { BoardIntro, BoardIntroSkeleton } from "./board-intro";

type BoardProps = {
  productName: string;
  // Empty when the owner wrote none.
  description: string;
};

export function Board({ productName, description }: BoardProps) {
  return (
    <>
      <BoardHeader productName={productName} />
      <main className="flex flex-1 flex-col">
        <BoardIntro description={description} />
        <BoardFeedback productName={productName} />
      </main>
    </>
  );
}

// The loading state cannot know the board, so it stands in for a typical
// one, and its text takes the room this name and description would.
export const sampleBoard = {
  productName: "Orbit CLI",
  description:
    "Orbit CLI is a deploy tool for small teams. Tell us what is missing and vote on what matters most.",
} satisfies BoardProps;

export function BoardSkeleton() {
  return (
    <>
      <BoardHeaderSkeleton productName={sampleBoard.productName} />
      <main className="flex flex-1 flex-col">
        <Skeleton label="Loading the board">
          {/* One child, so the skeleton's gap stays out of the column. */}
          <div>
            <BoardIntroSkeleton description={sampleBoard.description} />
            <BoardFeedbackSkeleton productName={sampleBoard.productName} />
          </div>
        </Skeleton>
      </main>
    </>
  );
}
