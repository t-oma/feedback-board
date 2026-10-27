import { ArrowUpRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { CopyLinkButton } from "@/components/copy-link-button";
import { Link } from "@/components/link";
import { SkeletonText } from "@/components/skeleton";

type BoardAddressProps = {
  productSlug: string;
  // The origin the public address starts with.
  origin: string;
};

export function BoardAddress({ productSlug, origin }: BoardAddressProps) {
  const boardPath = `/p/${productSlug}` as const;
  const { host, href } = new URL(boardPath, origin);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs text-foreground-subtle">Public address</p>
        {/* The host is quieter than the slug, the part the owner chose, as in
            the address field they typed it into. A narrow screen breaks the
            address after `/p/` and keeps the slug whole on the next line: a
            block that only wraps when it is wider than the line, which a
            hyphen inside the slug would otherwise beat. */}
        <p className="font-mono text-sm wrap-anywhere">
          <span className="text-foreground-subtle">{host}/p/</span>
          <wbr />
          <span className="inline-block max-w-full font-medium">
            {productSlug}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <CopyLinkButton url={href} />
        {/* A new tab, as the design's arrow marks it, so the dashboard stays
            where the owner left it. */}
        <Link variant="secondary" href={boardPath} target="_blank">
          View public board
          <span className="sr-only"> (opens in a new tab)</span>
          <ArrowUpRightIcon aria-hidden="true" size={16} />
        </Link>
      </div>
    </div>
  );
}

export function BoardAddressSkeleton({
  productSlug,
  origin,
}: BoardAddressProps) {
  const { host } = new URL(origin);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs">
          <SkeletonText>Public address</SkeletonText>
        </p>
        <p className="font-mono text-sm wrap-anywhere">
          <SkeletonText>{`${host}/p/`}</SkeletonText>
          <wbr />
          <span className="inline-block max-w-full font-medium">
            <SkeletonText>{productSlug}</SkeletonText>
          </span>
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
  );
}

// A toned block as large as a secondary button with this label. Not
// `ButtonSkeleton`: that one is marked as a control, and the geometry check
// lines marked blocks up with submit buttons, which this part has none of.
function ButtonBlock({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-transparent bg-surface-muted px-4 py-3 text-sm font-medium text-transparent select-none">
      {children}
    </span>
  );
}
