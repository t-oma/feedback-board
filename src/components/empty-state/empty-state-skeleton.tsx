import { SkeletonText } from "../skeleton";

type EmptyStateSkeletonProps = {
  title: string;
  description: string;
};

// The title and description only. An eyebrow or actions would need blocks of
// their own.
export function EmptyStateSkeleton({
  title,
  description,
}: EmptyStateSkeletonProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <p className="font-serif text-lg font-semibold">
        <SkeletonText>{title}</SkeletonText>
      </p>
      <p className="max-w-72 text-sm wrap-anywhere">
        <SkeletonText>{description}</SkeletonText>
      </p>
    </div>
  );
}
