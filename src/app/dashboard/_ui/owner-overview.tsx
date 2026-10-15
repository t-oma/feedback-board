import { ArrowUpRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState, EmptyStateSkeleton } from "@/components/empty-state";
import { Link } from "@/components/link";
import { Skeleton, SkeletonText } from "@/components/skeleton";

import { CopyLinkButton } from "./copy-link-button";
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

export function OwnerOverview({
  productName,
  productSlug,
  origin,
}: OwnerOverviewProps) {
  const boardPath = `/p/${productSlug}` as const;
  const { host, href } = new URL(boardPath, origin);

  return (
    <>
      <OwnerHeading productName={productName} />
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-background p-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs text-foreground-subtle">Public address</p>
          <p className="font-mono text-sm break-all">
            {host}
            {boardPath}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CopyLinkButton url={href} />
          {/* A new tab, as the design's arrow marks it, so the dashboard
              stays where the owner left it. */}
          <Link variant="secondary" href={boardPath} target="_blank">
            View public board
            <span className="sr-only"> (opens in a new tab)</span>
            <ArrowUpRightIcon aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>

      <div className="py-6">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          headingLevel={2}
        />
      </div>
    </>
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
  const boardPath = `/p/${sampleOwnerBoard.productSlug}`;
  const { host } = new URL(boardPath, origin);

  return (
    <Skeleton label="Loading your dashboard">
      <p className="font-serif text-2xl font-semibold">
        <SkeletonText>{sampleOwnerBoard.productName}</SkeletonText>
      </p>
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-background p-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs">
            <SkeletonText>Public address</SkeletonText>
          </p>
          <p className="font-mono text-sm break-all">
            <SkeletonText>{`${host}${boardPath}`}</SkeletonText>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonBlock>Copy link</ButtonBlock>
          <ButtonBlock>
            View public board
            <span className="size-4" />
          </ButtonBlock>
        </div>
      </div>

      <div className="py-6">
        <EmptyStateSkeleton title={emptyTitle} description={emptyDescription} />
      </div>
    </Skeleton>
  );
}

// A toned block as large as a secondary button with this label. Not
// `ButtonSkeleton`: that one is marked as a control, and the geometry check
// lines marked blocks up with submit buttons, which this state has none of.
function ButtonBlock({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-transparent bg-surface-muted px-4 py-3 text-sm font-medium text-transparent select-none">
      {children}
    </span>
  );
}
