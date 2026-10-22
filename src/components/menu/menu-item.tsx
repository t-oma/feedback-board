import { Menu } from "@base-ui/react/menu";
import type { Route } from "next";
import NextLink from "next/link";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// The highlight alone is 1.14:1 against the surface, short of the 3:1 a focus
// indicator needs, so a keyboard user also gets the ring. `w-full` is for an
// item rendered as a button, which is only as wide as its text otherwise.
// `cursor-pointer` is for an item rendered as a `div`, which the rule for
// buttons in `globals.css` does not reach; a disabled one shows what a
// disabled button does.
const menuItemClassName =
  "flex h-10 w-full cursor-pointer items-center px-3 text-sm select-none focus-ring-inside data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled data-highlighted:bg-surface-muted";

export function MenuItem(
  props: WithoutClassName<ComponentProps<typeof Menu.Item>>,
) {
  return <Menu.Item {...props} className={menuItemClassName} />;
}

// Generic over the route for the reason `Link` in `src/components/link` gives.
type MenuLinkItemProps<RouteType extends string> = Omit<
  WithoutClassName<ComponentProps<typeof Menu.LinkItem>>,
  "href" | "render"
> & {
  href: Route<RouteType>;
};

// Closes the menu on click, which Base UI's link item does not by default: a
// layout that holds the menu stays mounted across the navigation, so the menu
// would stay open over the next page.
export function MenuLinkItem<RouteType extends string>({
  href,
  closeOnClick = true,
  ...props
}: MenuLinkItemProps<RouteType>) {
  return (
    <Menu.LinkItem
      {...props}
      closeOnClick={closeOnClick}
      render={<NextLink href={href} />}
      className={menuItemClassName}
    />
  );
}

export function MenuSeparator() {
  return <Menu.Separator className="my-1 h-px bg-border-subtle" />;
}
