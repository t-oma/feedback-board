// The classes that decide where the tab strip, its tabs and the panel area sit
// and how tall they are. The parts and `Tabs.Skeleton` both take them from
// here; the `Skeleton` story checks that the two line up.
export const listClassName =
  "relative z-1 flex gap-x-2 rounded-lg border border-border-subtle bg-surface-muted p-1";
export const tabClassName =
  "inline-flex flex-1 items-center justify-center px-4 py-3 text-sm";
export const contentClassName = "relative grid min-h-32 grid-cols-1 pt-5";
