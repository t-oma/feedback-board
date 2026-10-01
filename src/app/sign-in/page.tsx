import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AuthContentSkeleton,
  AuthForms,
  AuthHeader,
  buildSignInHref,
  parseSignInQuery,
} from "@/features/auth";
import type { AuthIntent } from "@/features/auth/schemas";
import { env } from "@/server/env";

// One title for both modes. A title per mode would need `generateMetadata`
// reading `searchParams`, which makes the head depend on the request.
export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn({ searchParams }: PageProps<"/sign-in">) {
  return (
    <>
      <AuthHeader goBackText="Feedback Board" />

      <main className="flex flex-1 flex-col gap-y-5 overflow-x-clip bg-surface px-5 py-6">
        <Suspense fallback={<AuthContentSkeleton />}>
          <AuthContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

const intentSupportingText: Record<AuthIntent, string> = {
  vote: "Sign in to vote.",
  feedback: "Sign in to add feedback.",
  board: "Sign in to create your board.",
};

async function AuthContent({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const query = parseSignInQuery(await searchParams, env.BETTER_AUTH_URL);
  const { mode } = query;

  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = query.intent
    ? intentSupportingText[query.intent]
    : "Sign in to vote, add feedback, or manage your board.";

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  const returnTo = query.returnTo ?? undefined;
  const intent = query.intent ?? undefined;

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
