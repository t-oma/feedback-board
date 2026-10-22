"use client";

import { Link } from "@/components/link";
import { buildSignInHref } from "@/entities/user/sign-in-href";
import { useCurrentPath } from "@/shared/use-current-path";

export function SignInLink() {
  return (
    <Link
      variant="secondary"
      href={buildSignInHref({ returnTo: useCurrentPath() })}
    >
      Sign in
    </Link>
  );
}
