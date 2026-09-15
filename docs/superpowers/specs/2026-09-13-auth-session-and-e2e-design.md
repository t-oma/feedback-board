# Auth session and E2E completion design

## Goal

Finish the credential-authentication slice with a reusable server-side session check, a protected placeholder dashboard, sign-out, and a real browser test of the complete account lifecycle.

The existing account-creation and sign-in forms, validation, navigation parsing, and Better Auth configuration remain in place. This slice proves that they create and consume a real session before product onboarding begins.

## Session boundary

Add `src/features/auth/session.server.ts` as a server-only module. It also imports `server-only`, following the module convention from the MVP specification. Its only public function is `requireSession({ returnTo })`, which returns the full Better Auth session when present or redirects to the existing sign-in route when absent.

The module keeps the raw session lookup private because this slice has no caller for which a missing session is an accepted result. That private reader uses React request memoization so multiple guards in one render do not repeat the session lookup. This is not persistent caching. A later request always verifies its own session. If a real optional-session use case appears later, an optional reader can be exposed then.

`requireSession()` builds the redirect through `buildSignInHref()`. For the dashboard, the result is the encoded equivalent of `/sign-in?returnTo=/dashboard`. The sign-in page continues to validate `returnTo` before using it, so a future caller cannot turn this into an external redirect by passing untrusted input.

Do not catch infrastructure failures in the session boundary. A failed database or Better Auth lookup is different from an absent session and must reach the route error boundary.

Consumers import this module directly rather than through `src/features/auth/index.ts`. Keeping the server-only module out of the mixed UI barrel prevents a future Client Component from importing it accidentally.

## Dashboard protection

Add `/dashboard` as a Server Component page. The page calls `requireSession({ returnTo: "/dashboard" })` before rendering any protected content.

Set `export const instant = false` on the page. Session lookup reads request headers and the entire protected route depends on its result, so `/dashboard` intentionally blocks until the server can either return the authenticated content or redirect the guest. The route does not stream a public fallback merely to satisfy Cache Components static-shell validation. A future dashboard with a useful loading shell may revisit this choice with a `Suspense` boundary.

An authenticated user sees only:

- a `Dashboard` heading;
- a form containing the sign-out button.

The page does not query products or render onboarding, filters, owner navigation, or the final dashboard layout. Those belong to the product-onboarding slice. The placeholder exists to provide a real authenticated destination and a stable assertion for the browser tests.

Keep the session check at page level. A future dashboard layout may own shared visual structure, but it must not become the only authorization check. Next.js layouts can remain mounted across client navigation, while each protected page and Server Action needs a fresh check close to the data it protects. The MVP continues not to rely on `proxy.ts` as a security boundary.

## Sign-out

Add `signOutAction()` to the existing auth actions module. It passes the current request headers to Better Auth, waits for sign-out to complete, and then redirects to `/`. The existing `nextCookies()` plugin copies Better Auth's session-cookie changes into the Server Action response.

Sign-out is intentionally idempotent. It does not call `requireSession()` first. If the session expires after the dashboard renders, submitting the form still clears any available auth cookie and returns the user home. This action does not read or mutate protected domain data, unlike future dashboard actions that must verify the session independently.

If Better Auth throws, the action must not issue the success redirect. The error reaches the nearest error boundary. This slice does not add a sign-out-specific toast or inline error.

Render the action through a native form. A small `SignOutButton` Client Component sits inside it and reads `useFormStatus()`. While submission is pending, it passes `disabled`, `showSpinner`, and `aria-busy` to the existing shared `Button`. The visible label remains `Sign out`, which avoids a width change and keeps the pending action understandable to assistive technology.

## Navigation flow

The completed flow is:

1. A guest opening `/dashboard` is redirected to sign-in with `/dashboard` as `returnTo`.
2. Account creation without an explicit safe destination keeps its current `/dashboard` fallback.
3. Successful account creation establishes a session and opens the protected dashboard.
4. Sign-out deletes the session, clears the browser cookie, and returns to `/`.
5. Reopening `/dashboard` redirects to sign-in again.
6. A sign-in URL carrying `returnTo=/dashboard` returns the authenticated user to the dashboard.

This slice does not change the existing bare sign-in fallback of `/` or the account-creation fallback of `/dashboard`.

## Unit tests

Add focused Vitest coverage for the new boundaries.

Session tests verify that:

- the current request headers reach `auth.api.getSession()`;
- `requireSession()` returns the valid session unchanged;
- a missing session redirects through the expected sign-in URL;
- an unexpected session lookup failure is rethrown rather than treated as a guest.

Action tests verify that:

- `signOutAction()` passes the request headers to `auth.api.signOut()`;
- successful sign-out redirects to `/`;
- a thrown sign-out error prevents that redirect and propagates to the caller.

The shared Button already documents its spinner and disabled states in Storybook. The browser journey covers their use in the sign-out form, so this slice does not add a separate DOM test solely for `useFormStatus()`.

## Playwright setup and browser coverage

Add a minimal Playwright configuration and a `test:e2e` package script. Keep browser tests in a dedicated `e2e` directory with an `.e2e.ts` suffix so Vitest does not collect them.

When `FEEDBACK_BOARD_ENV` is `test`, Next.js writes development output to the ignored `.next-e2e` directory instead of `.next`. The isolated Playwright server can therefore run on port `3100` while the regular development server remains active on port `3000`, without sharing a Next.js lock or build cache.

The suite runs against the real Next.js app, Better Auth handler, and PostgreSQL database. The E2E process must receive explicit test values for the existing `DATABASE_URL` and `DATABASE_URL_UNPOOLED` variables. Test setup parses both URLs and aborts unless each names a database whose decoded path is exactly `/feedback_board_test`. It performs this check before applying migrations or starting the Next.js server. A missing test database is a setup error rather than permission to create, reset, or reuse the development database.

Apply the checked-in Drizzle migrations to the test database before the suite. Do not reset or truncate it in this slice. Each account journey generates a unique email address and does not depend on test execution order. This leaves small amounts of test data locally, while avoiding a destructive reset utility before the project needs one.

Cover two browser scenarios:

1. A guest opens `/dashboard` and reaches sign-in with the decoded `returnTo` value `/dashboard`.
2. A unique user creates an account, reaches `Dashboard`, signs out, fails to reopen the protected route, sees the existing generic error after entering a wrong password, then signs in with the correct password and returns to `Dashboard`.

These tests cover the session cookie and redirects through public behavior. They do not inspect Better Auth tables or set cookies through test-only shortcuts.

## Verification

Run the repository checks in this order:

1. Prettier check.
2. ESLint.
3. TypeScript check.
4. Vitest.
5. Next.js production build.
6. Storybook production build.
7. Playwright E2E against `feedback_board_test`.

Manual verification should also confirm that the sign-out button becomes disabled and shows its spinner during a delayed submission, without changing its label or layout.

## Out of scope

This slice does not implement product onboarding, owner authorization, `/dashboard/settings`, the final dashboard design, OAuth, password reset, email verification, global auth state, Proxy-based redirects, database reset tooling, or CI services for Playwright. Those changes can build on the session boundary and E2E setup added here.
