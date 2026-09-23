import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function TabsIndicator({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.Indicator>>) {
  return (
    <Tabs.Indicator
      {...props}
      className="absolute top-1 left-0 -z-1 h-[calc(100%-(--spacing(2)))] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-surface shadow-2xs transition-[translate,width] duration-150 ease-in-out"
    >
      {children}
    </Tabs.Indicator>
  );
}
