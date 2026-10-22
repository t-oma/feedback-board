import { clsx } from "clsx";
import type { ReactNode } from "react";

type SiteHeaderProps = {
  // What the page belongs to: the brand, or a product.
  children: ReactNode;
  // Controls at the end of the bar.
  end?: ReactNode;
  // The way back, a `BackLink`.
  back?: ReactNode;
};

// A bar on the layout grid. With a way back, the mobile design puts it in the
// bar in place of what the page belongs to, and the desktop design on the
// first line under the bar. It renders once for each width, the other copy
// hidden, so that the Tab order follows the screen at both: one copy moved by
// the grid would come before the end at one width and after it at the other.
export function SiteHeader({ children, end, back }: SiteHeaderProps) {
  const hasBack = back !== undefined;

  return (
    <header className="layout-grid shrink-0">
      <div className="layout-subgrid h-15 border-b border-border bg-surface">
        <div className="flex min-w-0 items-center justify-between gap-x-4">
          {hasBack && (
            <div className="flex h-full min-w-0 items-center sm:hidden">
              {back}
            </div>
          )}
          <div
            className={clsx(
              "flex min-w-0 items-center",
              hasBack && "max-sm:hidden",
            )}
          >
            {children}
          </div>
          {end !== undefined && (
            <div className="flex shrink-0 items-center">{end}</div>
          )}
        </div>
      </div>
      {hasBack && (
        <div className="flex h-12 min-w-0 items-center max-sm:hidden">
          {back}
        </div>
      )}
    </header>
  );
}
