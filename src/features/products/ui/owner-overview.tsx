import { EmptyState } from "@/components/empty-state";

import { CopyLinkButton } from "./copy-link-button";
import { OwnerHeading } from "./owner-heading";

type OwnerOverviewProps = {
  productName: string;
  publicUrl: string;
};

export function OwnerOverview({ productName, publicUrl }: OwnerOverviewProps) {
  const { host, pathname } = new URL(publicUrl);

  return (
    <>
      <OwnerHeading productName={productName} />
      <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xs text-foreground-subtle">Public address</p>
          <p className="font-mono text-sm break-all">
            {host}
            {pathname}
          </p>
        </div>
        <CopyLinkButton url={publicUrl} />
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
