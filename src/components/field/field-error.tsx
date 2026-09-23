import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function FieldError(
  props: WithoutClassName<ComponentProps<typeof Field.Error>>,
) {
  return (
    <Field.Error {...props} className="text-xs/5 font-medium text-danger" />
  );
}
