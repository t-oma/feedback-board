import { EmptyState, EmptyStateSkeleton } from "@/components/empty-state";
import { Skeleton, SkeletonText } from "@/components/skeleton";

import { BoardAddress, BoardAddressSkeleton } from "./board-address";
import { OwnerHeading } from "./owner-heading";

const emptyTitle = "No feedback yet";
const emptyDescription =
  "Share your board link and the first requests will show up here.";

type OwnerOverviewProps = {
  productName: string;
  productSlug: string;
  // The origin the public address starts with.
  origin: string;
};

// The heading and the address keep a readable measure; the empty state
// centres where the feedback will be listed.
export function OwnerOverview({
  productName,
  productSlug,
  origin,
}: OwnerOverviewProps) {
  return (
    <div className="flex flex-col gap-y-5 py-6 sm:py-9">
      <div className="flex max-w-xl flex-col gap-y-5">
        <OwnerHeading productName={productName} />
        <BoardAddress productSlug={productSlug} origin={origin} />
      </div>

      <div className="py-6">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          headingLevel={2}
        />
      </div>
    </div>
  );
}

// The loading state cannot know the board, so it stands in for one with this
// name and address.
export const sampleOwnerBoard = {
  productName: "Orbit CLI",
  productSlug: "orbit-cli",
} satisfies Partial<OwnerOverviewProps>;

export function OwnerOverviewSkeleton({
  origin,
}: Pick<OwnerOverviewProps, "origin">) {
  return (
    <div className="py-6 sm:py-9">
      <Skeleton label="Loading your dashboard">
        <div className="flex max-w-xl flex-col gap-y-5">
          <p className="font-serif text-2xl font-semibold wrap-anywhere">
            <SkeletonText>{sampleOwnerBoard.productName}</SkeletonText>
          </p>
          <BoardAddressSkeleton
            productSlug={sampleOwnerBoard.productSlug}
            origin={origin}
          />
        </div>

        <div className="py-6">
          <EmptyStateSkeleton
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      </Skeleton>
    </div>
  );
}
