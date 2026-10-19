import Link from "next/link";

export function BrandLink() {
  return (
    <Link
      href="/"
      className="rounded-sm font-serif font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Feedback Board
    </Link>
  );
}
