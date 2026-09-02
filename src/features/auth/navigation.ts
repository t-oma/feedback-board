import {
  authIntentSchema,
  type AuthMode,
  authModeSchema,
  authReturnToSchema,
  type AuthIntent,
} from "./schemas";

export type AuthNavigation = {
  returnTo: string;
  hasExplicitReturnTo: boolean;
  intent: AuthIntent | null;
  mode: AuthMode;
  supportingText: string | null;
};

type BuildSignInHrefInput = {
  returnTo?: string;
  intent?: AuthIntent;
  mode?: AuthMode;
};

type ParseAuthNavigationInput = {
  returnTo?: unknown;
  intent?: unknown;
  mode?: unknown;
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
  mode,
}: BuildSignInHrefInput = {}) {
  const searchParams = new URLSearchParams();

  if (returnTo) searchParams.set("returnTo", returnTo);
  if (intent !== undefined) searchParams.set("intent", intent);
  if (mode === "create-account") searchParams.set("mode", mode);

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

export function parseAuthNavigation({
  returnTo,
  intent,
  mode,
  origin,
  fallback,
}: ParseAuthNavigationInput): AuthNavigation {
  const parsedReturnTo = parseReturnTo(returnTo, origin);
  const parsedIntent = parseIntent(intent);

  return {
    returnTo: parsedReturnTo ?? fallback,
    hasExplicitReturnTo: parsedReturnTo !== null,
    intent: parsedIntent,
    mode: parseModeOrDefault(mode),
    supportingText: parsedIntent ? intentMessages[parsedIntent] : null,
  };
}
