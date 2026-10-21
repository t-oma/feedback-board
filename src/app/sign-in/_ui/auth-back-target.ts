import type { Route } from "next";

import { PRODUCT_SLUG_PATTERN } from "@/entities/product/contracts";

export type AuthBackTarget =
  | { kind: "home"; href: Route }
  | { kind: "board"; href: Route; slug: string }
  | { kind: "feedback"; href: Route }
  | { kind: "changelog"; href: Route };

const boardPathPattern = new RegExp(
  `^/p/(${PRODUCT_SLUG_PATTERN})(?:/(changelog|feedback/[^/]+))?/?$`,
);

export function getAuthBackTarget(returnTo: Route | null): AuthBackTarget {
  const pathname = returnTo?.split(/[?#]/, 1)[0] ?? "";
  const match = boardPathPattern.exec(pathname);

  const [, slug, section] = match ?? [];

  if (returnTo === null || !slug) {
    return { kind: "home", href: "/" };
  }

  if (section === "changelog") {
    return { kind: "changelog", href: returnTo };
  }

  if (section) {
    return { kind: "feedback", href: returnTo };
  }

  return { kind: "board", href: returnTo, slug };
}
