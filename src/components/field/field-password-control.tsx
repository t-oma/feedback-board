"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useId, useState } from "react";

import { FieldControl } from "./field-control";
import { fieldStyles } from "./styles";

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
  const { passwordControl, passwordToggle } = fieldStyles();

  return (
    <div className={passwordControl()}>
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
        onClick={() => {
          setIsPasswordVisible((isVisible) => !isVisible);
        }}
        className={passwordToggle()}
      >
        <VisibilityIcon aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
