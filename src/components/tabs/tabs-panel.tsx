import { Tabs } from "@base-ui/react/tabs";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// Narrowed to `string` for the same reason as `TabsTab`.
type TabsPanelProps = Omit<
  WithoutClassName<ComponentProps<typeof Tabs.Panel>>,
  "value"
> & {
  value: string;
};

export function TabsPanel(props: TabsPanelProps) {
  return (
    <Tabs.Panel
      {...props}
      className={clsx(
        "col-start-1 row-start-1 flex w-full",
        "focus-ring focus-visible:z-1",
        "[transition:opacity_175ms_ease,translate_350ms_cubic-bezier(0.22,1,0.36,1)]",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
        "motion-safe:data-starting-style:data-[activation-direction=left]:translate-x-[-50%]",
        "motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-[50%]",
        "motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-[50%]",
        "motion-safe:data-ending-style:data-[activation-direction=right]:translate-x-[-50%]",
      )}
    />
  );
}
