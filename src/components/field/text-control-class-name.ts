// The frame, focus ring, and read-only and invalid states every control that
// takes typed text shares, so a single-line field and a multi-line one cannot
// drift apart. 16px text below `md`: iOS Safari zooms the page in when a field
// with smaller text gets focus, and the page stays zoomed after the keyboard
// closes. The `OnPhone` story checks it.
export const textControlClassName =
  "min-w-0 rounded-lg border border-border bg-surface px-3 text-base transition-colors read-only:border-border-subtle read-only:bg-surface-muted read-only:text-foreground-subtle focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-hidden data-invalid:border-danger data-invalid:bg-danger-surface md:text-sm";
