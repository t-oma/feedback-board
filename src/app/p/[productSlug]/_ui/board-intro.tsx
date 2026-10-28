import { SkeletonText } from "@/components/skeleton";

const heading = "What should we build next?";

type BoardIntroProps = {
  // Empty when the owner wrote none.
  description: string;
};

// Below `sm` the intro sits on the surface and the feedback below it on the
// page's background, as the mobile design draws them; the desktop design puts
// both on the background. The surface runs to the edges of the screen, and
// the intro keeps to the page's content area inside it.
//
// The description keeps the line breaks the owner typed.
export function BoardIntro({ description }: BoardIntroProps) {
  return (
    <div className="layout-subgrid border-b border-border-subtle bg-surface py-6 sm:border-b-0 sm:bg-transparent sm:pt-11 sm:pb-0">
      <div className="flex max-w-xl flex-col gap-y-2.5">
        <h1 className="font-serif text-2xl font-semibold sm:text-3xl">
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

// Hidden from assistive technology on its own: it stands beside the board's
// `Skeleton` rather than inside it, which would hold it to the content area.
export function BoardIntroSkeleton({ description }: BoardIntroProps) {
  return (
    <div
      aria-hidden="true"
      className="layout-subgrid border-b border-border-subtle bg-surface py-6 sm:border-b-0 sm:bg-transparent sm:pt-11 sm:pb-0"
    >
      <div className="flex max-w-xl flex-col gap-y-2.5">
        <p className="font-serif text-2xl font-semibold sm:text-3xl">
          <SkeletonText>{heading}</SkeletonText>
        </p>
        <p className="text-sm/relaxed wrap-anywhere whitespace-pre-line">
          <SkeletonText>{description}</SkeletonText>
        </p>
      </div>
    </div>
  );
}
