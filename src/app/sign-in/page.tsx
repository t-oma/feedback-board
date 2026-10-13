import type { Metadata } from "next";

import { NarrowMain } from "@/components/narrow-main";
import {
  buildSignInHref,
  getAuthBackTarget,
  parseSignInQuery,
} from "@/entities/user/navigation";
import { env } from "@/server/env";

import { AuthHeader } from "./_ui/auth-header";
import { AuthIntro } from "./_ui/auth-intro";
import { AuthTabs } from "./_ui/auth-tabs";

// One title for both modes. A title per mode would need `generateMetadata`
// reading `searchParams`, which makes the head depend on the request.
export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn({ searchParams }: PageProps<"/sign-in">) {
  const { returnTo, intent, mode } = parseSignInQuery(
    await searchParams,
    env.BETTER_AUTH_URL,
  );
  const signInHref = buildSignInHref({ returnTo, intent, mode: "sign-in" });
  const createAccountHref = buildSignInHref({
    returnTo,
    intent,
    mode: "create-account",
  });

  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <NarrowMain>
        <AuthIntro mode={mode} intent={intent} />
        <AuthTabs
          mode={mode}
          returnTo={returnTo}
          signInHref={signInHref}
          createAccountHref={createAccountHref}
        />
      </NarrowMain>
    </>
  );
}
