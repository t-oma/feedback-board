import {
  authIntentSchema,
  authReturnToSchema,
  type AuthIntent,
} from "./schemas";

export type AuthNavigation = {
  returnTo: string;
  hasExplicitReturnTo: boolean;
  intent: AuthIntent | null;
  supportingText: string | null;
};

type BuildSignInHrefInput = {
  returnTo?: string;
  intent?: AuthIntent;
};

type ParseAuthNavigationInput = {
  returnTo?: unknown;
  intent?: unknown;
  origin: string;
  fallback: string;
};

const intentMessages: Record<AuthIntent, string> = {
  vote: "Sign in to vote.",
  feedback: "Sign in to add feedback.",
  board: "Sign in to create your board.",
};

export function buildSignInHref({
  returnTo,
  intent,
}: BuildSignInHrefInput = {}) {
  const searchParams = new URLSearchParams();

  if (returnTo) searchParams.set("returnTo", returnTo);
  if (intent !== undefined) searchParams.set("intent", intent);

  const query = searchParams.toString();
  return query ? `/sign-in?${query}` : "/sign-in";
}

function hasSafePrefix(returnTo: string) {
  return (
    returnTo.startsWith("/") && returnTo[1] !== "/" && returnTo[1] !== "\\"
  );
}

function parseReturnTo(value: unknown, origin: string) {
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

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return null;
  }
}

export function parseAuthNavigation({
  returnTo,
  intent,
  origin,
  fallback,
}: ParseAuthNavigationInput): AuthNavigation {
  const parsedIntent = authIntentSchema.safeParse(intent);
  const safeIntent = parsedIntent.success ? parsedIntent.data : null;
  const parsedReturnTo = parseReturnTo(returnTo, origin);

  return {
    returnTo: parsedReturnTo ?? fallback,
    hasExplicitReturnTo: parsedReturnTo !== null,
    intent: safeIntent,
    supportingText: safeIntent ? intentMessages[safeIntent] : null,
  };
}
