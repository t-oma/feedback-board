export type FeedbackHref = `/p/${string}/feedback/${string}`;

export function feedbackHref(
  productSlug: string,
  feedbackId: string,
): FeedbackHref {
  return `/p/${productSlug}/feedback/${feedbackId}`;
}
