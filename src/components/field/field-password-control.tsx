"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { ComponentProps, useId, useState } from "react";
import { FieldControl } from "./field-control";

type FieldPasswordControlProps = Omit<
  ComponentProps<typeof FieldControl>,
  "children" | "type"
>;

export function FieldPasswordControl({
  id,
  spellCheck = false,
  autoCapitalize = "none",
  ...props
}: FieldPasswordControlProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleLabel = isPasswordVisible ? "Hide password" : "Show password";
  const VisibilityIcon = isPasswordVisible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative w-full [&>input]:w-full [&>input]:pr-12">
      <FieldControl
        {...props}
        id={controlId}
        type={isPasswordVisible ? "text" : "password"}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
      />

      <button
        type="button"
        aria-controls={controlId}
        aria-label={toggleLabel}
        onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
        className="absolute inset-y-px right-px inline-flex w-12 cursor-pointer items-center justify-center rounded-r-[7px] text-foreground-subtle outline-none focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:ring-inset enabled:hover:bg-surface-muted enabled:hover:text-accent motion-safe:transition-colors"
      >
        <VisibilityIcon aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
