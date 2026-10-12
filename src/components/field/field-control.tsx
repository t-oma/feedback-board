import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { inputHeightClassName } from "./geometry";
import { textControlClassName } from "./text-control-class-name";

export function FieldControl({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Control>>) {
  return (
    <Field.Control
      {...props}
      className={`${inputHeightClassName} py-0 ${textControlClassName}`}
    >
      {children}
    </Field.Control>
  );
}
