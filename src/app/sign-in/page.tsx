import type { Metadata } from "next";

import {
  getAuthBackTarget,
  parseSignInQuery,
} from "@/features/auth/navigation";
import { AuthContent } from "@/features/auth/ui/auth-content";
import { AuthHeader } from "@/features/auth/ui/auth-header";
import { AuthMain } from "@/features/auth/ui/auth-main";
import { env } from "@/server/env";

// One title for both modes. A title per mode would need `generateMetadata`
// reading `searchParams`, which makes the head depend on the request.
export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn({ searchParams }: PageProps<"/sign-in">) {
  const query = parseSignInQuery(await searchParams, env.BETTER_AUTH_URL);

  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(query.returnTo)} />
      <AuthMain>
        <AuthContent {...query} />
      </AuthMain>
    </>
  );
}
