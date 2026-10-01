import type { Route } from "next";

import {
  type AuthIntent,
  authIntentSchema,
  type AuthMode,
  authModeSchema,
  authReturnToSchema,
} from "./schemas";

export type SignInQuery = {
  returnTo: Route | null;
  intent: AuthIntent | null;
  mode: AuthMode;
};

type BuildSignInHrefInput = {
  returnTo?: string | null | undefined;
  intent?: AuthIntent | null | undefined;
  mode?: AuthMode | undefined;
};

type SignInQueryInput = {
  returnTo?: unknown;
  intent?: unknown;
  mode?: unknown;
};

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

function hasSafePrefix(returnTo: string) {
  return (
    returnTo.startsWith("/") && returnTo[1] !== "/" && returnTo[1] !== "\\"
  );
}

export function parseReturnTo(value: unknown, origin: string): Route | null {
  const parsedValue = authReturnToSchema.safeParse(value);
  if (!parsedValue.success) return null;

  const returnTo = parsedValue.data;
  if (!hasSafePrefix(returnTo)) return null;

  try {
    const baseUrl = new URL(origin);
    const targetUrl = new URL(returnTo, baseUrl);

    if (targetUrl.origin !== baseUrl.origin) return null;
    if (
      targetUrl.pathname === "/api" ||
      targetUrl.pathname.startsWith("/api/")
    ) {
      return null;
    }

    // A path from the browser becomes a `Route` only by assertion, and this
    // is where it is checked. The checks prove the path is internal, not that
    // a page exists there; an unknown one renders the not-found page, which is
    // the right end for a redirect.
    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` as Route;
  } catch {
    return null;
  }
}

function parseIntent(value: unknown) {
  const parsedValue = authIntentSchema.safeParse(value);
  if (!parsedValue.success) return null;

  return parsedValue.data;
}

function parseModeOrDefault(value: unknown): AuthMode {
  const parsedValue = authModeSchema.safeParse(value);
  if (!parsedValue.success) return "sign-in";

  return parsedValue.data;
}

export function parseSignInQuery(
  { returnTo, intent, mode }: SignInQueryInput,
  origin: string,
): SignInQuery {
  return {
    returnTo: parseReturnTo(returnTo, origin),
    intent: parseIntent(intent),
    mode: parseModeOrDefault(mode),
  };
}
