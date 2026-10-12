import type { ReactNode } from "react";

import { SkeletonText } from "../skeleton";
import { contentClassName, listClassName, tabClassName } from "./geometry";

type TabsSkeletonProps = {
  // The names of the tabs. The first stands in for the active one, with the
  // indicator's surface under it.
  labels: readonly [string, ...string[]];
  // What stands in for the active panel.
  children: ReactNode;
};

export function TabsSkeleton({ labels, children }: TabsSkeletonProps) {
  return (
    <div>
      <div className={listClassName}>
        {labels.map((label, index) => (
          <div
            key={label}
            data-skeleton-control
            className={
              index === 0
                ? `${tabClassName} rounded-md bg-surface font-semibold shadow-2xs`
                : tabClassName
            }
          >
            <span>
              <SkeletonText>{label}</SkeletonText>
            </span>
          </div>
        ))}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
