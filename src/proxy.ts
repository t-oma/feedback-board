import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { buildSignInHref } from "@/features/auth/navigation";

// Sends a guest to sign in before the protected route renders at all.
//
// This does not replace the `requireSession` check inside the page, and must
// not: all this sees is whether a session cookie is present, never whether it
// is valid or still current. The page is what authenticates; this only decides
// where an unauthenticated request is sent.
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
