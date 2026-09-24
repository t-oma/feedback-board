// Stands in for the request-dependent part of `/sign-in` while it streams.
//
// The state sheet in the design fixes what this looks like: toned blocks in the
// real layout, no spinner and no shimmer, announced as busy. Geometry is copied
// from the components it replaces rather than invented, so the content does not
// jump when it arrives -- the heading slot is a `text-2xl` line box, the
// supporting text keeps its reserved `min-h-10`, the tab strip repeats
// `Tabs.List`, and a field is a `text-sm` label line over an `h-12` control.
//
// Nothing here is interactive. A real link would have to omit `returnTo`, which
// is exactly the value this boundary is waiting for, and a real input would lose
// what was typed into it the moment React swaps the tree.

const toneClassName = "rounded-md bg-surface-muted";

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-5 items-center">
        <div className={`h-3.5 w-1/5 ${toneClassName}`} />
      </div>
      <div className={`h-12 w-full ${toneClassName}`} />
    </div>
  );
}

export function AuthContentSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-y-5">
      <span className="sr-only">Loading sign-in</span>

      <div aria-hidden="true" className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <div className="flex h-8 items-center">
            <div className={`h-6 w-3/5 ${toneClassName}`} />
          </div>

          <div className="flex min-h-10 flex-col justify-center gap-2">
            <div className={`h-3 w-11/12 ${toneClassName}`} />
            <div className={`h-3 w-3/5 ${toneClassName}`} />
          </div>
        </div>

        <div className="w-full">
          <div className="flex gap-x-2 rounded-lg border border-border-subtle bg-surface-muted p-1">
            <div className="h-11 flex-1 rounded-md bg-surface" />
            <div className="h-11 flex-1" />
          </div>

          <div className="flex flex-col gap-y-4 pt-5">
            <FieldSkeleton />
            <FieldSkeleton />
            <div className={`h-12 w-full ${toneClassName}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
