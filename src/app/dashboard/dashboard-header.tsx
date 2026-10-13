import Link from "next/link";

import { signOutAction } from "@/features/sign-out/actions";
import { SignOutButton } from "@/features/sign-out/ui/sign-out-button";

export function DashboardHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center justify-between gap-x-4 border-b border-border bg-surface px-5">
      <Link
        href="/"
        className="rounded-sm font-serif font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Feedback Board
      </Link>

      <form action={signOutAction}>
        <SignOutButton />
      </form>
    </header>
  );
}
