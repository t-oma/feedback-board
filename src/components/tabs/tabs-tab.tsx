import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { tabsStyles } from "./styles";

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
    <Tabs.Tab {...props} value={value} className={tabsStyles().tab()}>
      {children}
    </Tabs.Tab>
  );
}
