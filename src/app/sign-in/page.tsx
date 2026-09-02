import { Tabs } from "@/components/tabs";
import {
  AuthHeader,
  buildSignInHref,
  CreateAccountForm,
  parseAuthNavigation,
  SignInForm,
} from "@/features/auth";
import { env } from "@/server/env";
import type { SearchParams } from "@/types";
import Link from "next/link";
import { Suspense } from "react";

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

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <h1 className="font-serif text-2xl font-semibold">{heading}</h1>
        <p className="min-h-10 text-sm text-foreground-secondary">
          {supportingText}
        </p>
      </div>

      <Tabs.Root value={navigation.mode} className="w-full">
        <Tabs.List>
          <Tabs.Tab
            value="sign-in"
            nativeButton={false}
            render={
              <Link
                href={buildSignInHref({
                  returnTo: navigation.hasExplicitReturnTo
                    ? navigation.returnTo
                    : undefined,
                  intent: navigation.intent ?? undefined,
                  mode: "sign-in",
                })}
              />
            }
          >
            Sign in
          </Tabs.Tab>
          <Tabs.Tab
            value="create-account"
            nativeButton={false}
            render={
              <Link
                href={buildSignInHref({
                  returnTo: navigation.hasExplicitReturnTo
                    ? navigation.returnTo
                    : undefined,
                  intent: navigation.intent ?? undefined,
                  mode: "create-account",
                })}
              />
            }
          >
            Create account
          </Tabs.Tab>
          <Tabs.Indicator renderBeforeHydration />
        </Tabs.List>

        <Tabs.Content>
          <Tabs.Panel keepMounted value="sign-in">
            <SignInForm />
          </Tabs.Panel>
          <Tabs.Panel keepMounted value="create-account">
            <CreateAccountForm />
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
