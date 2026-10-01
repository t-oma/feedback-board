import type { Metadata } from "next";
import { Suspense } from "react";

import { parseSignInQuery } from "@/features/auth/navigation";
import { AuthContent } from "@/features/auth/ui/auth-content";
import { AuthContentSkeleton } from "@/features/auth/ui/auth-content-skeleton";
import { AuthHeader } from "@/features/auth/ui/auth-header";
import { AuthMain } from "@/features/auth/ui/auth-main";
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

      <AuthMain>
        <Suspense fallback={<AuthContentSkeleton />}>
          <AuthContentFromQuery searchParams={searchParams} />
        </Suspense>
      </AuthMain>
    </>
  );
}

async function AuthContentFromQuery({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const query = parseSignInQuery(await searchParams, env.BETTER_AUTH_URL);

  return <AuthContent {...query} />;
}
