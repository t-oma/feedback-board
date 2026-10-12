import { Form as BaseForm } from "@base-ui/react/form";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { formStyles } from "./styles";

export function Form(props: WithoutClassName<ComponentProps<typeof BaseForm>>) {
  return <BaseForm {...props} className={formStyles()} />;
}
