import { Field } from "@base-ui/react/field";

import { fieldStyles } from "./styles";

export type FieldCounterProps = {
  count: number;
  max: number;
};

// A description of the field, so Base UI adds it to the control's
// `aria-describedby`.
export function FieldCounter({ count, max }: FieldCounterProps) {
  const { counter, current } = fieldStyles({ overMaximum: count > max });

  return (
    <Field.Description className={counter()}>
      <span aria-hidden="true">
        <span className={current()}>{count}</span> / {max}
      </span>
      <span className="sr-only">
        {count} of {max} characters
      </span>
    </Field.Description>
  );
}
