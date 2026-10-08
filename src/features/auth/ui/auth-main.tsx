import type { ReactNode } from "react";

type AuthMainProps = {
  children: ReactNode;
};

export function AuthMain({ children }: AuthMainProps) {
  // From `sm` up `main` is the card. `box-content` because the design's 440px
  // is the width of the card's content, not of its border box.
  return (
    <main className="flex flex-1 flex-col gap-y-5 overflow-x-clip bg-surface px-5 py-6 sm:mt-19 sm:mb-26 sm:box-content sm:w-110 sm:flex-none sm:self-center sm:rounded-[10px] sm:border sm:border-border-subtle sm:px-9 sm:pt-9.5 sm:pb-8.5 sm:shadow-xs">
      {children}
    </main>
  );
}
