"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useId, useState } from "react";

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

      {/* Not `transition-colors`: that also animates `outline-color`, so the
          focus ring would fade in from the icon colour instead of appearing in
          `accent`. */}
      <button
        type="button"
        aria-controls={controlId}
        aria-label={toggleLabel}
        onClick={() => {
          setIsPasswordVisible((isVisible) => !isVisible);
        }}
        className="absolute inset-y-px right-px inline-flex w-12 items-center justify-center rounded-r-[7px] text-foreground-subtle hover:bg-surface-muted hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent motion-safe:transition-[color,background-color]"
      >
        <VisibilityIcon aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
