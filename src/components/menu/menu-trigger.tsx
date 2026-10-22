import { Menu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// A round trigger as tall as a button, for a menu opened from an icon or an
// avatar.
export function MenuTrigger(
  props: WithoutClassName<ComponentProps<typeof Menu.Trigger>>,
) {
  return (
    <Menu.Trigger
      {...props}
      className="inline-grid size-12 shrink-0 place-items-center rounded-full focus-ring hover:bg-surface-muted data-popup-open:bg-surface-muted motion-safe:transition-[background-color]"
    />
  );
}
