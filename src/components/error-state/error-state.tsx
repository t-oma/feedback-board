import type { ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description?: string;
  // Required because only the caller knows the page's heading outline.
  headingLevel: 1 | 2;
  children?: ReactNode;
};

export function ErrorState({
  title,
  description,
  headingLevel,
  children,
}: ErrorStateProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    // An alert, because the failure usually replaces content after a client
    // navigation, and a screen reader hears nothing of it otherwise.
    <div
      role="alert"
      className="flex flex-col items-center gap-2.5 rounded-lg border border-danger-border bg-danger-surface p-4 text-center sm:items-start sm:text-left"
    >
      <Heading className="font-serif text-base font-semibold">{title}</Heading>
      {description !== undefined && (
        <p className="text-sm text-foreground-muted">{description}</p>
      )}
      {children !== undefined && (
        <div className="mt-1 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {children}
        </div>
      )}
    </div>
  );
}
