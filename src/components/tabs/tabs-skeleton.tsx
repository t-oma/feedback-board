import type { ReactNode } from "react";

import { SkeletonText } from "../skeleton";
import { tabsStyles } from "./styles";

type TabsSkeletonProps = {
  // The names of the tabs. The first stands in for the active one.
  labels: readonly [string, ...string[]];
  // What stands in for the active panel.
  children: ReactNode;
};

export function TabsSkeleton({ labels, children }: TabsSkeletonProps) {
  const { list, tab, content } = tabsStyles({ skeleton: true });

  return (
    <div>
      <div className={list()}>
        {labels.map((label, index) => (
          <div
            key={label}
            data-skeleton-control
            className={tab({ active: index === 0 })}
          >
            <span>
              <SkeletonText>{label}</SkeletonText>
            </span>
          </div>
        ))}
      </div>
      <div className={content()}>{children}</div>
    </div>
  );
}
