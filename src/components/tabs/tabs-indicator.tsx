import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { tabsStyles } from "./styles";

export function TabsIndicator({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.Indicator>>) {
  return (
    <Tabs.Indicator {...props} className={tabsStyles().indicator()}>
      {children}
    </Tabs.Indicator>
  );
}
