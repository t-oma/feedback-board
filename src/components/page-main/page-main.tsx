import { clsx } from "clsx";
import type { ReactNode } from "react";

type PageMainProps = {
  // `center` for a page that holds a single message, such as not-found:
  // it sits in the middle of the screen rather than under the header.
  align?: "start" | "center";
  children: ReactNode;
};

// A page's `main` on the layout grid. Each child sits in its `content` area
// unless it asks for `col-full` or is a `layout-subgrid` band. A header laid out
// on the same grid lines up with it at every width.
export function PageMain({ align = "start", children }: PageMainProps) {
  return (
    <main
      className={clsx(
        "layout-grid flex-1",
        align === "center" ? "content-center py-12" : "content-start",
      )}
    >
      {children}
    </main>
  );
}
