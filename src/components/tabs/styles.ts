import { tv } from "tailwind-variants";

// Every part of the tabs. With `skeleton`, a tab keeps the classes that place
// and size it and drops its states; the `Skeleton` story checks that a
// skeleton built from these slots lines up with the tabs.
export const tabsStyles = tv({
  slots: {
    list: "relative z-1 flex gap-x-2 rounded-lg border border-border-subtle bg-surface-muted p-1",
    tab: "inline-flex flex-1 items-center justify-center rounded-lg px-4 py-3 text-sm",
    indicator:
      "absolute top-1 left-0 -z-1 h-[calc(100%-(--spacing(2)))] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-surface shadow-2xs transition-[translate,width] duration-150 ease-in-out",
    content: "relative grid min-h-32 grid-cols-1 pt-5",
    panel: [
      "col-start-1 row-start-1 flex w-full focus-visible:z-1",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "[transition:opacity_175ms_ease,translate_350ms_cubic-bezier(0.22,1,0.36,1)]",
      "data-starting-style:opacity-0 data-ending-style:opacity-0",
      "motion-safe:data-starting-style:data-[activation-direction=left]:translate-x-[-50%]",
      "motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-[50%]",
      "motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-[50%]",
      "motion-safe:data-ending-style:data-[activation-direction=right]:translate-x-[-50%]",
    ],
  },
  variants: {
    skeleton: {
      false: {
        tab: "bg-transparent transition-[colors,font] duration-150 ease-in-out focus-visible:outline-accent data-active:font-semibold",
      },
    },
    // A skeleton has no indicator, so its active tab carries the indicator's
    // surface itself.
    active: {
      true: {
        tab: "rounded-md bg-surface font-semibold shadow-2xs",
      },
    },
  },
  defaultVariants: {
    skeleton: false,
  },
});
