// The classes that decide where each part of a field sits and how tall it is.
// The parts and `Field.Skeleton` both take them from here; the `Skeleton`
// stories check that the two line up.
export const rootClassName = "flex flex-col gap-2";
export const labelClassName = "text-sm font-medium";
export const labelRowClassName = "flex items-baseline justify-between gap-3";
export const counterClassName = "shrink-0 font-mono text-xs";
export const descriptionClassName = "font-mono text-xs/normal";
export const inputHeightClassName = "h-12";
export const textareaHeightClassName = "min-h-22";
