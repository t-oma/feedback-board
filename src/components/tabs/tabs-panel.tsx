import { WithoutClassName } from "@/types";
import { Tabs } from "@base-ui/react/tabs";
import { ComponentProps } from "react";

export function TabsPanel({
  children,
  value,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.Panel>>) {
  return (
    <Tabs.Panel {...props} value={value} className={panelClassName}>
      {children}
    </Tabs.Panel>
  );
}

const panelClassName =
  "col-start-1 row-start-1 flex w-full outline-none focus-visible:z-1 " +
  "[transition:opacity_175ms_ease,translate_350ms_cubic-bezier(0.22,1,0.36,1)] " +
  "data-starting-style:opacity-0 data-ending-style:opacity-0 " +
  "motion-safe:data-starting-style:data-[activation-direction=left]:translate-x-[-50%] " +
  "motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-[50%] " +
  "motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-[50%] " +
  "motion-safe:data-ending-style:data-[activation-direction=right]:translate-x-[-50%]";
