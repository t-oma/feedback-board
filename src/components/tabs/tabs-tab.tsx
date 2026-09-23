import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// Base UI declares a tab value as `any`, so a typo in one would pass every
// check in the project. These wrappers narrow it to the strings the
// application actually uses.
type TabsTabProps = Omit<
  WithoutClassName<ComponentProps<typeof Tabs.Tab>>,
  "value"
> & {
  value: string;
};

export function TabsTab({ children, value, ...props }: TabsTabProps) {
  return (
    <Tabs.Tab
      {...props}
      value={value}
      className="inline-flex flex-1 items-center justify-center rounded-lg bg-transparent px-4 py-3 text-sm transition-[colors,font] duration-150 ease-in-out focus-visible:outline-accent data-active:font-semibold"
    >
      {children}
    </Tabs.Tab>
  );
}
