import { tv } from "tailwind-variants";

import { SkeletonText } from "@/components/skeleton";

const heading = "Create your board";
const supportingText = "Everything here can be changed later in Settings.";

// The geometry stories of `CreateProductFormSkeleton` check that the intro and
// its skeleton line up.
const introStyles = tv({
  slots: {
    root: "flex flex-col gap-y-2",
    heading: "font-serif text-2xl font-semibold",
    supporting: "text-sm",
  },
  variants: {
    skeleton: {
      false: { supporting: "text-foreground-muted" },
    },
  },
  defaultVariants: {
    skeleton: false,
  },
});

export function CreateProductIntro() {
  const styles = introStyles();

  return (
    <div className={styles.root()}>
      <h1 className={styles.heading()}>{heading}</h1>
      <p className={styles.supporting()}>{supportingText}</p>
    </div>
  );
}

export function CreateProductIntroSkeleton() {
  const styles = introStyles({ skeleton: true });

  return (
    <div className={styles.root()}>
      <p className={styles.heading()}>
        <SkeletonText>{heading}</SkeletonText>
      </p>
      <p className={styles.supporting()}>
        <SkeletonText>{supportingText}</SkeletonText>
      </p>
    </div>
  );
}
