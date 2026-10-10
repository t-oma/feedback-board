import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { FieldCounter, type FieldCounterProps } from "./field-counter";

type FieldLabelProps = WithoutClassName<ComponentProps<typeof Field.Label>> & {
  counter?: FieldCounterProps | undefined;
};

export function FieldLabel({ children, counter, ...props }: FieldLabelProps) {
  const label = (
    <Field.Label
      {...props}
      className="text-sm font-medium text-foreground-secondary"
    >
      {children}
    </Field.Label>
  );

  if (counter === undefined) return label;

  // The counter sits beside the `<label>`, not inside it. Inside, it would
  // become part of the field's accessible name and change with every key.
  return (
    <div className="flex items-baseline justify-between gap-3">
      {label}
      <FieldCounter {...counter} />
    </div>
  );
}
