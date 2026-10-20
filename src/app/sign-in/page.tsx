import type { Metadata } from "next";

import { parseSignInQuery } from "@/entities/user/navigation";
import { env } from "@/server/env";

import { SignIn } from "./_ui/sign-in";

// One title for both modes. A title per mode would need `generateMetadata`
// reading `searchParams`, which makes the head depend on the request.
export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  return (
    <SignIn {...parseSignInQuery(await searchParams, env.BETTER_AUTH_URL)} />
  );
}
