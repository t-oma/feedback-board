import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { textControlStyles } from "./styles";

export function FieldControl({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Control>>) {
  return (
    <Field.Control {...props} className={textControlStyles({ kind: "input" })}>
      {children}
    </Field.Control>
  );
}
