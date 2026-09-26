import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  // Required because only the caller knows the page's heading outline.
  headingLevel: 1 | 2;
  children?: ReactNode;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  headingLevel,
  children,
}: EmptyStateProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      {eyebrow !== undefined && (
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-foreground-subtle">
          {eyebrow}
        </p>
      )}
      <Heading className="font-serif text-lg font-semibold">{title}</Heading>
      <p className="max-w-72 text-sm text-foreground-muted">{description}</p>
      {children !== undefined && (
        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {children}
        </div>
      )}
    </div>
  );
}
