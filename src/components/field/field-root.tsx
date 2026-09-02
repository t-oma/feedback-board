import { WithoutClassName } from "@/types";
import { Field } from "@base-ui/react/field";
import { ComponentProps } from "react";

export function FieldRoot({
  children,
  ...props
}: WithoutClassName<ComponentProps<typeof Field.Root>>) {
  return (
    <Field.Root {...props} className="flex flex-col gap-2">
      {children}
    </Field.Root>
  );
}
