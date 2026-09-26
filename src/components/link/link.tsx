import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import type { ComponentProps } from "react";

import { buttonClassName, type ButtonVariant } from "../button/variants";
import type { WithoutClassName } from "../types";

// Generic over the route in the same way `next/link` is. With `typedRoutes`
// on, `next/link` checks `href` against `RouteImpl<RouteType>`, and a wrapper
// that fixed the parameter would accept only static routes.
type LinkProps<RouteType> = WithoutClassName<
  NextLinkProps<RouteType> &
    Omit<ComponentProps<"a">, keyof NextLinkProps<RouteType>>
> & {
  variant: ButtonVariant;
};

export function Link<RouteType>({ variant, ...props }: LinkProps<RouteType>) {
  return <NextLink {...props} className={buttonClassName(variant)} />;
}
