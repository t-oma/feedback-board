import type { ReactElement } from "react";

import { SkeletonText } from "../skeleton";
import { fieldStyles, textControlStyles } from "./styles";

type FieldSkeletonProps = {
  label: string;
  // The field's maximum, when its label shows a counter. A new field counts 0.
  counter?: number | undefined;
  // A text control by kind, or the skeleton of a feature's own control.
  control?: "input" | "textarea" | ReactElement | undefined;
  description?: string | undefined;
};

const styles = fieldStyles({ skeleton: true });

function FieldLabelSkeleton({
  label,
  counter,
}: Pick<FieldSkeletonProps, "label" | "counter">) {
  const labelSkeleton = (
    <span className={styles.label()}>
      <SkeletonText>{label}</SkeletonText>
    </span>
  );

  if (counter === undefined) return labelSkeleton;

  return (
    <div className={styles.labelRow()}>
      {labelSkeleton}

      <span className={styles.counter()}>
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
        className={textControlStyles({ kind: control, skeleton: true })}
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
    <p className={styles.description()}>
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
    <div className={styles.root()}>
      <FieldLabelSkeleton label={label} counter={counter} />

      <FieldControlSkeleton control={control} />

      <FieldDescriptionSkeleton description={description} />
    </div>
  );
}
