import { type BoardView, DEFAULT_BOARD_VIEW } from "./contracts";

export type BoardHref = `/p/${string}` | `/p/${string}?${string}`;

// The bare address is the default view, the one a board is shared under, so
// a link back to it carries no query.
export function boardHref(
  slug: string,
  { status, sort }: BoardView,
): BoardHref {
  const searchParams = new URLSearchParams();

  if (status !== DEFAULT_BOARD_VIEW.status) searchParams.set("status", status);
  if (sort !== DEFAULT_BOARD_VIEW.sort) searchParams.set("sort", sort);

  const query = searchParams.toString();
  return query === "" ? `/p/${slug}` : `/p/${slug}?${query}`;
}
