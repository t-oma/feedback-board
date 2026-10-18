import { clsx } from "clsx";

import { SkeletonText } from "../skeleton";

type PageIntroProps = {
  title: string;
  description: string;
  // For a description that changes with the page's state: the room for two
  // lines keeps what follows in place when a shorter one replaces a longer.
  reserveTwoLines?: boolean;
};

export function PageIntro({
  title,
  description,
  reserveTwoLines = false,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="font-serif text-2xl font-semibold">{title}</h1>
      {/* Two lines of the description's own line height. Firefox before 120
          has no `lh` unit and keeps 2.5rem, which is two lines at `text-sm`. */}
      <p
        className={clsx(
          "text-sm text-foreground-muted",
          reserveTwoLines && "min-h-10 supports-[min-height:1lh]:min-h-[2lh]",
        )}
      >
        {description}
      </p>
    </div>
  );
}

export function PageIntroSkeleton({
  title,
  description,
  reserveTwoLines = false,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-serif text-2xl font-semibold">
        <SkeletonText>{title}</SkeletonText>
      </p>
      <p
        className={clsx(
          "text-sm",
          reserveTwoLines && "min-h-10 supports-[min-height:1lh]:min-h-[2lh]",
        )}
      >
        <SkeletonText>{description}</SkeletonText>
      </p>
    </div>
  );
}
