import "server-only";

import { db } from "@/server/db";

export async function getOwnerProduct(ownerId: string) {
  const product = await db.query.products.findFirst({ where: { ownerId } });

  return product ?? null;
}
