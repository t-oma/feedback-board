import { clsx } from "clsx";
import type { ReactElement } from "react";

import { SkeletonText } from "../skeleton";

// Each part repeats the classes that place and size the field part it stands
// in for. The `Skeleton` stories check that the two line up.

type FieldSkeletonProps = {
  label: string;
  // The field's maximum, when its label shows a counter. A new field counts 0.
  counter?: number | undefined;
  // A text control by kind, or the skeleton of a feature's own control.
  control?: "input" | "textarea" | ReactElement | undefined;
  description?: string | undefined;
};

function FieldLabelSkeleton({
  label,
  counter,
}: Pick<FieldSkeletonProps, "label" | "counter">) {
  const labelSkeleton = (
    <span className="text-sm font-medium">
      <SkeletonText>{label}</SkeletonText>
    </span>
  );

  if (counter === undefined) return labelSkeleton;

  return (
    <div className="flex items-baseline justify-between gap-3">
      {labelSkeleton}

      <span className="shrink-0 font-mono text-xs">
        <SkeletonText>{`0 / ${counter}`}</SkeletonText>
      </span>
    </div>
  );
}

function FieldControlSkeleton({
  control,
}: {
  control: NonNullable<FieldSkeletonProps["control"]>;
}) {
  if (typeof control === "string") {
    return (
      <div
        data-skeleton-control
        className={clsx(
          "rounded-lg bg-surface-muted",
          control === "input" ? "h-12" : "min-h-22",
        )}
      />
    );
  }

  return control;
}

function FieldDescriptionSkeleton({
  description,
}: Pick<FieldSkeletonProps, "description">) {
  if (description === undefined) return null;

  return (
    <p className="font-mono text-xs/normal">
      <SkeletonText>{description}</SkeletonText>
    </p>
  );
}

export function FieldSkeleton({
  label,
  counter,
  control = "input",
  description,
}: FieldSkeletonProps) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabelSkeleton label={label} counter={counter} />

      <FieldControlSkeleton control={control} />

      <FieldDescriptionSkeleton description={description} />
    </div>
  );
}
