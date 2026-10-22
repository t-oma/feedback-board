import { Menu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function MenuGroup(
  props: WithoutClassName<ComponentProps<typeof Menu.Group>>,
) {
  return <Menu.Group {...props} />;
}

// Names its group, so text that only says what the items are about is not
// loose inside the menu. Smaller and muted, so it does not read as one more
// item.
export function MenuGroupLabel(
  props: WithoutClassName<ComponentProps<typeof Menu.GroupLabel>>,
) {
  return (
    <Menu.GroupLabel
      {...props}
      className="px-3 pt-2 pb-2 text-xs text-foreground-muted"
    />
  );
}
