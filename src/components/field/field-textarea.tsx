import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { textControlClassName } from "./text-control-class-name";

type FieldTextareaProps = WithoutClassName<
  Omit<ComponentProps<typeof Field.Control>, "render" | "type">
>;

// `Field.Control` rendering a `<textarea>`, so the field keeps its label,
// validation and `onValueChange`. Base UI does not document a textarea there;
// the `Textarea` stories check each of those. Resizing is vertical only, since
// a wider box would break the column.
export function FieldTextarea(props: FieldTextareaProps) {
  return (
    <Field.Control
      {...props}
      render={<textarea />}
      className={`min-h-22 resize-y py-2.5 ${textControlClassName}`}
    />
  );
}
