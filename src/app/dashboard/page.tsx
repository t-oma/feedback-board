import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { Link } from "@/components/link";
import { PageMain } from "@/components/page-main";
import { getOwnerProduct } from "@/entities/product/queries.server";
import { requireSession } from "@/entities/user/session.server";
import { env } from "@/server/env";

import { OwnerOverview } from "./_ui/owner-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  const session = await requireSession({ returnTo: "/dashboard" });
  const product = await getOwnerProduct(session.user.id);

  if (product === null) {
    // An account without a board is an ordinary one, such as a person who
    // signed up to vote, so the page offers a board rather than sending them
    // to the form.
    return (
      <PageMain align="center">
        <EmptyState
          title="You don’t have a board yet"
          description="Create one to start collecting feedback."
          headingLevel={1}
        >
          <Link variant="primary" href="/dashboard/new">
            Create your board
          </Link>
        </EmptyState>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <OwnerOverview
        productName={product.name}
        productSlug={product.slug}
        // The deployment's own origin, the one `parseReturnTo` compares
        // against, so the public address does not depend on the request.
        origin={new URL(env.BETTER_AUTH_URL).origin}
      />
    </PageMain>
  );
}
