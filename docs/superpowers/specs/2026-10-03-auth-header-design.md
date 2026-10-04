# Auth header and exit navigation

## Scope

Implement the agreed way to leave sign-in without authenticating. Keep this work on `codex/auth-header`; other auth component refactoring is a separate change.

## Navigation

Derive the exit link from the normalized `returnTo` returned by `parseSignInQuery`. No database lookup and no new URL parameter.

- A public board at `/p/<slug>` returns `kind: "board"` with its `slug`.
- A feedback detail at `/p/<slug>/feedback/<id>` returns `kind: "feedback"`.
- A changelog at `/p/<slug>/changelog` returns `kind: "changelog"`.
- Preserve the original normalized destination, including query and fragment.
- Missing, unsafe, protected, auth, and unrecognized destinations return `kind: "home"` pointing to `/`.
- Recognize lowercase alphanumeric slug segments separated by single hyphens. This recognizes a route shape; it does not verify that a product or feedback exists.
- Exit navigation uses an ordinary link. It does not read browser history, submit credentials, create a session, or replay a protected action.
- The post-authentication redirect remains governed by the existing Server Actions.

Expose `getAuthBackTarget(returnTo: Route | null): AuthBackTarget` from the existing navigation module. The discriminated union has `kind` and `href: Route` on every variant, and a required `slug: string` only for `kind: "board"`. Navigation returns no UI copy or translation keys.

## Presentation

Use the existing warm surface, border, foreground, and serif typography tokens. Apply no new visual theme.

On widths below Tailwind's `md` breakpoint, the exit link occupies the 48px top navigation bar. At `md` and above, show the Feedback Board home link in a 60px brand row, then the exit link below it. Both rows belong to one always-visible `header`; only the brand row is hidden on mobile. Align the exit link with the existing content padding. Keep a visible focus indicator and truncate long labels without changing the accessible name.

`AuthHeader` accepts a required `backTarget` object. A private exhaustive `getBackLabel` switch owns complete messages: `Back to Feedback Board`, `Back to <slug>`, `Back to feedback`, and `Back to changelog`. Future translation calls belong here, without assembling independently translated prefixes or adding localization infrastructure now. Remove `goBackText`, which currently changes a destination label without changing its address. A companion `AuthHeaderSkeleton` shares the same private frame and reserves the exit link space without rendering a provisional exit link. The desktop brand home link is independent of request data and may remain actionable in the fallback.

The form's responsive card design is outside this change.

## Rendering

Keep metadata static. One Suspense boundary wraps a private async `AuthPageFromQuery` in the route. It awaits and parses `searchParams` once, derives the exit link, and renders the header and existing auth content.

The fallback renders `AuthHeaderSkeleton`, followed by `AuthMain` containing the existing `AuthContentSkeleton`. Do not key the forms by mode or change their mounted state.

## Verification

- Unit tests cover destination kinds, board slugs, exact destination preservation, and home fallbacks, including unsafe inputs through `parseReturnTo`.
- Header stories cover home, board, feedback, changelog, long labels, and loading. Story play functions assert destination and accessible name; loading exposes no exit link.
- A browser journey switches sign-in modes before using the exit link, verifies that a protected target exits to home, and verifies the visitor remains a guest.
- A public return target retains its exact href through mode switches. Public board routes are not implemented in this checkout, so do not invent a board page to test this.
- Run formatting, lint, typecheck, unit/story tests, production E2E, and Storybook build. Inspect header at mobile and desktop widths.

## Local framework references

Read Next.js 16.3.1's bundled `01-app/01-getting-started/08-caching.md` and `01-app/03-api-reference/03-file-conventions/page.md`. Runtime search params are read below Suspense. The existing normalized route assertions remain in `parseReturnTo`.
