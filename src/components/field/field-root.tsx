import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { fieldStyles } from "./styles";

export function FieldRoot({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Root>>) {
  return (
    <Field.Root {...props} className={fieldStyles().root()}>
      {children}
    </Field.Root>
  );
}
