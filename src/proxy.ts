import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { buildSignInHref, parseReturnTo } from "@/entities/user/navigation";
import { appOrigin, env } from "@/server/env";

export async function proxy(request: NextRequest) {
  // Only a page request is redirected. A Server Action is a POST to the route
  // that renders its form, and a redirect is no answer to one: the browser
  // repeats the POST to the new address, gets a page back instead of the
  // action's result, and the route error boundary replaces the form. A
  // protected action answers a missing session itself with `UNAUTHENTICATED`,
  // and an auth action runs as submitted. `e2e/auth.e2e.ts` covers sign-out
  // from a tab whose session has ended.
  if (request.method !== "GET") return NextResponse.next();

  if (request.nextUrl.pathname === "/sign-in") {
    return sendSignedInVisitorOn(request);
  }

  return sendGuestToSignIn(request);
}

// Sends a guest to sign in before the protected route renders at all.
//
// It is here because of *when* the redirect happens. A redirect raised while
// the page renders arrives after the static shell has already been flushed, so
// it reaches the browser as a 200 followed by a client-side navigation. The
// router remembers that answer for the route, and replays it on the next
// navigation there -- including the one the sign-in action performs moments
// later -- which left a user who had just signed in sitting on the sign-in
// page, with a valid session, until they reloaded by hand. Deciding here, with
// no render started and nothing flushed, makes it an ordinary 307 that leaves
// nothing behind. `e2e/auth.e2e.ts` covers the journey that exposed this.
//
// This does not replace the `requireSession` check inside the page, and must
// not: all this sees is whether a session cookie is present, never whether it
// is valid or still current. The page is what authenticates; this only decides
// where an unauthenticated request is sent.
//
// Presence is still enough to fix what it is here to fix. Better Auth gives
// the cookie exactly the session's lifetime, extends the two in the same
// write, and clears the cookie outright when that write fails, so an expired
// session is an absent cookie rather than a stale one -- measured at a
// difference of 0 seconds. What would slip past is a cookie that outlives its
// row: one deleted out of band, or one that was never valid. Such a request
// reaches the page, which rejects it correctly but mid-render, and so brings
// the whole problem above back for that one visit. Nothing the app offers can
// produce that today; adding server-side revocation ("sign out everywhere")
// would. At that point this check has to become authoritative, the way the one
// for `/sign-in` below is, at the cost of a lookup on every request to a
// guarded route.
function sendGuestToSignIn(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  // The query belongs in `returnTo` as much as the path does -- a guest sent
  // here from a filtered or sorted view should come back to that view, not to
  // its bare route. The fragment is unrecoverable: a browser never sends it.
  //
  // Next strips its own prefetch parameter before this runs, verified against
  // a request for `/dashboard?tab=planned&_rsc=…`, which arrives here as
  // `?tab=planned`. So this cannot put a stale `_rsc` into a sign-in link.
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const signInUrl = new URL(buildSignInHref({ returnTo }), request.url);

  return NextResponse.redirect(signInUrl);
}

// Sends a visitor who is already signed in past the sign-in page, where
// either form would only start a second session beside the first. It decides
// here rather than in the page for the reason the guest redirect above gives:
// `/sign-in` streams behind its `loading.tsx` too.
//
// Unlike that redirect, this one reads the full session. A cookie that
// outlives its session would otherwise go round forever: the dashboard rejects
// it and sends it here, and a check by presence would send it straight back.
// `e2e/auth.e2e.ts` covers that cookie. A guest without any cookie still costs
// no lookup.
//
// The session comes from Better Auth's own endpoint, not from `auth.api`. The
// proxy is bundled apart from the app but runs in the same process, and the
// Next.js proxy guide advises against relying on shared modules or globals.
// Importing the auth configuration here shared the app's database client
// between the two bundles, and the app then reported a taken slug as an
// unexpected error, which `e2e/onboarding.e2e.ts` checks. ESLint rejects
// those imports in this file.
async function sendSignedInVisitorOn(request: NextRequest) {
  const cookie = request.headers.get("cookie");
  if (!cookie || !getSessionCookie(request)) return NextResponse.next();

  const lookup = await fetch(
    new URL("/api/auth/get-session", env.BETTER_AUTH_URL),
    { headers: { cookie }, cache: "no-store" },
  );
  const session: unknown = lookup.ok ? await lookup.json() : null;

  const response =
    session === null
      ? NextResponse.next()
      : NextResponse.redirect(
          new URL(signedInDestination(request), request.url),
        );

  // The lookup may have changed the cookie: extended a session that was due,
  // or expired one with no session behind it. Either change has to reach the
  // browser, or the cookie stops matching its session.
  for (const setCookie of lookup.headers.getSetCookie()) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}

function signedInDestination(request: NextRequest) {
  // Read the way the page reads it. The page gets a repeated parameter as an
  // array, which `parseReturnTo` rejects, so neither of the values is used.
  const values = request.nextUrl.searchParams.getAll("returnTo");

  return (
    parseReturnTo(values.length === 1 ? values[0] : values, appOrigin) ??
    "/dashboard"
  );
}

export const config = {
  // `:path*` matches zero or more segments, so this covers `/dashboard` itself
  // and anything added beneath it later.
  matcher: ["/dashboard/:path*", "/sign-in"],
};
