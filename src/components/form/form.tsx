import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// One column with the mobile designs' 18px between the banner, the fields and
// the submit button.
export function Form(props: WithoutClassName<ComponentProps<typeof BaseForm>>) {
  return <BaseForm {...props} className="flex w-full flex-col gap-y-4.5" />;
}
