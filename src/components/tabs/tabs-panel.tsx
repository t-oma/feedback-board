import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { tabsStyles } from "./styles";

// Narrowed to `string` for the same reason as `TabsTab`.
type TabsPanelProps = Omit<
  WithoutClassName<ComponentProps<typeof Tabs.Panel>>,
  "value"
> & {
  value: string;
};

export function TabsPanel({ children, value, ...props }: TabsPanelProps) {
  return (
    <Tabs.Panel {...props} value={value} className={tabsStyles().panel()}>
      {children}
    </Tabs.Panel>
  );
}
