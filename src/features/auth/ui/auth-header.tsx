import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { AuthBackTarget } from "../navigation";

type AuthHeaderProps = {
  backTarget: AuthBackTarget;
};

export function AuthHeader({ backTarget }: AuthHeaderProps) {
  return (
    <AuthHeaderFrame>
      {/* The ring is drawn inside: the link fills the bar, and below `md` the
          bar is the top of the page, so an outer ring would run past the
          viewport. */}
      <Link
        href={backTarget.href}
        className="-mx-2 flex h-full min-w-0 items-center gap-x-2 rounded-sm px-2 font-serif font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:font-sans md:text-sm md:font-normal md:text-foreground-muted"
      >
        <ArrowLeftIcon aria-hidden="true" size={20} className="shrink-0" />
        <span className="truncate">{getBackLabel(backTarget)}</span>
      </Link>
    </AuthHeaderFrame>
  );
}

export function AuthHeaderSkeleton() {
  return (
    <AuthHeaderFrame>
      <span
        aria-hidden="true"
        className="h-5 w-44 rounded-md bg-surface-muted"
      />
    </AuthHeaderFrame>
  );
}

function getBackLabel(target: AuthBackTarget): string {
  switch (target.kind) {
    case "home":
      return "Back to Feedback Board";
    case "board":
      return `Back to ${target.slug}`;
    case "feedback":
      return "Back to feedback";
    case "changelog":
      return "Back to changelog";
  }
}

function AuthHeaderFrame({ children }: { children: ReactNode }) {
  return (
    <header className="shrink-0">
      <div className="hidden h-15 items-center border-b border-border bg-surface px-5 md:flex">
        <Link
          href="/"
          className="rounded-sm font-serif font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Feedback Board
        </Link>
      </div>
      <nav
        aria-label="Exit authentication"
        className="flex h-12 items-center border-b border-border bg-surface px-5 md:border-b-0"
      >
        {children}
      </nav>
    </header>
  );
}
