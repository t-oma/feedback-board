type SkeletonTextProps = {
  children: string;
};

// Stands in for a string the skeleton knows by rendering that string,
// transparent, so it wraps like the real text at every width. The parent sets
// the typography, the same as the real text's. An inline background paints
// each line on its own, rounded only where the string starts and ends.
// `box-decoration-clone` would round every line, but Chromium does not wrap a
// paragraph `pretty` around a cloned inline box, so the bars would break where
// the real text does not. Directly inside a flex or grid container the span
// would be laid out as a block, with one background for all its lines and as
// tall as the line height, so it goes inside an element of its own there.
export function SkeletonText({ children }: SkeletonTextProps) {
  return (
    <span className="rounded-md bg-surface-muted text-transparent select-none">
      {children}
    </span>
  );
}
