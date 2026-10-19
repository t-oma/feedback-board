import { clsx } from "clsx";
import type { ReactNode } from "react";

type PageMainProps = {
  // `center` for a page that holds a single message, such as not-found: it
  // sits in the middle of the screen rather than under the header. `stretch`
  // for a page with one child that fills the screen's height, such as
  // `FormPanel` on a phone; with more than one, each would grow.
  align?: "start" | "center" | "stretch";
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
        align === "start" && "content-start",
        align === "center" && "content-center py-12",
      )}
    >
      {children}
    </main>
  );
}
