import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

type FieldPrefixedControlProps = WithoutClassName<
  Omit<ComponentProps<typeof Field.Control>, "render">
> & {
  // The fixed start of the value, such as the host of a public address.
  prefix: string;
};

// A single-line control with the fixed start of its value above it, inside
// one frame, as the mobile design draws the public address: beside the input
// the prefix would take half its width. The frame is on the wrapper, so it
// takes the focus, read-only and invalid styles of a text control through
// `:has()` on the input; the `PrefixedControl` stories check that the two
// agree. A focused read-only input keeps the focus border, as a text control
// does, so the read-only border leaves it out by name: Tailwind orders
// `has-[…]` variants by their text, where focus comes before read-only and
// loses to it. The prefix is a description of the field, so Base UI adds it
// to the input's `aria-describedby`.
export function FieldPrefixedControl({
  prefix,
  ...props
}: FieldPrefixedControlProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface transition-colors has-[input:focus-visible]:border-accent has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-accent/20 has-[input:read-only]:bg-surface-muted has-[input:read-only:not(:focus-visible)]:border-border-subtle has-[input[data-invalid]]:border-danger has-[input[data-invalid]]:bg-danger-surface">
      <Field.Description className="px-3 pt-2 font-mono text-xs/snug text-foreground-subtle">
        {prefix}
      </Field.Description>
      <Field.Control
        {...props}
        className="min-w-0 bg-transparent px-3 pt-0.5 pb-2 font-mono text-base font-medium read-only:text-foreground-subtle focus-visible:outline-hidden md:text-sm"
      />
    </div>
  );
}
