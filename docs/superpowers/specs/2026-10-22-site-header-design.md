# Site header design

## Context

Each route draws its own header. The dashboard's holds the brand and a Sign
out button. The board's holds the product name and a `feedback` tag in mono.
The sign-in page's has two rows from `sm` up, the brand and a way back, and
below `sm` only the way back, as a bar of its own. All of them repeat the same
frame, `layout-grid h-15 border-b border-border bg-surface`, and so do the
board's loading state and the sign-in brand row.

The MVP specification already fixes the part they are missing: "the
viewer-dependent part of the site header, meaning the sign-in control or the
account menu, streams separately on every page". The board left its sign-in
control out while nothing on the board needed a session. The feedback list
and its votes will need one.

The desktop design draws every header as one 60-pixel bar, the product or the
brand at the start and controls at the end: Sign in for a guest, Dashboard and
an avatar on a public page for a signed-in visitor, an email and an avatar on
the dashboard. The mobile design draws the feedback detail, sign-in, and
settings pages with a way back in place of the bar: "The top bar is the way
back and names where you came from". On a wider screen, the feedback detail
and settings pages put "← Back to board" and "← Back to feedback" on the first
line of the page under the bar.

## Decision

Headers share one frame with a slot at the end and an optional row with the
way back. A widget in a new `widgets` layer fills the end slot for the viewer.

### SiteHeader

`SiteHeader` in `src/components/site-header/` is the frame. Its children are
the identity at the start, the brand or the product. `end` is what sits at the
end of the bar, and `back` is the way back:

```tsx
<SiteHeader end={viewer} back={<BackLink href={…} label="Back to board" />}>
  <BrandLink />
</SiteHeader>
```

The bar is 60 pixels tall at every width, on the layout grid, white with a
border under it. The identity keeps `min-w-0` and truncates, and the end keeps
`shrink-0`, so on a 320-pixel phone a long product name gives way and the
avatar keeps its size.

With `back`, the header follows the design at both widths. Below `sm` the bar
holds the way back and the end, and the identity is hidden. From `sm` up the
bar holds the identity and the end, and a transparent row under it holds the
way back, where it reads as the first line of the page.

The header renders the way back twice, once for each width, and hides the
other copy with `display: none`. A single copy moved by the grid would come
after the end in the Tab order at one width and before it at the other, while
it always sits to the start of the end on screen. The hidden copy is out of
the accessibility tree and cannot take focus. The end renders once, because it
holds the account menu and its `Suspense` boundary.

`BackLink`, beside it, takes `href` and `label` and keeps what the sign-in
page's link does now: the arrow, a label that truncates without changing its
accessible name, the brand's serif in the bar and muted text in the row, and
the focus ring drawn inside, because on a phone the bar is the top of the
page. `BackLinkSkeleton` holds the link's place while the target is unknown.

The way back is a link in the banner, with no navigation landmark of its own.
A landmark around one link adds an entry to a screen reader's list of
landmarks and names nothing the link's text does not. GOV.UK's design system
draws its back link as a plain link at the top of the page, and notes that a
checker's warning about it standing outside a landmark "does not affect WCAG
compliance"; ours stands inside the banner.

### Avatar

`Avatar` in `src/components/avatar/` is a 32-pixel circle in `border-subtle`
with the viewer's initials in `foreground-secondary`, 8.4:1. The design
draws it at 26 pixels; 32 keeps two letters readable. The initials are
`aria-hidden`, since the control around them carries the name.

`getInitials(name)` takes the first grapheme of the first and the last word,
in upper case, and one letter for a single word. `Intl.Segmenter` splits the
graphemes, so an emoji or a letter with a combining mark stays whole. Firefox
has it from version 125 while Next.js builds for 111, so without it the first
code point stands in. The name is normalized to NFC first, which keeps a
letter and its combining mark one code point on both paths.

`AvatarSkeleton` takes the account trigger's 48-pixel box with a
`surface-muted` circle inside, so the trigger replaces it without moving.

### Menu

`src/components/menu/` styles Base UI's `Menu` for the project, as
`src/components/tabs/` does `Tabs`. The popup opens below its trigger and
lines up with its end, 8 pixels away. It stays modal, Base UI's default: while
it is open the page does not scroll and a click outside it reaches nothing
underneath.

A group label is smaller than an item and muted, so it does not read as one
more item.

An item that is highlighted, by the pointer or the keyboard, gets the
`surface-muted` background, and on `:focus-visible` also the inside focus
ring. The background alone is 1.14:1 against the surface, short of the 3:1 a
focus indicator needs.

### The viewer widget

`src/widgets/viewer/ui/` holds what the end slot shows.

`ViewerControl` is a Server Component. It wraps an async component in
`Suspense`, and that component reads `getSession()` and renders `AccountMenu`
for a session or `SignInLink` without one. Only the name and the email cross
to the client. `getSession` is wrapped in React's `cache`, so the dashboard
page's `requireSession` and the header share one lookup per request.

`AccountMenu` reaches the page through `LazyAccountMenu`, a Client Component
that imports it with `next/dynamic`, so Base UI's menu loads only for a
signed-in visitor. Imported straight from `ViewerControl`, the menu's chunk
went into every visitor's page shell, a board's guests included. The import
sits in a Client Component because Next.js does not split a Client Component
that a Server Component imports dynamically.

`SignInLink` is the secondary `Link` to
`buildSignInHref({ returnTo: useCurrentPath() })`.

`AccountMenu` takes `name` and `email`. Its trigger is a 48-pixel button,
the height of `Button` and `Link`, named "Account", with the `Avatar` inside
and the outside focus ring, which the 60-pixel bar has room for. The popup
holds one group:

```
Menu.Group
  Menu.GroupLabel   name in medium weight, then email, muted and truncated
  Separator
  Menu.LinkItem     Dashboard
  Separator
  SignOutMenuItem   Sign out
```

The group label names the group, so the name and the email are not loose
text inside `role="menu"`. Dashboard renders through `next/link`, for
client-side navigation and prefetching, and marks itself with
`aria-current="page"` on `/dashboard`. It closes the menu on click. Base UI's
`LinkItem` does not by default, and the dashboard layout stays mounted across
navigation, so the menu would stay open over the next page.

### Signing out

Signing out keeps the visitor on the page they were on. `SignOutMenuItem` in
`src/features/sign-out/ui/` replaces `SignOutButton`: a form inside the popup
whose action calls `signOutAction`, which only signs out, and then
`router.refresh()`, and a `Menu.Item` rendered as its submit button.

The refresh is a new request for the same page, so it meets the proxy. A
protected page answers it with sign-in, with the page as `returnTo`, and a
public page renders again without the session. Which pages are protected
stays in one place, the proxy's `matcher`.

A redirect from the action does not work for a protected page. Next.js fetches
the redirect's target on the server and returns what it gets under the address
the action named, so the proxy's answer, the sign-in form, shows under the
dashboard's address (`createRedirectRenderResult` in Next.js's action
handler). The end-to-end tests catch it.

The item keeps the menu open while the action runs. Base UI unmounts a closed
popup, and the form with it, so with the menu closed the visitor would see
nothing until the page changes. While pending, the item reads "Signing out…"
and is `disabled` and `aria-busy`.

The menu needs JavaScript to open, so signing out does too. The header's
Sign out button used to work without it.

`useCurrentPath()` in `src/shared/` returns the path and the query from
`usePathname()` and `useSearchParams()`, such as `/p/orbit-cli?sort=top`, with
no `?` when the query is empty, for the viewer's Sign in link. It sits in the
bottom layer because the vote and add-feedback controls, which the MVP
specification sends a guest to sign in from, are features and will need the
same path. `useSearchParams` needs a `Suspense` boundary under Cache
Components, and the link renders only inside `ViewerControl`'s.

### While the session loads

`ViewerControl` takes `expectSignedIn`. With it, the fallback is
`AvatarSkeleton`; without it, nothing. The dashboard passes it, because the
proxy lets only a visitor with a session cookie through, so the circle almost
always becomes the avatar. A public page does not: most visitors of a board
are guests, and a circle that turns into Sign in is a wrong hint. The bar's
height is fixed and the identity sits at the start, so the end filling in
moves nothing.

Navigation inside a section does not show the fallback again when the header
lives in the section's layout, since layouts do not re-render on navigation.
The dashboard's does. The board's moves into `src/app/p/[productSlug]/layout.tsx`
with the second route under the board.

### Failure

The end slot has no error boundary of its own. When `getSession()` fails, the
error reaches the route's `error.tsx`. The pages that show the slot read the
same database, so a quiet slot would only show a signed-in visitor Sign in.

A session that ends while the visitor moves between dashboard pages leaves the
avatar on screen until a reload, because the layout does not re-render. Each
page checks the session itself, so this changes what the header shows, not
who gets in.

### The headers

- The dashboard layout renders
  `<DashboardHeader viewer={<ViewerControl expectSignedIn />} />`, and
  `DashboardHeader` is the brand with the viewer at the end. The Sign out
  button leaves the header.
- The board page passes `viewer={<ViewerControl />}` to `Board`, which hands it
  to `BoardHeader`. The board header shows the product name alone; the
  `feedback` tag goes. The loading state's header has no end.
- `AuthHeader` is the brand with `back`, the sign-in page's link, and no end,
  since the proxy sends a signed-in visitor past `/sign-in`. Its labels stay as
  they are, and the "Exit authentication" navigation landmark goes. Its loading
  state passes `BackLinkSkeleton` as `back`. The header is 60 pixels tall on a
  phone, where it was 48.
- Stories render these components with `AccountMenu` or `SignInLink` in place
  of `ViewerControl`, which is async and stays with the end-to-end tests, as
  the layers design does for async pages.

### The widgets layer

`widgets` sits between `app` and `features`. It holds UI that several routes
render and that composes features and entities. A widget imports features,
entities, and the bottom layer; it never imports `app` or another widget; and
nothing below it imports a widget. ESLint's `no-restricted-imports` checks this
as it does for the other layers, and `.storybook/main.ts` lists the layer with
the `Widgets` title prefix. The layers design gains the row, the rules, and
`widgets` in the list of layers a component moves down to when a second route
needs it.

### Departures from the design

The MVP specification's user interface layer records these:

- A signed-in visitor sees one avatar menu on every page. The Dashboard button
  and the email move into the menu.
- On a phone, the way back on the feedback detail and settings pages has the
  avatar at its end, where the design draws the way back alone.
- The board header has no `feedback` tag.
- The avatar is 32 pixels, where the design draws 26.
- From `sm` up the sign-in page's way back sits in the row under the bar,
  where the design puts it at the end of the bar.
- The header has no Sign out button; the menu holds it.

### Not in this change

- The design's mark before the brand and the product name.
- The owner's header: the OWNER tag, Copy board link, View public board, and
  Settings.
- Menu items that depend on whether the visitor owns a board.
- The landing page's header.
- The board header in the board's layout, which comes with the second route
  under the board.
- The phone label "← Orbit CLI" for the feedback detail page.

## Checking

- Unit tests: `getInitials` with one, two, and three words, extra spaces,
  lower case, an emoji, and a letter with a combining mark. `signOutAction`
  signs out the request and rethrows a failure.
- `SiteHeader`'s stories check, at 320, 834, and 1920 pixels, that the
  identity starts and the end finishes at the content's edges; that a long name
  truncates on a phone while the end keeps its width; that with `back` a phone
  shows one bar with the way back and the end, and a wider screen two rows;
  and that the way back is a link in the banner and draws its focus ring
  inside.
- `Avatar`'s stories check the initials, and that `AvatarSkeleton`'s box
  matches the account trigger's.
- `Menu`'s stories open the menu from the keyboard, move with the arrow keys,
  close it with Escape onto the trigger, and check the focus ring on items.
- `AccountMenu`'s stories check the trigger's name, the group's label,
  and Dashboard's `aria-current` on `/dashboard` and that it closes the menu.
  `SignOutMenuItem`'s check that the page refreshes after the action and not
  before, and that the menu stays open while it runs. `SignInLink`'s check
  its `href`.
- The dashboard's, the board's, and the sign-in page's stories render the new
  headers and keep their alignment and loading-geometry checks.
- End-to-end, on a production build: a guest on a board signs in through the
  header and comes back to the board with the avatar; signing out on a board
  stays there with Sign in; signing out on the dashboard lands on
  `/sign-in?returnTo=/dashboard`. Tests that signed out through the header's
  button open the menu first.
- One probe import per new layer rule fails `pnpm lint`: a widget importing
  `@/app`, a widget importing another widget, and a feature importing a widget.
- `pnpm build` still marks `/dashboard`, `/sign-in`, and `/p/[productSlug]` as
  partially prerendered. The client JavaScript of `/dashboard` and
  `/p/[productSlug]`, before and after, goes in the commit message.
- `pnpm verify` and `pnpm build-storybook` pass.
