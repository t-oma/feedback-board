import type { ReactNode } from "react";

// The item and its loading state lay out through these, so the two cannot
// drift apart.

type FeedbackBandProps = {
  // `article` around the item, a plain block around its loading state.
  as: "article" | "div";
  children: ReactNode;
};

// Below `sm` the item sits on the surface, which runs to the edges of the
// screen as the mobile design draws it; from `sm` up, on the page's
// background.
export function FeedbackBand({ as: Element, children }: FeedbackBandProps) {
  return (
    <Element className="layout-subgrid bg-surface py-5 sm:bg-transparent sm:pt-7 sm:pb-12">
      {children}
    </Element>
  );
}

type FeedbackColumnsProps = {
  votes: ReactNode;
  children: ReactNode;
};

// The votes at the start, as tall as what they hold rather than the column
// beside them: a row stretches its items unless told otherwise.
export function FeedbackColumns({ votes, children }: FeedbackColumnsProps) {
  return (
    <div className="flex min-w-0 items-start gap-x-10">
      {votes}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

type FeedbackActionsProps = {
  children: ReactNode;
};

// Full width on a phone, as wide as its label from `sm` up.
export function FeedbackActions({ children }: FeedbackActionsProps) {
  return (
    <div className="mt-6 flex flex-col sm:mt-8 sm:items-start">{children}</div>
  );
}
