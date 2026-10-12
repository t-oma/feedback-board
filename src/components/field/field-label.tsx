import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { FieldCounter, type FieldCounterProps } from "./field-counter";
import { fieldStyles } from "./styles";

type FieldLabelProps = WithoutClassName<ComponentProps<typeof Field.Label>> & {
  counter?: FieldCounterProps | undefined;
};

export function FieldLabel({ children, counter, ...props }: FieldLabelProps) {
  const { label, labelRow } = fieldStyles();
  const labelElement = (
    <Field.Label {...props} className={label()}>
      {children}
    </Field.Label>
  );

  if (counter === undefined) return labelElement;

  // The counter sits beside the `<label>`, not inside it. Inside, it would
  // become part of the field's accessible name and change with every key.
  return (
    <div className={labelRow()}>
      {labelElement}
      <FieldCounter {...counter} />
    </div>
  );
}
