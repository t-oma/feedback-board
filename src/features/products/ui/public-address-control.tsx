import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

type PublicAddressControlProps = Omit<
  ComponentProps<typeof Field.Control>,
  "className" | "render"
> & {
  prefix: string;
};

// With `skeleton`, one toned block as tall as the control: the frame, the
// prefix and a line of the input keep the classes that size them and are not
// drawn. The geometry stories of `CreateProductFormSkeleton` check that the two
// line up.
const publicAddressStyles = tv({
  slots: {
    frame: "flex flex-col rounded-lg border",
    prefix: "px-3 pt-2 font-mono text-xs/[1.4]",
    input:
      "min-w-0 px-3 pt-0.5 pb-2.5 font-mono text-base font-medium md:text-sm",
  },
  variants: {
    skeleton: {
      false: {
        frame:
          "border-border bg-surface transition-colors has-[input:focus-visible]:border-accent has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-accent/20 has-[input:read-only]:border-border-subtle has-[input:read-only]:bg-surface-muted has-[input[data-invalid]]:border-danger has-[input[data-invalid]]:bg-danger-surface",
        prefix: "text-foreground-subtle",
        input:
          "bg-transparent read-only:text-foreground-subtle focus-visible:outline-hidden",
      },
      true: {
        frame: "border-transparent bg-surface-muted",
        prefix: "invisible",
        input: "invisible",
      },
    },
  },
  defaultVariants: {
    skeleton: false,
  },
});

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
  const styles = publicAddressStyles();

  return (
    <div className={styles.frame()}>
      <Field.Description className={styles.prefix()}>
        {prefix}
      </Field.Description>
      <Field.Control {...props} className={styles.input()} />
    </div>
  );
}

// The input's line holds a single space, since an input never wraps.
export function PublicAddressControlSkeleton({ prefix }: { prefix: string }) {
  const styles = publicAddressStyles({ skeleton: true });

  return (
    <div className={styles.frame()}>
      <p className={styles.prefix()}>{prefix}</p>
      <p data-skeleton-control className={styles.input()}>
        &nbsp;
      </p>
    </div>
  );
}
