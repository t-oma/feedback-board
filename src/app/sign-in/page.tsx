import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AuthContentSkeleton,
  AuthForms,
  AuthHeader,
  buildSignInHref,
  parseAuthNavigation,
} from "@/features/auth";
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

async function AuthContent({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
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
