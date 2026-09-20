import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "@/types";

export function FieldLabel({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Label>>) {
  return (
    <Field.Label
      {...props}
      className="text-sm font-medium text-foreground-secondary"
    >
      {children}
    </Field.Label>
  );
}
