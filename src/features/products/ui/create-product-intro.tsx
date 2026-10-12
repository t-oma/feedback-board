import { SkeletonText } from "@/components/skeleton";

const heading = "Create your board";
const supportingText = "Everything here can be changed later in Settings.";

export function CreateProductIntro() {
  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="font-serif text-2xl font-semibold">{heading}</h1>
      <p className="text-sm text-foreground-muted">{supportingText}</p>
    </div>
  );
}

// Repeats the classes that place and size `CreateProductIntro`; the geometry
// stories of `CreateProductFormSkeleton` check that the two line up.
export function CreateProductIntroSkeleton() {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-serif text-2xl font-semibold">
        <SkeletonText>{heading}</SkeletonText>
      </p>
      <p className="text-sm">
        <SkeletonText>{supportingText}</SkeletonText>
      </p>
    </div>
  );
}
