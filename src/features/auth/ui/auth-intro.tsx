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

const introClassName = "flex flex-col gap-y-2";
const headingClassName = "font-serif text-2xl font-semibold";
const supportingClassName = "min-h-10 text-sm";

export function AuthIntro({ intent, mode }: AuthIntroProps) {
  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = intent
    ? intentSupportingText[intent]
    : neutralSupportingText;

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  return (
    <div className={introClassName}>
      <h1 className={headingClassName}>{heading}</h1>
      <p className={`${supportingClassName} text-foreground-secondary`}>
        {supportingText}
      </p>
    </div>
  );
}

// The skeleton cannot know the mode and intent the request asks for, so it
// shows the plain sign-in intro in the space the supporting text reserves.
export function AuthIntroSkeleton() {
  return (
    <div className={introClassName}>
      <p className={headingClassName}>
        <SkeletonText>Sign in</SkeletonText>
      </p>
      <p className={supportingClassName}>
        <SkeletonText>{neutralSupportingText}</SkeletonText>
      </p>
    </div>
  );
}
