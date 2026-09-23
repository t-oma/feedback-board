import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { buildSignInHref } from "@/features/auth/navigation";

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
// would. At that point this check has to become authoritative, which it can:
// Proxy runs on the Node runtime by default, so `auth.api.getSession` is
// available here, at the cost of a query on every request to a guarded route.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const signInUrl = new URL(
    buildSignInHref({ returnTo: request.nextUrl.pathname }),
    request.url,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // `:path*` matches zero or more segments, so this covers `/dashboard` itself
  // and anything added beneath it later.
  matcher: ["/dashboard/:path*"],
};
