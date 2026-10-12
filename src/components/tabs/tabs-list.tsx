import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { tabsStyles } from "./styles";

export function TabsList({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.List>>) {
  return (
    <Tabs.List {...props} className={tabsStyles().list()}>
      {children}
    </Tabs.List>
  );
}
