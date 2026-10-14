import { SkeletonText } from "@/components/skeleton";

const heading = "What should we build next?";

type BoardIntroProps = {
  // Empty when the owner wrote none.
  description: string;
};

// Below `sm` the intro sits on the surface and the feedback below it on the
// page's background, as the mobile design draws them; the desktop design puts
// both on the background.
//
// The description keeps the line breaks the owner typed.
export function BoardIntro({ description }: BoardIntroProps) {
  return (
    <div className="border-b border-border-subtle bg-surface px-5 pt-5.5 pb-6 sm:border-b-0 sm:bg-transparent sm:px-10 sm:pt-11 sm:pb-0">
      <div className="flex max-w-140 flex-col gap-y-2.5">
        <h1 className="font-serif text-2xl font-semibold sm:text-[2rem]/[1.15]">
          {heading}
        </h1>
        {description !== "" && (
          <p className="text-sm/relaxed wrap-anywhere whitespace-pre-line text-foreground-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function BoardIntroSkeleton({ description }: BoardIntroProps) {
  return (
    <div className="border-b border-border-subtle bg-surface px-5 pt-5.5 pb-6 sm:border-b-0 sm:bg-transparent sm:px-10 sm:pt-11 sm:pb-0">
      <div className="flex max-w-140 flex-col gap-y-2.5">
        <p className="font-serif text-2xl font-semibold sm:text-[2rem]/[1.15]">
          <SkeletonText>{heading}</SkeletonText>
        </p>
        <p className="text-sm/relaxed wrap-anywhere whitespace-pre-line">
          <SkeletonText>{description}</SkeletonText>
        </p>
      </div>
    </div>
  );
}
