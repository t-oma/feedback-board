import { ArrowUpRightIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Link } from "@/components/link";

import { CopyLinkButton } from "./copy-link-button";
import { CreateProductOwnerHeading } from "./create-product-owner-heading";

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
      <CreateProductOwnerHeading productName={productName} />
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
          title="No feedback yet"
          description="Share your board link and the first requests will show up here."
          headingLevel={2}
        />
      </div>
    </>
  );
}
