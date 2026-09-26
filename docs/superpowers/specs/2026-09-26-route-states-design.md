# Route states design

## Goal

Give the application the unexpected-error and not-found UI that the MVP specification requires. The auth actions already rethrow unexpected failures to "the nearest error boundary", and today there is none, so a failure reaches Next.js's generic error page.

That UI needs two shared components the project does not have yet: a button with variants and a pending state, and a link that can look like a button. This change also gives every page its own document title.

The visual source is the states sheet in both design files: "02 · Unexpected error" and "03 · Not found".

## Button

`Button` is built on Base UI's `Button` and renders a native `<button>`. Its props are the native button props without `className`, plus:

- `variant`: `"primary"` or `"secondary"`, default `"primary"`;
- `pending`: the submission this button started is in flight;
- `disabled`: the button cannot be used for another reason, such as Cancel while a save runs.

`showSpinner` is removed. `render`, `nativeButton` and `focusableWhenDisabled` are not exposed. As in Base UI, `type` defaults to `"button"`, so a submit button states `type="submit"`.

### Pending

`pending` passes `disabled` together with `focusableWhenDisabled` to Base UI, and adds a spinner and `aria-busy="true"`. With both set, Base UI renders `aria-disabled="true"` instead of the native `disabled` attribute, so the button keeps focus while the request runs. It also cancels click and every key except Tab. That includes the click a browser synthesizes on the default button when Enter is pressed in a field, so a second submission cannot start. Base UI's documentation recommends `focusableWhenDisabled` for exactly this loading case.

A plain `disabled` stays native: the button leaves the tab order and shows no spinner. `pending` implies disabled, so a caller never passes both for the same reason.

The three current callers change from `disabled={pending} showSpinner={pending}` to `pending={pending}`. `SignOutButton` also drops its own `aria-busy`, which `pending` now sets.

### Variants

`src/components/button/variants.ts` exports the `ButtonVariant` type and a function that returns the classes for a variant. It is not exported from `src/components/button/index.ts`; only `Button` and `Link` import it. The class map is declared with `satisfies Record<ButtonVariant, string>`, so a variant without classes does not compile.

- Shared: `inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium`, the existing focus ring, and the existing press scale.
- Primary: `bg-accent text-surface`; disabled `bg-accent-muted`.
- Secondary: `border border-border bg-surface text-foreground-secondary`. The design's disabled secondary uses three colours that have no token. They map to the nearest existing ones: `border-border-subtle`, `bg-background` (an exact match), `text-foreground-disabled`. No token is added.

Disabled, hover and press styles key on Base UI's `data-disabled` attribute, never on `:disabled` or `:enabled`. A pending button is not natively disabled, and an anchor is never `:enabled`, so either pseudo-class would silently miss one of them. Hover and press use `not-data-disabled:`, which compiles to `:not([data-disabled])` and matches a button and a link alike.

### Width

`w-full` is removed. The parent's layout decides width. The auth forms are flex columns, so their submit buttons keep their full width through the default `align-items: stretch`. The sign-out form drops its `max-w-48` wrapper class, and its button takes the width of its label.

## Link

`src/components/link/` renders `next/link`. Its props are the `next/link` props without `className`, plus a required `variant`, which is `ButtonVariant` for now and uses the same classes as `Button`. There is no default, because no single look is "a link" in this design. A link has no `disabled` or `pending`.

`Link` is generic over the route type in the same way `next/link` is, so that `typedRoutes`, planned for a later change, checks an `href` passed through it.

Base UI's `Button` is not used for links. Its documentation says a link must not be rendered as a button, and with `nativeButton={false}` it sets `role="button"` on the anchor. A screen reader would then announce a button for what is a navigation.

`next/link` stays in direct use where this component does not fit:

- a `Tabs.Tab` rendered as a link, because Base UI passes its own `className` into the rendered element and `Link` would replace it;
- feature-specific looks, such as the guest vote control or `AuthHeader`, in the same way a feature uses a plain `<button>` for a bespoke control.

## EmptyState

`src/components/empty-state/` shows an absence: "03 · Not found" now, the empty board and list states later.

Props: `eyebrow` (optional, such as `"404"`), `title`, `description`, `headingLevel`, and the actions as `children`.

- Everything is centred.
- The eyebrow uses the mono font with wide letter spacing in `text-foreground-subtle`. The design colours it `#8c877c`, the `foreground-faint` token, but axe measures that at 3.28:1 on `background` for 12 px text, below the 4.5:1 AA minimum.
- The title is `font-serif text-lg font-semibold`. The design uses 19 px on mobile and 17 px on desktop, and 18 px sits between them.
- The description is `text-sm text-foreground-muted`, limited to `max-w-72`.
- Actions stack and stretch to full width on mobile. From `sm`, they sit in a centred row at their natural width.

## ErrorState

`src/components/error-state/` shows a failure: "02 · Unexpected error".

Props: `title`, `description` (optional), `headingLevel`, and the actions as `children`.

- The container is `rounded-lg border border-danger-border bg-danger-surface p-4` with `role="alert"`, because an error often appears after a client navigation, and without a live region a screen reader never hears of it.
- The title is `font-serif text-base font-semibold`; the description is `text-sm text-foreground-muted`.
- On mobile the content is centred and the actions stack at full width, as the design's mobile note describes for error states. From `sm`, the content aligns left and the actions sit in a row.

Both state components render no client state and accept no `className`. `headingLevel` is required because only the caller knows the page's heading outline: the not-found page needs an `h1`, while an empty board will sit under the page's own `h1`.

## Route files

### `src/app/not-found.tsx`

Renders a `<main>` with `EmptyState`:

- `headingLevel={1}`;
- eyebrow `404`;
- title "This page doesn’t exist", with the design's typographic apostrophe;
- description "The link may be wrong, or the board may have moved to a new address.";
- one action, `<Link variant="secondary" href="/">Go to the landing page</Link>`.

The document title is "Page not found · Feedback Board", set by a `metadata` export with the layout's template. Next.js documents `metadata` only for the experimental `global-not-found.js`, so this was checked on the production build: the page renders exactly one `<title>`, with that text. The end-to-end test asserts it.

### `src/app/error.tsx`

A Client Component receiving `error` and `retry`. It renders a `<main>` with `ErrorState`:

- `headingLevel={1}`;
- title "We couldn't load this page. Please try again.";
- actions: `<Button onClick={retry}>Retry</Button>` and `<Link variant="secondary" href="/">Go to the landing page</Link>`.

The design's second sentence, "If it keeps happening, the board may be temporarily unavailable.", and its "Go to the board" action assume a board. The root boundary has none, so both are left out here. They belong to the board's own error boundary.

It adds no client logging. Next.js already logs server errors on the server, which is what the MVP specification requires, and the project has no reporting service to send client errors to.

### `src/app/global-error.tsx`

Replaces the root layout when the layout itself fails. It renders its own `<html lang="en">` and `<body>`, imports `globals.css`, sets `<title>Feedback Board</title>`, and shows the same `ErrorState` with Retry. It loads no web fonts; the serif stack's fallback is enough for a last-resort page.

## Document titles

- `src/app/layout.tsx`: `title: { default: "Feedback Board", template: "%s · Feedback Board" }`.
- `/sign-in`: `"Sign in"`, in both modes. A title per mode would need `generateMetadata` reading `searchParams`, which makes the head request-dependent for no user-facing gain.
- `/dashboard`: `"Dashboard"`. It needs no `noindex`, because a guest receives a 307 from the proxy before anything renders.
- `/`: the default.

## Decisions for later slices

These were settled while designing this change. Nothing here implements them.

**The sign-in header uses one composition at every width.** The design files disagree: mobile merges the way back into a brand-styled `← Orbit CLI`, while desktop shows the brand on the left and a muted `← Back to orbit-cli` on the right. The desktop form wins everywhere. The brand, the logo and "Feedback Board", is a link to `/`. The back link is `Link variant="subtle"`, the same look as "← Back to board" and "← Back to feedback", and names the board by the slug taken from `returnTo`, so the header needs no database read and no Suspense boundary of its own. It appears only when `returnTo` points at a board. `AuthHeader` changes with the board slice, which is when `returnTo` can first point at one, and `subtle` is added then.

**Unexpected mutation failures stay in the form.** The design's "11 · Mutation failure" banner wins over the MVP specification's route error boundary for writes: the form keeps its values apart from the password and shows one announced, focused banner. Reads keep the route boundary this change adds. The MVP specification is updated in the change that implements the banner.

## Verification

Stories, run by the story project with axe enforced:

- `Button`: primary, secondary, disabled, pending. The pending story's `play` checks `aria-disabled` and `aria-busy`, that the button still takes focus from the keyboard, and that clicking it does not call `onClick`. The disabled story checks the opposite: the native attribute, and no focus.
- `Link`: primary and secondary. `play` checks the role is `link`.
- `EmptyState`: with and without an eyebrow, each with an action. `play` checks the heading level.
- `ErrorState`: with two actions. `play` checks the `alert` role and the heading level, and that Retry calls its handler.

`src/components/types.test-d.ts` gains a line for each new component directory.

End-to-end tests against the production build:

- a new test opens an unknown URL and expects status 404, the `h1` "This page doesn’t exist", a link to `/` named "Go to the landing page", and the document title "Page not found · Feedback Board";
- the existing tests assert "Sign in · Feedback Board" and "Dashboard · Feedback Board" with `toHaveTitle`.

`error.tsx` and `global-error.tsx` have no automated test. Reaching them needs a page that fails in a production build, and a failing route must not ship. They are checked by hand with a temporary throw, and the result goes into the pull request description.

`pnpm verify` passes, and so does `pnpm build-storybook`, which the auth-session specification lists and CI does not run.

## Out of scope

- An error boundary for a board region, with the design's full 02 copy.
- `subtle` and `accent` link variants, and the `AuthHeader` change.
- The mutation-failure banner.
- A `size` variant for compact desktop buttons.
- `typedRoutes`.

## Sources

- Base UI Button documentation, "Rendering links as buttons" and "Loading states": `node_modules/@base-ui/react/docs/react/components/button.md`.
- Base UI source for the pending behaviour: `internals/use-button/useButton.mjs` and `utils/useFocusableWhenDisabled.mjs`.
- Next.js `error.js` and `not-found.js` references under `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/`.
- Design states sheet, "02 · Unexpected error" and "03 · Not found", in `docs/desktop-design.dc.html` and `docs/mobile-design.dc.html`.
