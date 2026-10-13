import "server-only";

import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/server/auth";

import { buildSignInHref } from "./navigation";

type RequireSessionInput = {
  returnTo: Route;
};

// The session, or `null` when there is none. A protected Server Action reads
// it this way because it answers a missing session with `UNAUTHENTICATED`; a
// redirect would take the person away from everything the form held.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession({ returnTo }: RequireSessionInput) {
  const session = await getSession();

  if (!session) redirect(buildSignInHref({ returnTo }));

  return session;
}
