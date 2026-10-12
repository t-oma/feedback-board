import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import { skeletonToneClassName } from "@/components/skeleton";

type PublicAddressControlProps = Omit<
  ComponentProps<typeof Field.Control>,
  "className" | "render"
> & {
  prefix: string;
};

// What decides the control's height, shared with its skeleton.
const frameClassName = "flex flex-col rounded-lg border";
const prefixClassName = "px-3 pt-2 font-mono text-xs/[1.4]";
const inputClassName =
  "min-w-0 px-3 pt-0.5 pb-2.5 font-mono text-base font-medium md:text-sm";

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
    <div
      className={`${frameClassName} border-border bg-surface transition-colors has-[input:focus-visible]:border-accent has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-accent/20 has-[input:read-only]:border-border-subtle has-[input:read-only]:bg-surface-muted has-[input[data-invalid]]:border-danger has-[input[data-invalid]]:bg-danger-surface`}
    >
      <Field.Description
        className={`${prefixClassName} text-foreground-subtle`}
      >
        {prefix}
      </Field.Description>
      <Field.Control
        {...props}
        className={`${inputClassName} bg-transparent read-only:text-foreground-subtle focus-visible:outline-hidden`}
      />
    </div>
  );
}

// One toned block, as tall as the control: the prefix and one line of the
// input's text keep their room without being drawn. The line holds a single
// space, since an input never wraps.
export function PublicAddressControlSkeleton({ prefix }: { prefix: string }) {
  return (
    <div
      className={`${frameClassName} border-transparent ${skeletonToneClassName}`}
    >
      <p className={`${prefixClassName} invisible`}>{prefix}</p>
      <p data-skeleton-control className={`${inputClassName} invisible`}>
        &nbsp;
      </p>
    </div>
  );
}
