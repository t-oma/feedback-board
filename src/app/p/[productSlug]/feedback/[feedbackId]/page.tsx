import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { feedbackHref } from "@/entities/feedback/feedback-href";
import { getVisibleFeedback } from "@/entities/feedback/queries.server";
import { getProductBySlug } from "@/entities/product/queries.server";
import { appOrigin } from "@/server/env";
import { ViewerControl } from "@/widgets/viewer/ui/viewer-control";

import { FeedbackDetail } from "./_ui/feedback-detail";

type FeedbackPageProps = PageProps<"/p/[productSlug]/feedback/[feedbackId]">;

// A hidden item and an item of another board get the same not-found page as an
// unknown one, so a link cannot tell them apart. As on the board, the page has
// started streaming by then, so the status stays 200 with a `noindex` tag.
async function getPageFeedback(params: FeedbackPageProps["params"]) {
  const { productSlug, feedbackId } = await params;
  const product = await getProductBySlug(productSlug);
  if (product === null) notFound();

  const feedback = await getVisibleFeedback(product.id, feedbackId);
  if (feedback === null) notFound();

  return { product, feedback };
}

export async function generateMetadata({
  params,
}: FeedbackPageProps): Promise<Metadata> {
  const { feedback } = await getPageFeedback(params);

  return { title: feedback.title };
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { product, feedback } = await getPageFeedback(params);
  const path = feedbackHref(product.slug, feedback.id);

  return (
    <FeedbackDetail
      productName={product.name}
      productSlug={product.slug}
      feedback={feedback}
      url={new URL(path, appOrigin).href}
      viewer={<ViewerControl />}
    />
  );
}
