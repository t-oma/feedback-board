# Mobile product onboarding design

## Goal and scope

This slice lets a newly registered user create their one product, see the resulting owner state on `/dashboard`, and open a working public URL for an empty board. It follows the approved MVP behavior in `2026-08-17-feedback-board-mvp-design.md` and the mobile layout in `docs/mobile-design.dc.html`.

This pass implements the mobile layout. Wider viewports keep a usable single-column layout; a distinct desktop composition belongs to later work. Product settings, feedback lists, filters, submissions, votes, and owner triage follow in later slices. The slice lands as three pull requests, described under Delivery. Questions this document leaves open are listed at the end, under the pull request that decides them.

## User journey

A guest opening `/dashboard` continues to reach sign-in with `returnTo=/dashboard`. After registration or sign-in, a user without a product sees the create-board form on that route. A user who already owns a product sees the empty owner dashboard instead of the form.

The form collects product name, public address, and an optional description. The address is suggested from the name until the user edits it. Editing the address makes it independent of later name changes. The form shows the public URL prefix above the editable slug, following the mobile design. All controls are in one column; text fields are at least 48 pixels high, and the submit button stays visible above the safe area while the description is being edited.

Creation stays on `/dashboard`. The form gives way to the empty owner state, which shows the public URL, a copy-link control, and a link to the public board. The success notice appears only after a successful creation, not on every later dashboard visit. Sign-out remains available from the protected route.

The URL prefix in the form and the public URL in the owner state use the deployment origin from `BETTER_AUTH_URL`, the origin `parseReturnTo` already compares against, so neither needs the request's headers.

## Field behavior

Product name is required, contains 2–80 characters after normalization, and collapses repeated whitespace. Description is optional, has a 500-character maximum, trims outer whitespace, and preserves internal line breaks. Slug is required, contains 3–48 characters, and uses lowercase Latin letters, digits, and hyphens.

Description normalization converts every CRLF and lone CR to LF before it trims and checks the length. A browser keeps LF in the field but sends each line break as CRLF: in Chromium, `FormData.get` returns `"a\nb"` while the request body carries `"a\r\nb"`. Without the conversion, a description the counter shows at 500 characters fails on the server by one character per line break, and CRLF reaches the database.

Slug input follows the MVP normalization order before validation: trim, lowercase, replace spaces and underscores with hyphens, remove unsupported characters, collapse repeated hyphens, and trim hyphens at both ends. The generated suggestion uses the same function, then keeps the first 48 characters and drops a hyphen the cut leaves at the end. A name may be 80 characters long, so without the cut the form would suggest an address it then rejects, under a field the user never touched. If a name cannot produce a slug of at least three characters, the user must enter a valid Latin slug. The manual-slug validation example in the visual mockup yields to this normalization rule: an input that normalizes to a valid slug succeeds.

The shared field pattern supports an optional character counter. This form uses it for name, slug, and description. It counts what validation counts: the normalized value, with a line break as one character. The counter sits in the label row, as in the design, but outside the `<label>` element; inside it, the counter would become part of the field's accessible name and change with every keystroke. Authentication fields keep their existing presentation without counters. Their validation errors continue to explain length limits. The counter is presentation, not a substitute for validation.

The description needs a multi-line control. `Field.Control` fixes its height at 48 pixels, so `src/components/field` gains a textarea control with the same border, focus, and invalid styles. It follows the MVP rule of 16-pixel text below `md`, which stops iOS Safari from zooming into the focused field.

Each field runs its Zod schema on the client through Base UI's `validate`, in Base UI's default `onSubmit` mode: errors first appear when the form is submitted, then update as the user edits, as design state 09 shows. The counter supplies the immediate length feedback. A failing field blocks the request, because Base UI cancels the submit event and React does not run an action for a cancelled submit. The auth forms have no client validation, so this form introduces the pattern. The client uses the schemas the action uses, so the two cannot disagree.

The Server Action independently parses and normalizes every submitted value. Field errors appear below their fields, and Base UI's `Form` moves focus to the first invalid one. A taken slug appears under the address field. All three fields are controlled, because React resets a form after every action and an uncontrolled field comes back empty; controlled, every entered value survives any failed submit. An error with only a form-level message shows in the form's banner and moves focus there, since the form keeps every value and submitting again is the next step. The banner is today's `AuthFormMessage`, which moves from `src/features/auth/ui` to `src/components` now that a second feature uses it. During submission, fields cannot be edited and a stable-width pending button prevents a second request.

## Server boundaries and data

`src/features/products` follows the MVP module layout: `contracts.ts` holds the field bounds and the slug pattern, `schemas.ts` the Zod schemas, the normalization, and the slug suggestion, `queries.server.ts` the reads, and `actions.ts` the create-product Server Action.

The bounds move into `contracts.ts` from `src/server/db/schema/products.ts`, which exports them today, and the database schema imports them from there. A client schema that imported them from the database module would pull `drizzle-orm/pg-core` and the table definition into the browser bundle. `getAuthBackTarget` reuses the slug pattern from `contracts.ts` instead of its own copy.

The dashboard page checks the full session before reading owner data. The action validates input, performs its own full session check, writes the product, and calls `refresh()`, so the page re-renders with the owner state. It never trusts an owner ID from the form. The action's session check must not redirect: a protected action with no session returns `UNAUTHENTICATED`, while `requireSession` redirects to sign-in. `session.server.ts` therefore also exposes a reader that returns the session or `null`, which the auth-session design deferred until a caller needed one.

The existing uniqueness constraints on `products.owner_id` and `products.slug` enforce one product per user and globally unique public addresses under concurrent requests. The migration declares both inline, so PostgreSQL names them `products_owner_id_key` and `products_slug_key`, and the action tells them apart by that name rather than by message text. A taken slug returns a field-level `CONFLICT` with the design's wording, "This slug is already taken. Choose another one." A second product for the same owner returns a form-level `CONFLICT`. Missing authentication returns `UNAUTHENTICATED`.

An unexpected failure while creating returns `UNEXPECTED` through `toUnexpectedActionError`, after `unstable_rethrow`, so the form stays on screen with what was typed and shows the neutral message in its banner. Reads keep the route error boundary: a failed owner read on `/dashboard` or product read on the public board reaches `src/app/error.tsx`.

## Minimal public board

`/p/[productSlug]` reads the product by slug and renders its name, optional description, and the first-feedback empty state from design state 04, without its Add feedback action. The page does not show controls for feedback or voting until those features work. This small public page makes the URL and “View public board” link from onboarding truthful. Its document title is the product name, set through `generateMetadata`.

A `productSlug` that does not match the slug pattern calls `notFound()` without a query, and an unknown slug calls it after one. Both render the root `src/app/not-found.tsx`, whose copy is design state 03, the state the design uses for an unknown slug, so the route needs no not-found file of its own. The status is 200, not 404. Following the MVP rendering model, the page reads its params inside a Suspense boundary, so the shell has already streamed when `notFound()` runs; Next.js keeps the 200 and adds a `noindex` tag (`not-found.md`, "Calling `notFound()` after streaming has started"). A real 404 would need the lookup in `proxy.ts`, a database query before every board request, which this slice does not add.

The public product read is independent of the viewer and remains uncached in this slice. The following public-board slice can add the MVP product cache contract after its reads and mutations are tested. When it does, creating a product must expire `product-slug:{slug}` with `updateTag()`: a visit to a slug before anyone claims it caches a not-found result, which would otherwise outlive the creation. Session and owner reads stay request-bound.

## Verification

Vitest covers name, description, and slug normalization, field boundaries, the slug suggestion's cut at 48 characters, conflict mapping, and authorization. The description boundary includes a 500-character value with CRLF line breaks.

Database integration tests verify one product per owner and one owner per slug, including concurrent creation attempts. The repository has no database tests yet: Vitest has a `unit` project that runs without a database and a `storybook` project, and CI starts PostgreSQL only for the end-to-end job. The first pull request adds a Vitest project for these tests, guarded like `e2e/environment.ts` so that it runs only against `feedback_board_test`, and PostgreSQL for the CI job that runs it.

Playwright extends the existing isolated test setup with registration, mobile create-board interaction, return to the owner dashboard, and opening the empty public board. It also checks that a taken slug leaves the other form values intact. For an unknown slug it asserts the not-found heading and the `noindex` tag, not the 404 status that `e2e/not-found.e2e.ts` asserts for an unmatched URL.

Each pull request is complete when `pnpm verify` and `pnpm build-storybook` pass. The slice is complete when the journey works at mobile widths, labels and errors are accessible, and the pending state prevents duplicate submission.

## Delivery

1. **Product domain.** `contracts.ts`, `schemas.ts` with the normalization and the slug suggestion, `queries.server.ts`, the create-product action, the nullable session reader, the database test project, and the database tests. Nothing renders yet.
2. **Dashboard.** The onboarding form with the counter and the textarea control, the shared form banner, the empty owner state with the public URL, copy link, and link to the board, the success notice, and Playwright coverage for creating a board and for a taken slug. Until the third pull request lands, the link to the board leads to the not-found page.
3. **Public board.** `/p/[productSlug]`, and the Playwright journey extended to opening the empty board and to an unknown slug.

## Open questions

### Product domain

- Whether the action reads the owner's product before inserting. With the insert alone, a second product whose slug is also taken can fail on the slug constraint first and report a taken address. Reading first returns the form-level `CONFLICT` in that case too, and the constraint still guards the race. A related question is whether that `CONFLICT` also calls `refresh()`, so the page shows the product that already exists.
- The shape of the database test project: its name, file suffix, how it applies migrations, and which CI job runs it.

### Dashboard

- How the success notice survives the swap. The form holds the action state, and `refresh()` replaces the form with the owner state, so the state and the focused submit button disappear with it. Proposed: one client component, at the same position in both states, owns `useActionState` and renders either the form or the notice with the server-rendered owner content.
- What an unauthenticated submit does. `proxy.ts` answers a POST to `/dashboard` without a session cookie with a 307, the browser repeats the POST to `/sign-in?returnTo=…`, and the action runs there; this was observed on sign-out on 2026-09-24. Proposed: let requests with a `Next-Action` header through the proxy, so the action returns `UNAUTHENTICATED` and the banner links to sign-in. This needs a probe and an end-to-end test without the cookie.
- Whether `/dashboard` replaces `instant = false` with a `loading.tsx` skeleton. The MVP specification lets no route ship with it, and the guest redirect that motivated it now happens in `proxy.ts`.
- Whether the sticky submit button can stay visible while the keyboard is open. iOS Safari, and Chrome on Android since version 108, shrink only the visual viewport for the keyboard, so a button stuck to the bottom of the layout viewport sits behind it. The design's feedback sheet moves its buttons into the top bar for this reason. Playwright does not emulate the keyboard, so only a manual check can confirm it.
- What wider viewports show. The sign-in page became a card from `sm` because the stretched mobile layout looked wrong on an iPad, and this form would stretch the same way.

### Public board

- Whether the board gets its own error boundary with the full copy of design state 02, which the route-states design left to the board.
