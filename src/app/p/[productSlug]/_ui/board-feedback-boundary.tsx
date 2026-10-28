"use client";

import { catchError, type ErrorInfo } from "next/error";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";

// A failed read of the feedback replaces the feedback alone: the board's bar
// and intro stay around it, which is why the design's "Go to the board" is
// left out. Retry reads it again in place.
function BoardFeedbackError(
  _props: Record<string, unknown>,
  { retry }: ErrorInfo,
) {
  return (
    <div className="py-10 sm:py-14">
      <ErrorState
        title="We couldn’t load the feedback. Please try again."
        headingLevel={2}
      >
        <Button onClick={retry}>Retry</Button>
      </ErrorState>
    </div>
  );
}

export const BoardFeedbackBoundary = catchError(BoardFeedbackError);
