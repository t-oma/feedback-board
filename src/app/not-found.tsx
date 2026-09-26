import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { Link } from "@/components/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col justify-center px-5 py-12">
      <EmptyState
        eyebrow="404"
        title="This page doesn’t exist"
        description="The link may be wrong, or the board may have moved to a new address."
        headingLevel={1}
      >
        <Link variant="secondary" href="/">
          Go to the landing page
        </Link>
      </EmptyState>
    </main>
  );
}
