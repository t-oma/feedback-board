import { tv } from "tailwind-variants";

import { SkeletonText } from "@/components/skeleton";

import type { AuthIntent, AuthMode } from "../schemas";

type AuthIntroProps = {
  mode: AuthMode;
  intent: AuthIntent | null;
};

const intentSupportingText: Record<AuthIntent, string> = {
  vote: "Sign in to vote.",
  feedback: "Sign in to add feedback.",
  board: "Sign in to create your board.",
};

const neutralSupportingText =
  "Sign in to vote, add feedback, or manage your board.";

// The supporting text reserves two lines, so the tabs below stay put whichever
// text the mode and intent choose. The geometry stories of
// `AuthContentSkeleton` check that the intro and its skeleton line up.
const introStyles = tv({
  slots: {
    root: "flex flex-col gap-y-2",
    heading: "font-serif text-2xl font-semibold",
    supporting: "min-h-10 text-sm",
  },
  variants: {
    skeleton: {
      false: { supporting: "text-foreground-secondary" },
    },
  },
  defaultVariants: {
    skeleton: false,
  },
});

export function AuthIntro({ intent, mode }: AuthIntroProps) {
  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = intent
    ? intentSupportingText[intent]
    : neutralSupportingText;

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  const styles = introStyles();

  return (
    <div className={styles.root()}>
      <h1 className={styles.heading()}>{heading}</h1>
      <p className={styles.supporting()}>{supportingText}</p>
    </div>
  );
}

// The skeleton cannot know the mode and intent the request asks for, so it
// shows the plain sign-in intro in the space the supporting text reserves.
export function AuthIntroSkeleton() {
  const styles = introStyles({ skeleton: true });

  return (
    <div className={styles.root()}>
      <p className={styles.heading()}>
        <SkeletonText>Sign in</SkeletonText>
      </p>
      <p className={styles.supporting()}>
        <SkeletonText>{neutralSupportingText}</SkeletonText>
      </p>
    </div>
  );
}
