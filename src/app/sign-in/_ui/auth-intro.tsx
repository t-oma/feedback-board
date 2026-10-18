import { PageIntro, PageIntroSkeleton } from "@/components/page-intro";
import type { AuthIntent, AuthMode } from "@/entities/user/schemas";

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

export function AuthIntro({ intent, mode }: AuthIntroProps) {
  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = intent
    ? intentSupportingText[intent]
    : neutralSupportingText;

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  // The supporting text follows the mode and the intent, so the room for two
  // lines keeps the tabs below in place when it changes.
  return (
    <PageIntro title={heading} description={supportingText} reserveTwoLines />
  );
}

// The skeleton cannot know the mode and intent the request asks for, so it
// shows the plain sign-in intro in the space the supporting text reserves.
export function AuthIntroSkeleton() {
  return (
    <PageIntroSkeleton
      title="Sign in"
      description={neutralSupportingText}
      reserveTwoLines
    />
  );
}
