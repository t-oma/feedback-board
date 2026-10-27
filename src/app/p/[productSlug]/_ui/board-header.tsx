import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { SkeletonText } from "@/components/skeleton";

type BoardHeaderProps = {
  productName: string;
  viewer: ReactNode;
  // The way back, on a page below the board.
  back?: ReactNode;
};

// The design follows the name with a `feedback` tag, left out so that the name
// keeps the room beside the bar's controls on a phone.
export function BoardHeader({ productName, viewer, back }: BoardHeaderProps) {
  return (
    <SiteHeader end={viewer} back={back}>
      <p className="truncate font-serif font-semibold">{productName}</p>
    </SiteHeader>
  );
}

// The viewer is not known while the board loads, and most visitors of a board
// are guests, so the end of the bar stays empty rather than guess.
export function BoardHeaderSkeleton({
  productName,
  back,
}: Pick<BoardHeaderProps, "productName" | "back">) {
  return (
    <SiteHeader back={back}>
      <p aria-hidden="true" className="truncate font-serif font-semibold">
        <SkeletonText>{productName}</SkeletonText>
      </p>
    </SiteHeader>
  );
}
