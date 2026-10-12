import type { ReactNode } from "react";

import { SkeletonText } from "../skeleton";

type TabsSkeletonProps = {
  // The names of the tabs. The first stands in for the active one, with the
  // indicator's surface under it.
  labels: readonly [string, ...string[]];
  // What stands in for the active panel.
  children: ReactNode;
};

// The strip, its tabs and the panel area repeat the classes that place and
// size `Tabs.List`, `Tabs.Tab` and `Tabs.Content`. The `Skeleton` story
// checks that the two line up.
export function TabsSkeleton({ labels, children }: TabsSkeletonProps) {
  return (
    <div>
      <div className="flex gap-x-2 rounded-lg border border-border-subtle bg-surface-muted p-1">
        {labels.map((label, index) => (
          <div
            key={label}
            data-skeleton-control
            className={`inline-flex flex-1 items-center justify-center px-4 py-3 text-sm ${index === 0 ? "rounded-md bg-surface font-semibold shadow-2xs" : ""}`}
          >
            <span>
              <SkeletonText>{label}</SkeletonText>
            </span>
          </div>
        ))}
      </div>
      <div className="grid min-h-32 grid-cols-1 pt-5">{children}</div>
    </div>
  );
}
