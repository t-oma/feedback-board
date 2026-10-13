import { ButtonSkeleton } from "@/components/button";
import { Field } from "@/components/field";
import { FormSkeleton } from "@/components/form";
import { Skeleton } from "@/components/skeleton";
import { Tabs } from "@/components/tabs";

import { AuthIntroSkeleton } from "./auth-intro";

// Stands in for the request-dependent part of `/sign-in` while it streams: the
// intro and the sign-in form, which a link without `mode` opens.
//
// Nothing here is interactive. A real link would have to omit `returnTo`, which
// is exactly the value this boundary is waiting for, and a real input would lose
// what was typed into it the moment React swaps the tree.
export function AuthContentSkeleton() {
  return (
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
  );
}
