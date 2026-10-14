import { EmptyState, EmptyStateSkeleton } from "@/components/empty-state";

const title = "No feedback yet";

function describe(productName: string) {
  return `Be the first to say what ${productName} should do next.`;
}

type BoardFeedbackProps = {
  productName: string;
};

// Where the board's feedback goes. Nobody can post any yet, so this is always
// the design's first-feedback state, without its Add feedback action.
export function BoardFeedback({ productName }: BoardFeedbackProps) {
  return (
    <div className="px-5 py-10 sm:px-10 sm:py-14">
      <div className="max-w-275">
        <EmptyState
          title={title}
          description={describe(productName)}
          headingLevel={2}
        />
      </div>
    </div>
  );
}

export function BoardFeedbackSkeleton({ productName }: BoardFeedbackProps) {
  return (
    <div className="px-5 py-10 sm:px-10 sm:py-14">
      <div className="max-w-275">
        <EmptyStateSkeleton title={title} description={describe(productName)} />
      </div>
    </div>
  );
}
