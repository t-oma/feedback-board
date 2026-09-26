export type ButtonVariant = "primary" | "secondary";

// State styles key on `data-disabled`, which Base UI sets both for a natively
// disabled button and for a pending one. A pending button is only
// `aria-disabled`, so `:disabled` would miss it.
const baseClassName =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-accent/20 not-data-disabled:active:scale-98 data-disabled:cursor-not-allowed motion-safe:transition-[background-color,scale]";

const variantClassNames = {
  primary:
    "bg-accent text-surface not-data-disabled:hover:bg-accent/90 data-disabled:bg-accent-muted",
  secondary:
    "border border-border bg-surface text-foreground-secondary not-data-disabled:hover:bg-surface-muted data-disabled:border-border-subtle data-disabled:bg-background data-disabled:text-foreground-disabled",
} satisfies Record<ButtonVariant, string>;

export function buttonClassName(variant: ButtonVariant) {
  return `${baseClassName} ${variantClassNames[variant]}`;
}
