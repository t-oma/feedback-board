import { SkeletonText } from "@/components/skeleton";

type BoardHeaderProps = {
  productName: string;
};

// The design also puts a sign-in control on the right of the bar. It is left
// out while nothing on the board needs a session.
export function BoardHeader({ productName }: BoardHeaderProps) {
  return (
    <header className="flex h-15 shrink-0 items-center border-b border-border bg-surface px-5 sm:px-10">
      <p className="flex min-w-0 items-baseline gap-x-2.5">
        <span className="truncate font-serif font-semibold">{productName}</span>
        <span className="font-mono text-xs text-foreground-subtle">
          feedback
        </span>
      </p>
    </header>
  );
}

export function BoardHeaderSkeleton({ productName }: BoardHeaderProps) {
  return (
    <header className="flex h-15 shrink-0 items-center border-b border-border bg-surface px-5 sm:px-10">
      <p aria-hidden="true" className="flex min-w-0 items-baseline gap-x-2.5">
        <span className="truncate font-serif font-semibold">
          <SkeletonText>{productName}</SkeletonText>
        </span>
        <span className="font-mono text-xs">
          <SkeletonText>feedback</SkeletonText>
        </span>
      </p>
    </header>
  );
}
