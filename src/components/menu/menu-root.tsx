import { Menu } from "@base-ui/react/menu";
import type { ComponentProps } from "react";

export function MenuRoot(props: ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />;
}
