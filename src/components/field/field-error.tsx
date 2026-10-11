import { Field } from "@base-ui/react/field";
import { CircleAlert } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";

// The icon marks the message as an error by shape as well as by colour.
// Base UI passes the message, or a list of messages, as `children` into the
// render function, so it keeps choosing what to show.
export function FieldError(
  props: WithoutClassName<Omit<ComponentProps<typeof Field.Error>, "render">>,
) {
  return (
    <Field.Error
      {...props}
      className="flex items-start gap-1.5 text-sm font-medium text-danger"
      render={({ children, ...errorProps }) => (
        <div {...errorProps}>
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>{children}</div>
        </div>
      )}
    />
  );
}
