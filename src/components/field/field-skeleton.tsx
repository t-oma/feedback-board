import type { ReactElement } from "react";

import { SkeletonText, skeletonToneClassName } from "../skeleton";
import {
  counterClassName,
  descriptionClassName,
  inputHeightClassName,
  labelClassName,
  labelRowClassName,
  rootClassName,
  textareaHeightClassName,
} from "./geometry";

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
    <span className={labelClassName}>
      <SkeletonText>{label}</SkeletonText>
    </span>
  );

  if (counter === undefined) return labelSkeleton;

  return (
    <div className={labelRowClassName}>
      {labelSkeleton}

      <span className={counterClassName}>
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
        className={`${control === "input" ? inputHeightClassName : textareaHeightClassName} rounded-lg ${skeletonToneClassName}`}
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
    <p className={descriptionClassName}>
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
    <div className={rootClassName}>
      <FieldLabelSkeleton label={label} counter={counter} />

      <FieldControlSkeleton control={control} />

      <FieldDescriptionSkeleton description={description} />
    </div>
  );
}
