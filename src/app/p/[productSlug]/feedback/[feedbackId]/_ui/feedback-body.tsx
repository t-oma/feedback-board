import { SkeletonText } from "@/components/skeleton";

type FeedbackBodyProps = {
  body: string;
};

// The body keeps the line breaks its author typed.
export function FeedbackBody({ body }: FeedbackBodyProps) {
  return (
    <p className="mt-3 max-w-2xl text-sm/relaxed wrap-anywhere whitespace-pre-line text-foreground-secondary sm:mt-6 sm:text-base/relaxed">
      {body}
    </p>
  );
}

export function FeedbackBodySkeleton({ body }: FeedbackBodyProps) {
  return (
    <p className="mt-3 max-w-2xl text-sm/relaxed wrap-anywhere whitespace-pre-line sm:mt-6 sm:text-base/relaxed">
      <SkeletonText>{body}</SkeletonText>
    </p>
  );
}
