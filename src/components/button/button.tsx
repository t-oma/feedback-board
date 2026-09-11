import { WithoutClassName } from "@/types";
import { LoaderCircle } from "lucide-react";
import { ComponentProps } from "react";

type ButtonProps = WithoutClassName<ComponentProps<"button">> & {
  showSpinner?: boolean;
};

export function Button({
  type,
  children,
  showSpinner = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-surface outline-none focus-visible:ring-3 focus-visible:ring-accent/20 enabled:hover:bg-accent/90 enabled:active:scale-98 disabled:cursor-not-allowed disabled:bg-accent-muted motion-safe:transition-[background-color,scale]"
    >
      {showSpinner && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      )}
      {children}
    </button>
  );
}
