import { Suspense } from "react";

import {
  AuthForms,
  AuthHeader,
  buildSignInHref,
  parseAuthNavigation,
} from "@/features/auth";
import { env } from "@/server/env";
import type { SearchParams } from "@/types";

type SignInPageProps = {
  searchParams: Promise<SearchParams>;
};

export default function SignIn({ searchParams }: SignInPageProps) {
  return (
    <>
      <AuthHeader goBackText="Feedback Board" />

      <main className="flex flex-1 flex-col gap-y-5 overflow-x-clip bg-surface px-5 py-6">
        <Suspense fallback={<div aria-busy="true" />}>
          <AuthContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function AuthContent({ searchParams }: SignInPageProps) {
  const query = await searchParams;

  const navigation = parseAuthNavigation({
    returnTo: query.returnTo,
    intent: query.intent,
    mode: query.mode,
    origin: env.BETTER_AUTH_URL,
    fallback: "/",
  });

  const heading =
    navigation.mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText =
    navigation.supportingText ??
    "Sign in to vote, add feedback, or manage your board.";

  const supportingText =
    navigation.mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  const returnTo = navigation.hasExplicitReturnTo
    ? navigation.returnTo
    : undefined;
  const intent = navigation.intent ?? undefined;

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
        mode={navigation.mode}
        returnTo={returnTo}
        signInHref={signInHref}
        createAccountHref={createAccountHref}
      />
    </>
  );
}
