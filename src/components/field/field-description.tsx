import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function FieldDescription(
  props: WithoutClassName<ComponentProps<typeof Field.Description>>,
) {
  return (
    // The error takes the hint's place, as in the design's error examples, so
    // the two never say much the same thing one under the other.
    <Field.Description
      {...props}
      className="font-mono text-xs/normal text-foreground-subtle data-invalid:hidden"
    />
  );
}
