import { WithoutClassName } from "@/types";
import { Tabs } from "@base-ui/react/tabs";
import { ComponentProps } from "react";

export function TabsTab({
  children,
  value,
  ...props
}: WithoutClassName<ComponentProps<typeof Tabs.Tab>>) {
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
