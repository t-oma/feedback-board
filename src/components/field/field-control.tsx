import { WithoutClassName } from "@/types";
import { Field } from "@base-ui/react/field";
import { ComponentProps } from "react";

export function FieldControl({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Control>>) {
  return (
    <Field.Control
      {...props}
      className="h-12 min-w-0 rounded-lg border border-border bg-surface px-3 py-0 text-sm transition-colors outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
    >
      {children}
    </Field.Control>
  );
}
