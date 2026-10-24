import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SkeletonText } from "@/components/skeleton";

type BoardHeaderProps = {
  productName: string;
  viewer: ReactNode;
};

// The design follows the name with a `feedback` tag, left out so that the name
// keeps the room beside the bar's controls on a phone.
export function BoardHeader({ productName, viewer }: BoardHeaderProps) {
  return (
    <SiteHeader end={viewer}>
      <p className="truncate font-serif font-semibold">{productName}</p>
    </SiteHeader>
  );
}

// The viewer is not known while the board loads, and most visitors of a board
// are guests, so the end of the bar stays empty rather than guess.
export function BoardHeaderSkeleton({
  productName,
}: Pick<BoardHeaderProps, "productName">) {
  return (
    <SiteHeader>
      <p aria-hidden="true" className="truncate font-serif font-semibold">
        <SkeletonText>{productName}</SkeletonText>
      </p>
    </SiteHeader>
  );
}
