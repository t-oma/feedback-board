import { Button as BaseButton } from "@base-ui/react/button";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

import type { WithoutClassName } from "../types";
import { buttonClassName, type ButtonVariant } from "./variants";

type ButtonProps = Omit<
  WithoutClassName<ComponentProps<typeof BaseButton>>,
  "render" | "nativeButton" | "focusableWhenDisabled"
> & {
  variant?: ButtonVariant;
  pending?: boolean;
};

export function Button({
  variant = "primary",
  pending = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      {...props}
      // Pending keeps the button focusable, so a keyboard user does not lose
      // their place while the request runs. Base UI still cancels clicks and
      // keys, which is what stops a second submission.
      disabled={pending || disabled}
      focusableWhenDisabled={pending}
      aria-busy={pending || undefined}
      className={buttonClassName(variant)}
    >
      {pending && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      )}
      {children}
    </BaseButton>
  );
}
