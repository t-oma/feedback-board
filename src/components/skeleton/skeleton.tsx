import type { ReactNode } from "react";

type SkeletonProps = {
  // What is loading, for screen readers: "Loading sign-in".
  label: string;
  children: ReactNode;
};

// A loading state is announced as busy under its label, and everything it
// draws is hidden from assistive technology, since none of it can be read.
// The body puts the gap between its children that a page puts between the
// parts of its content; each skeleton's geometry stories check that it lines
// up.
export function Skeleton({ label, children }: SkeletonProps) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="flex flex-col gap-y-5">
        {children}
      </div>
    </div>
  );
}
