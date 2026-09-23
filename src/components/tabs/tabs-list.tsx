import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function TabsList({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.List>>) {
  return (
    <Tabs.List
      {...props}
      className="relative z-1 flex gap-x-2 rounded-lg border border-border-subtle bg-surface-muted p-1"
    >
      {children}
    </Tabs.List>
  );
}
