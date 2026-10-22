import { Menu } from "@base-ui/react/menu";
import type { ReactNode } from "react";

type MenuPopupProps = {
  children: ReactNode;
};

// Below the trigger and lined up with its end, held to the width left between
// the trigger and the edge of the screen.
export function MenuPopup({ children }: MenuPopupProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner side="bottom" align="end" sideOffset={8}>
        <Menu.Popup className="max-w-[min(20rem,var(--available-width))] min-w-56 origin-(--transform-origin) rounded-lg border border-border bg-surface py-1 shadow-md outline-hidden data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 motion-safe:transition-[scale,opacity] motion-safe:duration-100 motion-safe:ease-out">
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}
