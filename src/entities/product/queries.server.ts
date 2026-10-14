import "server-only";

import { cache } from "react";

import { db } from "@/server/db";

import { isProductSlug } from "./schemas";

export async function getOwnerProduct(ownerId: string) {
  const product = await db.query.products.findFirst({ where: { ownerId } });

  return product ?? null;
}

// One query per request, however many parts of a page ask for the same slug.
// A value that cannot be a slug names no product, so it is answered without
// one.
export const getProductBySlug = cache(async (slug: string) => {
  if (!isProductSlug(slug)) return null;

  const product = await db.query.products.findFirst({ where: { slug } });

  return product ?? null;
});
