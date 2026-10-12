import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { tabClassName } from "./geometry";

// Base UI declares a tab value as `any`, which accepts a number, an object or
// `undefined` without complaint. Narrowing it to `string` rejects those. It
// does not catch a typo: every string still passes.
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
      className={`${tabClassName} rounded-lg bg-transparent transition-[colors,font] duration-150 ease-in-out focus-visible:outline-accent data-active:font-semibold`}
    >
      {children}
    </Tabs.Tab>
  );
}
