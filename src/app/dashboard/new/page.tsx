import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { FormPanel } from "@/components/form-panel";
import { Link } from "@/components/link";
import { PageMain } from "@/components/page-main";
import { getOwnerProduct } from "@/entities/product/queries.server";
import { requireSession } from "@/entities/user/session.server";
import { CreateProductForm } from "@/features/create-product/ui/create-product-form";
import { env } from "@/server/env";

export const metadata: Metadata = {
  title: "Create your board",
};

export default async function NewBoard() {
  const session = await requireSession({ returnTo: "/dashboard/new" });
  const product = await getOwnerProduct(session.user.id);

  if (product !== null) {
    // Rendered rather than redirected: the page has already started
    // streaming, and a redirect from there reaches the browser as a
    // client-side navigation.
    return (
      <PageMain align="center">
        <EmptyState
          title="You already have a board"
          description="Each account has one board."
          headingLevel={1}
        >
          <Link variant="primary" href="/dashboard">
            Go to your board
          </Link>
        </EmptyState>
      </PageMain>
    );
  }

  return (
    <PageMain align="stretch">
      <FormPanel>
        {/* The deployment's own origin, the one `parseReturnTo` compares
          against, so the address prefix does not depend on the request. */}
        <CreateProductForm publicHost={new URL(env.BETTER_AUTH_URL).host} />
      </FormPanel>
    </PageMain>
  );
}
