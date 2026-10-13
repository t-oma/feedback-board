import type { Metadata } from "next";

import { NarrowMain } from "@/components/narrow-main";
import { requireSession } from "@/entities/user/session.server";
import { getOwnerProduct } from "@/features/products/queries.server";
import { CreateProductForm } from "@/features/products/ui/create-product-form";
import { CreateProductProvider } from "@/features/products/ui/create-product-provider";
import { OwnerOverview } from "@/features/products/ui/owner-overview";
import { env } from "@/server/env";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  const session = await requireSession({ returnTo: "/dashboard" });
  const product = await getOwnerProduct(session.user.id);

  // The deployment's own origin, the one `parseReturnTo` compares against, so
  // the public address does not depend on the request's headers.
  const origin = new URL(env.BETTER_AUTH_URL);

  return (
    <NarrowMain>
      <CreateProductProvider>
        {product === null ? (
          <CreateProductForm publicHost={origin.host} />
        ) : (
          <OwnerOverview
            productName={product.name}
            publicUrl={new URL(`/p/${product.slug}`, origin).href}
          />
        )}
      </CreateProductProvider>
    </NarrowMain>
  );
}
