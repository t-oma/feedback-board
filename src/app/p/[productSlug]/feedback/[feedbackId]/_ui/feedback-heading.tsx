import { SkeletonText } from "@/components/skeleton";
import type { FeedbackStatus } from "@/entities/feedback/contracts";
import {
  StatusChip,
  StatusChipSkeleton,
} from "@/entities/feedback/ui/status-chip";

type FeedbackHeadingProps = {
  title: string;
  status: FeedbackStatus;
};

// The status reads after the title, and a phone draws it above, as the mobile
// design does.
export function FeedbackHeading({ title, status }: FeedbackHeadingProps) {
  return (
    <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-5">
      <h1 className="font-serif text-2xl font-semibold wrap-anywhere sm:max-w-lg sm:text-3xl">
        {title}
      </h1>
      <StatusChip status={status} />
    </div>
  );
}

export function FeedbackHeadingSkeleton({
  title,
  status,
}: FeedbackHeadingProps) {
  return (
    <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-5">
      <p className="font-serif text-2xl font-semibold wrap-anywhere sm:max-w-lg sm:text-3xl">
        <SkeletonText>{title}</SkeletonText>
      </p>
      <StatusChipSkeleton status={status} />
    </div>
  );
}
