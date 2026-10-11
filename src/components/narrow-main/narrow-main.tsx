import type { ReactNode } from "react";

type NarrowMainProps = {
  children: ReactNode;
};

// One column of content, at most 440px wide. From `sm` up `main` is a card
// rather than the mobile layout stretched across a tablet. `box-content`
// because the design file renders with `content-box`, so 440px is the width
// of the card's content, not of its border box.
//
// `overflow-x-clip` stops content that moves in from the side at the card's
// edge instead of widening the page.
export function NarrowMain({ children }: NarrowMainProps) {
  return (
    <main className="flex flex-1 flex-col gap-y-5 overflow-x-clip bg-surface px-5 py-6 sm:mt-19 sm:mb-26 sm:box-content sm:w-110 sm:flex-none sm:self-center sm:rounded-[10px] sm:border sm:border-border-subtle sm:px-9 sm:pt-9.5 sm:pb-8.5 sm:shadow-xs">
      {children}
    </main>
  );
}
