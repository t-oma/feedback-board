import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { formClassName } from "./form-class-name";

export function Form(props: WithoutClassName<ComponentProps<typeof BaseForm>>) {
  return <BaseForm {...props} className={formClassName} />;
}
