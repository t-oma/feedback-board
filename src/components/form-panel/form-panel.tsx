import type { ReactNode } from "react";

type FormPanelProps = {
  children: ReactNode;
};

// The column a page's form sits in, inside `PageMain align="stretch"`. Below
// `sm` it is a band of the surface from edge to edge and down to the bottom of
// the screen, its content on the layout grid's content area. From `sm` up it
// is a card of 440px of content, centred, rather than the mobile layout
// stretched across a tablet. `box-content` because the design file renders
// with `content-box`, so 440px is the width of the card's content, not of its
// border box.
//
// `overflow-x-clip` stops content that moves in from the side at the panel's
// edge instead of widening the page.
export function FormPanel({ children }: FormPanelProps) {
  return (
    <div className="layout-subgrid content-start gap-y-5 overflow-x-clip bg-surface py-6 sm:col-content sm:mt-19 sm:mb-26 sm:box-content sm:flex sm:w-110 sm:flex-col sm:self-start sm:justify-self-center sm:rounded-[10px] sm:border sm:border-border-subtle sm:px-9 sm:pt-9.5 sm:pb-8.5 sm:shadow-xs">
      {children}
    </div>
  );
}
