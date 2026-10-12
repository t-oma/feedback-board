import { Field } from "@base-ui/react/field";
import { CircleAlert } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { fieldStyles } from "./styles";

// The icon marks the message as an error by shape as well as by colour.
// Base UI passes the message, or a list of messages, as `children` into the
// render function, so it keeps choosing what to show.
export function FieldError(
  props: WithoutClassName<Omit<ComponentProps<typeof Field.Error>, "render">>,
) {
  const { error, errorIcon } = fieldStyles();

  return (
    <Field.Error
      {...props}
      className={error()}
      render={({ children, ...errorProps }) => (
        <div {...errorProps}>
          <CircleAlert aria-hidden="true" className={errorIcon()} />
          <div>{children}</div>
        </div>
      )}
    />
  );
}
