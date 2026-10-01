import { buildSignInHref, type SignInQuery } from "../navigation";
import type { AuthIntent } from "../schemas";
import { AuthForms } from "./auth-forms";

const intentSupportingText: Record<AuthIntent, string> = {
  vote: "Sign in to vote.",
  feedback: "Sign in to add feedback.",
  board: "Sign in to create your board.",
};

export function AuthContent({ returnTo, intent, mode }: SignInQuery) {
  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = intent
    ? intentSupportingText[intent]
    : "Sign in to vote, add feedback, or manage your board.";

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  const signInHref = buildSignInHref({
    returnTo,
    intent,
    mode: "sign-in",
  });
  const createAccountHref = buildSignInHref({
    returnTo,
    intent,
    mode: "create-account",
  });

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <h1 className="font-serif text-2xl font-semibold">{heading}</h1>
        <p className="min-h-10 text-sm text-foreground-secondary">
          {supportingText}
        </p>
      </div>

      <AuthForms
        mode={mode}
        returnTo={returnTo}
        signInHref={signInHref}
        createAccountHref={createAccountHref}
      />
    </>
  );
}
