import { WithoutClassName } from "@/types";
import { ComponentProps } from "react";

export function Button({
  type,
  children,
  ...props
}: WithoutClassName<ComponentProps<"button">>) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-surface outline-none focus-visible:ring-3 focus-visible:ring-accent/20 enabled:hover:bg-accent/90 enabled:active:scale-98 disabled:cursor-not-allowed disabled:bg-accent-muted motion-safe:transition-[background-color,scale]"
    >
      {children}
    </button>
  );
}
