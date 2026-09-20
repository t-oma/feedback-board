import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/server/auth";

import { buildSignInHref } from "./navigation";

type RequireSessionInput = {
  returnTo: string;
};

const readCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession({ returnTo }: RequireSessionInput) {
  const session = await readCurrentSession();

  if (!session) redirect(buildSignInHref({ returnTo }));

  return session;
}
