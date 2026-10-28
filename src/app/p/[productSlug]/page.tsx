import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/skeleton";
import type { BoardView } from "@/entities/feedback/contracts";
import {
  getBoardFeedback,
  getBoardStatusCounts,
} from "@/entities/feedback/queries.server";
import { parseBoardView } from "@/entities/feedback/schemas";
import { getProductBySlug } from "@/entities/product/queries.server";
import { ViewerControl } from "@/widgets/viewer/ui/viewer-control";

import { Board } from "./_ui/board";
import { BoardEmpty, BoardNoMatches } from "./_ui/board-empty";
import { BoardFeedbackBoundary } from "./_ui/board-feedback-boundary";
import { BoardFilters } from "./_ui/board-filters";
import { FeedbackList, FeedbackListSkeleton } from "./_ui/feedback-list";

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

type BoardFeedbackProps = {
  productId: string;
  productSlug: string;
  productName: string;
  view: BoardView;
};

async function BoardFeedbackItems({
  productId,
  productSlug,
  view,
}: Omit<BoardFeedbackProps, "productName">) {
  const feedback = await getBoardFeedback(productId, view);

  return <FeedbackList productSlug={productSlug} feedback={feedback} />;
}

async function BoardFeedback({
  productId,
  productSlug,
  productName,
  view,
}: BoardFeedbackProps) {
  const counts = await getBoardStatusCounts(productId);

  if (counts.all === 0) return <BoardEmpty productName={productName} />;

  return (
    <>
      <BoardFilters productSlug={productSlug} view={view} counts={counts} />
      {counts[view.status] === 0 ? (
        <BoardNoMatches productSlug={productSlug} total={counts.all} />
      ) : (
        <Suspense
          fallback={
            <Skeleton band label="Loading the feedback">
              <FeedbackListSkeleton />
            </Skeleton>
          }
        >
          <BoardFeedbackItems
            productId={productId}
            productSlug={productSlug}
            view={view}
          />
        </Suspense>
      )}
    </>
  );
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const product = await getBoardProduct(params);

  return { title: product.name };
}

export default async function BoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const product = await getBoardProduct(params);
  const view = parseBoardView(await searchParams);

  return (
    <Board
      productName={product.name}
      description={product.description}
      viewer={<ViewerControl />}
      feedback={
        // A boundary of its own for each view. A navigation keeps a boundary
        // that already shows content, so on the same boundary a click on a
        // filter would leave the old list on screen until the new one is
        // read; a new one shows the list's loading state once the counts are
        // read. An error in one view does not stay on the next either.
        <BoardFeedbackBoundary key={`${view.status}:${view.sort}`}>
          <BoardFeedback
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            view={view}
          />
        </BoardFeedbackBoundary>
      }
    />
  );
}
