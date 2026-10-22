import { ButtonSkeleton } from "@/components/button";
import { Field } from "@/components/field";
import { FormSkeleton } from "@/components/form";
import { FormPanel } from "@/components/form-panel";
import { PageMain } from "@/components/page-main";
import { Skeleton } from "@/components/skeleton";
import { Tabs } from "@/components/tabs";
import type { SignInQuery } from "@/entities/user/navigation";
import { buildSignInHref } from "@/entities/user/sign-in-href";

import { getAuthBackTarget } from "./auth-back-target";
import { AuthHeader, AuthHeaderSkeleton } from "./auth-header";
import { AuthIntro, AuthIntroSkeleton } from "./auth-intro";
import { AuthTabs } from "./auth-tabs";

export function SignIn({ returnTo, intent, mode }: SignInQuery) {
  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <PageMain align="stretch">
        <FormPanel>
          <AuthIntro mode={mode} intent={intent} />
          <AuthTabs
            mode={mode}
            returnTo={returnTo}
            signInHref={buildSignInHref({ returnTo, intent, mode: "sign-in" })}
            createAccountHref={buildSignInHref({
              returnTo,
              intent,
              mode: "create-account",
            })}
          />
        </FormPanel>
      </PageMain>
    </>
  );
}

// Stands in for the page while it streams, with the sign-in form, which a link
// without `mode` opens.
//
// Below the header nothing is interactive. A real link would have to omit
// `returnTo`, which is exactly the value this boundary is waiting for, and a
// real input would lose what was typed into it the moment React swaps the tree.
export function SignInSkeleton() {
  return (
    <>
      <AuthHeaderSkeleton />
      <PageMain align="stretch">
        <FormPanel>
          <Skeleton label="Loading sign-in">
            <AuthIntroSkeleton />
            <Tabs.Skeleton labels={["Sign in", "Create account"]}>
              <FormSkeleton>
                <Field.Skeleton label="Email" />
                <Field.Skeleton label="Password" />
                <ButtonSkeleton />
              </FormSkeleton>
            </Tabs.Skeleton>
          </Skeleton>
        </FormPanel>
      </PageMain>
    </>
  );
}
