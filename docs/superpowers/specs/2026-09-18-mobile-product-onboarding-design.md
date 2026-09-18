# Mobile product onboarding design

## Goal and scope

This slice lets a newly registered user create their one product, see the resulting owner state on `/dashboard`, and open a working public URL for an empty board. It follows the approved MVP behavior in `2026-08-17-feedback-board-mvp-design.md` and the mobile layout in `docs/mobile-design.dc.html`.

The branch is `feat/mobile-product-onboarding`. This pass implements the mobile layout. Wider viewports keep a usable single-column layout; a distinct desktop composition belongs to later work. Product settings, feedback lists, filters, submissions, votes, and owner triage follow in later slices.

## User journey

A guest opening `/dashboard` continues to reach sign-in with `returnTo=/dashboard`. After registration or sign-in, a user without a product sees the create-board form on that route. A user who already owns a product sees the empty owner dashboard instead of the form.

The form collects product name, public address, and an optional description. The address is suggested from the name until the user edits it. Editing the address makes it independent of later name changes. The form shows the public URL prefix above the editable slug, following the mobile design. All controls are in one column; text fields are at least 48 pixels high, and the submit button stays visible above the safe area while the description is being edited.

Creation stays on `/dashboard`. The form gives way to the empty owner state, which shows the public URL, a copy-link control, and a link to the public board. The success notice appears only after a successful creation, not on every later dashboard visit. Sign-out remains available from the protected route.

## Field behavior

Product name is required, contains 2–80 characters after normalization, and collapses repeated whitespace. Description is optional, has a 500-character maximum, trims outer whitespace, and preserves internal line breaks. Slug is required, contains 3–48 characters, and uses lowercase Latin letters, digits, and hyphens.

Slug input follows the MVP normalization order before validation: trim, lowercase, replace spaces and underscores with hyphens, remove unsupported characters, collapse repeated hyphens, and trim hyphens at both ends. The generated suggestion uses the same function. If a name cannot produce a slug of at least three characters, the user must enter a valid Latin slug. The manual-slug validation example in the visual mockup yields to this normalization rule: an input that normalizes to a valid slug succeeds.

The shared field pattern supports an optional character counter. This form uses it for name, slug, and description, with the same placement and counting convention as validation. Authentication fields keep their existing presentation without counters. Their validation errors continue to explain length limits. The counter is presentation, not a substitute for validation.

Client validation gives immediate length feedback and shows when a normalized slug is too short or too long. The Server Action independently parses and normalizes every submitted value. Errors appear below their fields and move focus to the first invalid field. A taken slug appears under the address field while all entered values stay in place. During submission, fields cannot be edited and a stable-width pending button prevents a second request.

## Server boundaries and data

`src/features/products` owns product schemas, a server-only current-owner query, and the create-product Server Action. The dashboard page checks the full session before reading owner data. The action validates input, performs its own full session check, then writes the product. It never trusts an owner ID from the form.

The existing database uniqueness constraints on `products.ownerId` and `products.slug` enforce one product per user and globally unique public addresses under concurrent requests. A taken slug returns a field-level `CONFLICT`. A second product for the same owner returns a form-level `CONFLICT`; a dashboard refresh then shows the existing product. Missing authentication returns the existing `UNAUTHENTICATED` action contract. Database and other unexpected failures reach mobile route error UI for the dashboard or public board rather than being presented as validation failures.

## Minimal public board

`/p/[productSlug]` reads the product by slug and renders its name, optional description, and the mobile first-feedback empty state. An unknown slug uses a new mobile not-found state for the route. The page does not show controls for feedback or voting until those features work. This small public page makes the URL and “View public board” link from onboarding truthful.

The public product read is independent of the viewer and remains uncached in this branch. The following public-board slice can add the MVP product cache contract after its reads and mutations are tested. Session and owner reads stay request-bound.

## Verification

Vitest covers name and slug normalization, field boundaries, conflict mapping, and authorization. Database integration tests verify one product per owner and one owner per slug, including concurrent creation attempts. Playwright extends the existing isolated test setup with registration, mobile create-board interaction, return to the owner dashboard, and opening the empty public board. It also checks a taken slug leaves the other form values intact. The public route returns not found for an unknown slug.

The branch is complete when the journey works at mobile widths, labels and errors are accessible, the pending state prevents duplicate submission, and the repository's format, lint, typecheck, unit test, production build, Storybook build, and Playwright checks pass.
