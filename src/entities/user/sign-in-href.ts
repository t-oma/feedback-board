import type { Route } from "next";

import type { AuthIntent, AuthMode } from "./schemas";

type BuildSignInHrefInput = {
  returnTo?: string | null | undefined;
  intent?: AuthIntent | null | undefined;
  mode?: AuthMode | undefined;
};

// A module of its own that takes only types from the schemas, so a client
// component that links to sign-in does not load Zod with it. A lint rule in
// `eslint.config.mjs` keeps it that way.
export function buildSignInHref({
  returnTo,
  intent,
  mode,
}: BuildSignInHrefInput = {}): Route {
  const searchParams = new URLSearchParams();

  if (returnTo) searchParams.set("returnTo", returnTo);
  if (intent) searchParams.set("intent", intent);
  if (mode === "create-account") searchParams.set("mode", mode);

  const query = searchParams.toString();
  return query ? `/sign-in?${query}` : "/sign-in";
}
