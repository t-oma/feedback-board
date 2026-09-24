import { Tabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function TabsRoot(
  props: WithoutClassName<ComponentProps<typeof Tabs.Root>>,
) {
  return <Tabs.Root {...props} />;
}
