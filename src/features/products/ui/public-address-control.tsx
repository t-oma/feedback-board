import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

type PublicAddressControlProps = Omit<
  ComponentProps<typeof Field.Control>,
  "className" | "render"
> & {
  prefix: string;
};

// The address input with the start of the public URL above it, inside one
// frame, as the mobile design draws it: beside the input the prefix would take
// half its width. The frame moves to the wrapper, so it takes the focus,
// read-only and invalid styles `Field.Control` gives its own border, through
// `:has()` on the input. The prefix is a description of the field, so Base UI
// adds it to the input's `aria-describedby`.
export function PublicAddressControl({
  prefix,
  ...props
}: PublicAddressControlProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface transition-colors has-[input:focus-visible]:border-accent has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-accent/20 has-[input:read-only]:border-border-subtle has-[input:read-only]:bg-surface-muted has-[input[data-invalid]]:border-danger has-[input[data-invalid]]:bg-danger-surface">
      <Field.Description className="px-3 pt-2 font-mono text-xs/[1.4] text-foreground-subtle">
        {prefix}
      </Field.Description>
      <Field.Control
        {...props}
        className="min-w-0 bg-transparent px-3 pt-0.5 pb-2.5 font-mono text-base font-medium read-only:text-foreground-subtle focus-visible:outline-hidden md:text-sm"
      />
    </div>
  );
}
