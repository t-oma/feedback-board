import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

type AuthHeaderProps = {
  goBackText?: string;
};

export function AuthHeader({ goBackText = "Feedback Board" }: AuthHeaderProps) {
  return (
    <header className="h-12 border-b border-border bg-surface px-5">
      <Link
        href="/"
        aria-label={`Go back to ${goBackText}`}
        className="flex h-full items-center gap-x-2"
      >
        <ArrowLeftIcon size={20} />

        <span className="font-serif font-semibold">{goBackText}</span>
      </Link>
    </header>
  );
}
