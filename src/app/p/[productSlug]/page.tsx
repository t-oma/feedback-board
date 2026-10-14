import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/entities/product/queries.server";

import { Board } from "./_ui/board";

type BoardPageProps = PageProps<"/p/[productSlug]">;

// An unknown slug gets the root not-found page. Behind `loading.tsx` the page
// has already started streaming by then, so the status stays 200 and Next.js
// adds a `noindex` tag instead.
async function getBoardProduct(params: BoardPageProps["params"]) {
  const { productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (product === null) notFound();

  return product;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const product = await getBoardProduct(params);

  return { title: product.name };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const product = await getBoardProduct(params);

  return <Board productName={product.name} description={product.description} />;
}
