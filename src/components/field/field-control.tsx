import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function FieldControl({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Control>>) {
  // 16px text below `md`: iOS Safari zooms the page in when a field with
  // smaller text gets focus, and the page stays zoomed after the keyboard
  // closes. The `OnPhone` story checks it.
  return (
    <Field.Control
      {...props}
      className="h-12 min-w-0 rounded-lg border border-border bg-surface px-3 py-0 text-base transition-colors read-only:border-border-subtle read-only:bg-surface-muted read-only:text-foreground-subtle focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-hidden data-invalid:border-danger data-invalid:bg-danger-surface md:text-sm"
    >
      {children}
    </Field.Control>
  );
}
