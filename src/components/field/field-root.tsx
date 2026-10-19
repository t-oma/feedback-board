import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

export function FieldRoot(
  props: WithoutClassName<ComponentProps<typeof Field.Root>>,
) {
  return <Field.Root {...props} className="flex flex-col gap-2" />;
}
