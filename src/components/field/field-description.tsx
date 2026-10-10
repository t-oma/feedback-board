import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function FieldDescription(
  props: WithoutClassName<ComponentProps<typeof Field.Description>>,
) {
  return (
    <Field.Description
      {...props}
      className="font-mono text-xs/normal text-foreground-subtle"
    />
  );
}
