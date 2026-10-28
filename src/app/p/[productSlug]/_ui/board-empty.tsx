import { EmptyState } from "@/components/empty-state";
import { Link } from "@/components/link";

type BoardEmptyProps = {
  productName: string;
};

// The design's state 04, for a board without visible feedback. With nothing
// to narrow, the filters and the sort stay hidden. The design's Add feedback
// action waits until feedback can be written.
export function BoardEmpty({ productName }: BoardEmptyProps) {
  return (
    <div className="py-10 sm:py-14">
      <EmptyState
        title="No feedback yet"
        description={`Be the first to say what ${productName} should do next.`}
        headingLevel={2}
      />
    </div>
  );
}

type BoardNoMatchesProps = {
  productSlug: string;
  // The board's visible feedback under every status.
  total: number;
};

// The design's state 05, for a status with no items on a board that has
// some. Reset filters leads to the board's bare address, All and Newest.
export function BoardNoMatches({ productSlug, total }: BoardNoMatchesProps) {
  const items = total === 1 ? "is 1 item" : `are ${String(total)} items`;

  return (
    <div className="py-10 sm:py-14">
      <EmptyState
        title="Nothing matches this filter"
        description={`There ${items} on the board under other statuses.`}
        headingLevel={2}
      >
        <Link variant="secondary" href={`/p/${productSlug}` as const}>
          Reset filters
        </Link>
      </EmptyState>
    </div>
  );
}
