import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// The create-product action redirects here with `?created=1`. The notice
// belongs to that visit: the parameter is read once and then dropped from the
// address, so a reload or a shared link does not announce the board again.
export function useCreatedNotice(): string | null {
  const searchParams = useSearchParams();
  const [created] = useState(() => searchParams.has("created"));

  // `replaceState` changes the address without a request; Next.js keeps its
  // router in step with it.
  useEffect(() => {
    if (!created) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("created");
    window.history.replaceState(null, "", url);
  }, [created]);

  return created ? "Your board is live" : null;
}
