import { clsx } from "clsx";
import type { ReactNode } from "react";

type SkeletonProps = {
  // What is loading, for screen readers: "Loading sign-in".
  label: string;
  // On the layout grid: what it holds lays out as the page's own parts do,
  // a `layout-subgrid` band across the screen or the content area. Without
  // it, everything sits in the content area.
  band?: boolean;
  children: ReactNode;
};

// A loading state is announced as busy under its label, and everything it
// draws is hidden from assistive technology, since none of it can be read.
// The body puts the gap between its children that a page puts between the
// parts of its content; each skeleton's geometry stories check that it lines
// up. As a band it adds no gap: the bands it holds carry their own spacing.
export function Skeleton({ label, band = false, children }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={clsx(band && "layout-subgrid")}
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={clsx(band ? "layout-subgrid" : "flex flex-col gap-y-5")}
      >
        {children}
      </div>
    </div>
  );
}
