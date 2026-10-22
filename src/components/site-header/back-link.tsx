import { ArrowLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

// Generic over the route for the reason `Link` in `src/components/link` gives.
type BackLinkProps<RouteType extends string> = {
  href: Route<RouteType>;
  label: string;
};

// Below `sm` it takes the brand's serif, as the mobile design draws the way
// back; from `sm` up it is muted, as the desktop design draws it. The ring is
// drawn inside: the link fills the height of its row, and below `sm` that row
// is the top of the page, so an outer ring would run past the viewport.
export function BackLink<RouteType extends string>({
  href,
  label,
}: BackLinkProps<RouteType>) {
  return (
    <Link
      href={href}
      className="-mx-2 flex h-full min-w-0 items-center gap-x-2 rounded-sm px-2 font-serif font-semibold focus-ring-inside sm:font-sans sm:text-sm sm:font-normal sm:text-foreground-muted"
    >
      <ArrowLeftIcon aria-hidden="true" size={20} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function BackLinkSkeleton() {
  return (
    <span aria-hidden="true" className="h-5 w-44 rounded-md bg-surface-muted" />
  );
}
