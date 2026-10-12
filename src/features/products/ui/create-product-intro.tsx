import { SkeletonText } from "@/components/skeleton";

const heading = "Create your board";
const supportingText = "Everything here can be changed later in Settings.";

const introClassName = "flex flex-col gap-y-2";
const headingClassName = "font-serif text-2xl font-semibold";
const supportingClassName = "text-sm";

export function CreateProductIntro() {
  return (
    <div className={introClassName}>
      <h1 className={headingClassName}>{heading}</h1>
      <p className={`${supportingClassName} text-foreground-muted`}>
        {supportingText}
      </p>
    </div>
  );
}

export function CreateProductIntroSkeleton() {
  return (
    <div className={introClassName}>
      <p className={headingClassName}>
        <SkeletonText>{heading}</SkeletonText>
      </p>
      <p className={supportingClassName}>
        <SkeletonText>{supportingText}</SkeletonText>
      </p>
    </div>
  );
}
