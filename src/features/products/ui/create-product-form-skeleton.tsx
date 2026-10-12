import { formClassName } from "@/components/form";

// Stands in for `/dashboard` while it streams. It takes the shape of the
// onboarding form, the first state a new account sees there: toned blocks in
// the real layout, no spinner and no shimmer, announced as busy, as the
// design's state sheet asks.

const toneClassName = "rounded-md bg-surface-muted";

function FieldSkeleton({ controlClassName }: { controlClassName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-5 items-center justify-between">
        <div className={`h-3.5 w-1/4 ${toneClassName}`} />
        <div className={`h-3 w-10 ${toneClassName}`} />
      </div>
      <div className={`w-full ${controlClassName} ${toneClassName}`} />
    </div>
  );
}

export function CreateProductFormSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-y-5">
      <span className="sr-only">Loading your dashboard</span>

      <div aria-hidden="true" className={formClassName}>
        <div className="flex flex-col gap-y-2">
          <div className="flex h-7 items-center">
            <div className={`h-5.5 w-3/5 ${toneClassName}`} />
          </div>
          <div className={`h-3 w-4/5 ${toneClassName}`} />
        </div>

        <FieldSkeleton controlClassName="h-12" />
        <FieldSkeleton controlClassName="h-15" />
        <FieldSkeleton controlClassName="h-22" />
        <div className={`h-12 w-full ${toneClassName}`} />
      </div>
    </div>
  );
}
