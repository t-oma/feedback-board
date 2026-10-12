import type { ReactNode } from "react";

type FormSkeletonProps = {
  children: ReactNode;
};

// The column of `Form`. Each skeleton's geometry stories check that a form
// does not move when it replaces its skeleton.
export function FormSkeleton({ children }: FormSkeletonProps) {
  return <div className="flex w-full flex-col gap-y-4.5">{children}</div>;
}
