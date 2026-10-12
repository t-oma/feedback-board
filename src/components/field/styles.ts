import { tv } from "tailwind-variants";

// Every part of a field. With `skeleton`, the classes that place and size a
// part stay and its colours go, so a skeleton built from these slots takes
// the part's room; the `Skeleton` stories check that the two line up.
export const fieldStyles = tv({
  slots: {
    root: "flex flex-col gap-2",
    label: "text-sm font-medium",
    labelRow: "flex items-baseline justify-between gap-3",
    counter: "shrink-0 font-mono text-xs",
    // The count before the slash.
    current: "",
    description: "font-mono text-xs/normal",
    error: "flex items-start gap-1.5 text-sm font-medium text-danger",
    errorIcon: "mt-0.5 size-4 shrink-0",
    passwordControl: "relative w-full [&>input]:w-full [&>input]:pr-12",
    // Not `transition-colors`: that also animates `outline-color`, so the
    // focus ring would fade in from the icon colour instead of appearing in
    // `accent`.
    passwordToggle:
      "absolute inset-y-px right-px inline-flex w-12 items-center justify-center rounded-r-[7px] text-foreground-subtle hover:bg-surface-muted hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-safe:transition-[color,background-color]",
  },
  variants: {
    skeleton: {
      false: {
        label: "text-foreground-secondary",
        counter: "text-foreground-subtle",
        // The error takes the hint's place, as in the design's error
        // examples, so the two never say much the same thing one under the
        // other.
        description: "text-foreground-subtle data-invalid:hidden",
      },
    },
    // Past the maximum the count is underlined as well as red: the red is
    // about as dark as the resting grey, 1.45:1, and small text barely shows
    // a change of hue. An invalid field leaves the count alone, since its
    // error need not be about length.
    overMaximum: {
      true: {
        current: "text-danger underline decoration-wavy underline-offset-2",
      },
    },
  },
  defaultVariants: {
    skeleton: false,
  },
});

// The frame, focus ring, and read-only and invalid states every control that
// takes typed text shares, so a single-line field and a multi-line one cannot
// drift apart. 16px text below `md`: iOS Safari zooms the page in when a field
// with smaller text gets focus, and the page stays zoomed after the keyboard
// closes. The `OnPhone` story checks it.
export const textControlStyles = tv({
  base: "min-w-0 rounded-lg border border-border bg-surface px-3 text-base transition-colors read-only:border-border-subtle read-only:bg-surface-muted read-only:text-foreground-subtle focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-hidden data-invalid:border-danger data-invalid:bg-danger-surface md:text-sm",
  variants: {
    kind: {
      input: "h-12 py-0",
      // Resizing is vertical only, since a wider box would break the column.
      textarea: "min-h-22 resize-y py-2.5",
    },
    // The control's box in the paper tone, for a skeleton.
    skeleton: {
      true: "border-transparent bg-surface-muted",
    },
  },
});
