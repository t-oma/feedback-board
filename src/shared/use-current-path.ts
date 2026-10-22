import { usePathname, useSearchParams } from "next/navigation";

// The path and the query of the page, such as `/p/orbit-cli?sort=top`, for a
// link or form that brings the visitor back here. `useSearchParams` needs a
// `Suspense` boundary above the caller.
export function useCurrentPath() {
  const pathname = usePathname();
  const query = useSearchParams().toString();

  return query === "" ? pathname : `${pathname}?${query}`;
}
