import { SiteHeader } from "@/components/site-header";
import { SkeletonText } from "@/components/skeleton";

type BoardHeaderProps = {
  productName: string;
};

// The design follows the name with a `feedback` tag, left out so that the name
// keeps the room beside the bar's controls on a phone. The design also puts a
// sign-in control on the right of the bar. It is left out while nothing on the
// board needs a session.
export function BoardHeader({ productName }: BoardHeaderProps) {
  return (
    <SiteHeader>
      <p className="truncate font-serif font-semibold">{productName}</p>
    </SiteHeader>
  );
}

export function BoardHeaderSkeleton({ productName }: BoardHeaderProps) {
  return (
    <SiteHeader>
      <p aria-hidden="true" className="truncate font-serif font-semibold">
        <SkeletonText>{productName}</SkeletonText>
      </p>
    </SiteHeader>
  );
}
