import { skeletonToneClassName } from "./skeleton-tone-class-name";

type SkeletonTextProps = {
  children: string;
};

// Stands in for a string the skeleton knows by rendering that string,
// transparent, so it wraps like the real text at every width. The parent sets
// the typography, the same as the real text's. An inline background paints
// each line on its own, and `box-decoration-clone` gives every line's bar its
// own rounded ends. Directly inside a flex or grid container the span would be
// laid out as a block, with one background for all its lines and as tall as
// the line height, so it goes inside an element of its own there.
export function SkeletonText({ children }: SkeletonTextProps) {
  return (
    <span
      className={`rounded-md box-decoration-clone text-transparent select-none ${skeletonToneClassName}`}
    >
      {children}
    </span>
  );
}
