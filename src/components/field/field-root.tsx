import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { rootClassName } from "./geometry";

export function FieldRoot({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Root>>) {
  return (
    <Field.Root {...props} className={rootClassName}>
      {children}
    </Field.Root>
  );
}
