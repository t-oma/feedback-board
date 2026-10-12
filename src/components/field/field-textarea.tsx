import { Field } from "@base-ui/react/field";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { textControlStyles } from "./styles";

type FieldTextareaProps = WithoutClassName<
  Omit<ComponentProps<typeof Field.Control>, "render" | "type">
>;

// `Field.Control` rendering a `<textarea>`, so the field keeps its label,
// validation and `onValueChange`. Base UI does not document a textarea there;
// the `Textarea` stories check each of those.
export function FieldTextarea(props: FieldTextareaProps) {
  return (
    <Field.Control
      {...props}
      render={<textarea />}
      className={textControlStyles({ kind: "textarea" })}
    />
  );
}
