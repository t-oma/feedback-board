# Feedback Board MVP Technical Design

**Date:** 2026-08-17
**Status:** Approved in design discussion; awaiting written-spec review

## Purpose

Feedback Board is a small multi-tenant SaaS-style application for a frontend or full-stack portfolio. A registered product owner creates one public feedback board. Other registered users submit suggestions and vote, while anonymous visitors can read public content. The project is intentionally scoped for a seven-to-ten-day implementation and is also a vehicle for learning the current Next.js App Router.

The visual design and page composition are owned by a separate UI workstream. This document defines routes, behavior, server boundaries, data rules, error semantics, tests, and completion criteria that the UI consumes.

## Goals

- Implement the application as one Next.js 16.3.1 App Router project.
- Use Server Components for reads and Server Actions for internal mutations.
- Use PostgreSQL through Drizzle ORM and Better Auth for authentication.
- Enforce permissions in server code and invariants in PostgreSQL.
- Produce a responsive, deployed portfolio application with critical automated tests.
- Introduce modern Next.js caching only after the uncached core is correct and tested.

## Non-goals

- Multiple products per owner.
- Teams, invitations, or owner/admin/member roles.
- Comments, attachments, notifications, custom domains, AI features, webhooks, or third-party integrations.
- Payments or subscriptions.
- Account deletion, email verification, password reset, or OAuth.
- A separate API server, Fastify service, Redis instance, queue, or worker.
- Pagination or full-text search in the MVP.

## System architecture

The application has one Next.js deployment and one PostgreSQL database. Server Components call feature query functions directly; they do not call the application's own HTTP endpoints. Server Actions are the client-callable interface for mutations: they validate input, resolve the session, authorize the operation, perform or delegate the database change, and refresh affected server-rendered data. A separate mutation module is extracted only when its implementation becomes complex or is reused outside one action. The only Route Handler required by the MVP is Better Auth's catch-all handler at `/api/auth/[...all]`.

The code is organized feature-first:

- `src/server/db` owns the Drizzle client, schema, relations, and migration-facing exports.
- `src/server/auth` owns Better Auth configuration and server-side session helpers.
- `src/server/env.ts` owns validated server environment variables.
- `src/shared/action-result.ts` owns the client-safe expected-error contract for forms and interactive controls.
- `src/features/auth` owns sign-up, sign-in, and sign-out actions.
- `src/features/products` owns product validation, queries, creation, and settings mutations.
- `src/features/feedback` owns public and owner queries, creation, editing, status changes, and hide/restore.
- `src/features/votes` owns viewer vote reads and idempotent add/remove mutations.
- `src/app` owns routing, Server Component composition, loading boundaries, error boundaries, and not-found UI.

Feature modules use file names to communicate their allowed import direction. The suffix is a project convention rather than special Next.js syntax:

- `*.server.ts` contains implementation that ordinary Client Components must not import, such as database queries. Every such module also imports `server-only` so the restriction is enforced at build time.
- `actions.ts` starts with the file-level `"use server"` directive. Client Components may import its exported async functions as Server Action references, while their implementation continues to execute only on the server.
- `contracts.ts`, and any deliberately shared schemas or constants, remain client-safe and must not import server-only dependencies. A schema that depends on server-only code instead uses the `*.server.ts` suffix.

A representative feature remains flat at the MVP scale:

```text
src/features/feedback/
├── actions.ts
├── contracts.ts
├── queries.server.ts
└── schemas.ts
```

Additional folders inside a feature are introduced only after the number or responsibilities of its files make the flat layout harder to navigate.

## Routes and route behavior

- `/` is the portfolio/marketing entry point defined by the UI workstream.
- `/sign-in` contains sign-in and account-creation modes. A separate `/sign-up` route is not required.
- `/dashboard` requires a valid session. A user without a product sees onboarding; a user with a product sees owner management.
- `/dashboard/settings` requires a valid session and an existing owned product.
- `/p/[productSlug]` is the public board with URL-backed filtering and sorting.
- `/p/[productSlug]/feedback/[feedbackId]` is the public feedback detail page.
- `/p/[productSlug]/changelog` lists completed, visible feedback.
- `/api/auth/[...all]` exposes Better Auth's required GET and POST handlers.

Changing a slug makes the new URL active immediately. The old slug returns not found; the MVP does not maintain slug history or redirects.

## Authentication

Better Auth uses its email-and-password provider with the Drizzle PostgreSQL adapter. Registration requires `name`, `email`, and `password`. Passwords use Better Auth's standard minimum of 8 and maximum of 128 characters.

The MVP behavior is:

- no email verification;
- no password reset;
- no OAuth providers;
- automatic sign-in after successful registration;
- redirect to `/dashboard` after normal registration;
- sign-out returns the user to `/`;
- a validated internal `returnTo` path returns a user to the public page that prompted authentication.

`returnTo` is validated by parsing rather than by pattern matching, because the dangerous inputs are the ones that only a URL parser normalizes correctly. Two checks run in order:

1. The raw value is rejected unless it begins with exactly one `/` that is not followed by `/` or `\`. This removes protocol-relative and backslash-prefixed forms, along with anything carrying a scheme or leading whitespace, before a parser is involved.
2. The value is resolved with `new URL(returnTo, origin)` against the deployment origin and accepted only when the parsed `origin` is identical to it.

The two checks overlap deliberately. The first rejects `//evil.com` and `/\evil.com` outright, and it names `\` because a URL parser treats that character as `/` in HTTP schemes, which would otherwise resolve the value to `https://evil.com`. The second catches what a prefix check cannot see: a parser strips tab, newline, and carriage-return characters from the input entirely, so a tab placed between the leading `/` and a second `/` survives the first check and then collapses to `//evil.com`, while a `javascript:` value parses with the origin `"null"`. Both end up cross-origin and are rejected. A percent-encoded form such as `/%2F%2Fevil.com` stays same-origin and is accepted, which is correct: browsers do not decode `%2F` before resolving, so the value remains an internal path.

The redirect then uses the parsed URL's `pathname + search + hash`, never the raw input. Validating one string and redirecting with another is the usual way this check is defeated. Paths under `/api` are rejected because no user-facing page lives there, and any rejected or absent value falls back to `/` rather than surfacing an error.

Because `returnTo` reaches the server as untrusted form data on a Server Action POST, it is validated inside the action that performs the redirect, not only at the point where a sign-in link is rendered.

Auth forms may call Better Auth's server API through Server Actions with its Next.js cookie integration. The Better Auth Route Handler remains mounted as required by the library.

The dashboard validates the full session in its server layout or page. Every protected Server Action independently validates the full session again. The MVP does not depend on `proxy.ts` for security.

## Access model

| Capability                                   | Anonymous visitor | Registered user              | Board owner                 |
| -------------------------------------------- | ----------------- | ---------------------------- | --------------------------- |
| Read visible boards, feedback, and changelog | Yes               | Yes                          | Yes                         |
| Create feedback                              | No                | Yes                          | Yes, including on own board |
| Add or remove own vote                       | No                | Yes                          | Yes, including on own board |
| Create a product                             | No                | Yes, once                    | Already owns one            |
| Edit feedback                                | No                | No, including own submission | Yes, on owned board         |
| Change feedback status                       | No                | No                           | Yes, on owned board         |
| Hide or restore feedback                     | No                | No                           | Yes, on owned board         |
| Change product settings                      | No                | No                           | Yes, on owned board         |

The owner role is additive: an owner retains ordinary registered-user capabilities. The application has no separate role column; ownership is derived from `product.ownerId`.

## Data model

Better Auth owns its generated `user`, `session`, `account`, and `verification` tables. Its user ID format remains unchanged and domain foreign keys use the corresponding text type.

### Product

- `id`: UUID primary key.
- `ownerId`: required Better Auth user ID, unique, foreign key to user.
- `name`: required string, 2–80 characters.
- `slug`: required lowercase string, 3–48 characters, unique.
- `description`: required string with an empty default, maximum 500 characters.
- `createdAt`, `updatedAt`: timestamps with timezone.

The unique constraint on `ownerId` enforces one product per owner. The unique constraint on the normalized lowercase `slug` enforces global public URL uniqueness.

### Feedback

- `id`: UUID primary key.
- `productId`: required UUID foreign key to product.
- `authorId`: required Better Auth user ID foreign key to user.
- `title`: required string, 5–120 characters.
- `body`: required plain text, 20–2000 characters.
- `status`: PostgreSQL enum `open | planned | in_progress | completed`, default `open`.
- `completedAt`: nullable timestamp with timezone.
- `hiddenAt`: nullable timestamp with timezone.
- `createdAt`, `updatedAt`: timestamps with timezone.

Indexes support public listing by product, visibility, status, and creation time, plus changelog listing by product and completion time.

A database check constraint enforces that `completedAt` is non-null exactly when status is `completed`.

### Vote

- `userId`: required Better Auth user ID foreign key to user.
- `feedbackId`: required UUID foreign key to feedback.
- `createdAt`: timestamp with timezone.

The composite primary key `(userId, feedbackId)` prevents duplicate votes. An index beginning with `feedbackId` supports vote counts. Vote counts are calculated from Vote rows and are not denormalized onto Feedback.

The foreign-key graph uses cascading cleanup for parent deletion even though product, feedback, and account deletion are not exposed in the MVP.

## Input normalization and public query contract

Human-readable fields are trimmed. Product name and feedback title collapse repeated internal whitespace. Feedback body and product description preserve meaningful internal newlines but trim their outer whitespace.

Slug normalization runs before validation:

1. trim;
2. lowercase;
3. convert spaces and underscores to `-`;
4. remove unsupported characters;
5. collapse repeated `-` characters;
6. remove leading and trailing `-` characters.

Automatic slug generation works for ASCII-compatible product names. If normalization produces fewer than three characters, the owner must enter a valid Latin slug manually.

The public board accepts:

- `status=all|open|planned|in-progress|completed`, default `all`;
- `sort=new|top`, default `new`.

Unknown query values normalize to their defaults instead of producing an error. URL value `in-progress` maps to database value `in_progress`.

Ordering is deterministic:

- `new`: `createdAt DESC`, then `id DESC`;
- `top`: `voteCount DESC`, then `createdAt DESC`, then `id DESC`;
- changelog: `completedAt DESC`, then `id DESC`.

Hidden feedback is excluded from every public query. A missing or hidden feedback detail behaves as not found. Public list queries aggregate vote counts in the database and avoid per-row queries. Viewer-specific vote state is loaded separately when a session exists.

## Mutation contract

Each Server Action performs the following sequence:

1. Parse and normalize external input with Zod.
2. Resolve and validate the full session when authentication is required.
3. Load the target relationship needed for authorization.
4. Apply the mutation in PostgreSQL.
5. Return a typed expected result or redirect on success.
6. Refresh affected server-rendered data; cache tag invalidation is added during the later caching phase.

The serializable expected-result shape is:

```ts
type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | {
      ok: false;
      code:
        | "VALIDATION"
        | "UNAUTHENTICATED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "CONFLICT";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
```

Codes carry the following meaning:

- `VALIDATION`: parsing or normalization rejected the input. `fieldErrors` carries the per-field messages.
- `UNAUTHENTICATED`: the action requires a session and none is valid.
- `NOT_FOUND`: the target row does not exist, or the caller could not have reached it through a public read.
- `FORBIDDEN`: the target exists and is publicly readable, but the caller does not own it.
- `CONFLICT`: a database uniqueness constraint rejected the write, such as a taken slug or a second product for one owner.

`NOT_FOUND` and `FORBIDDEN` are separated by what the caller can already observe, so an action never reveals more than the matching public read. Feedback that is hidden, or that belongs to a different product than the one addressed, is reported to a non-owner as `NOT_FOUND` rather than `FORBIDDEN`; the owner of that board instead receives the real outcome, because hidden items are part of owner management. Feedback that is visible to everyone but owned by another board returns `FORBIDDEN`, since its existence is already public.

Redirecting actions redirect instead of returning their success variant. Passwords, raw database errors, and internal stack details are never returned.

Required mutations are:

- create the current user's product;
- update the owned product's name, description, and slug;
- create visible feedback for an existing product;
- edit feedback on an owned board;
- change feedback status on an owned board;
- hide and restore feedback on an owned board;
- add the current user's vote;
- remove the current user's vote.

`addVote` uses insert-on-conflict-do-nothing semantics, and `removeVote` succeeds when the row is already absent. These explicit operations are idempotent and replace a race-prone toggle mutation. Voting on feedback that is hidden or missing returns `NOT_FOUND`, and creating feedback for a product that does not exist returns the same code.

Status transitions are unrestricted between all four statuses. Entering `completed` sets `completedAt` with PostgreSQL `now()` in the same update. Leaving `completed` clears `completedAt`. Re-entering `completed` records a new completion time.

Hiding sets `hiddenAt` without deleting feedback or votes. Restoring clears `hiddenAt`, preserving the previous status and votes. The MVP has no permanent feedback deletion action.

After feedback creation, the user is redirected to its detail page. After a slug update, the owner is redirected to a route using the new slug.

## Caching rollout

The first complete vertical implementation uses direct Drizzle reads with no shared application data cache. This keeps authentication, permissions, queries, and UI states easy to debug.

After the core flows and their tests pass, a separate optimization task enables Next.js Cache Components and adds caching only to viewer-neutral public reads:

- public product data;
- visible feedback lists and vote counts;
- visible feedback detail;
- changelog entries.

Cached functions use finite, validated arguments, `cacheLife("max")`, and the tag formats `product:{productId}`, `product-slug:{slug}`, and `feedback:{feedbackId}`. Session data, viewer vote state, owner dashboard reads, and mutation results remain uncached. Server Actions use immediate tag expiration for read-your-own-writes behavior after creating feedback, voting, editing, changing status, hiding/restoring, or updating product settings.

This phase does not introduce Redis or a remote application cache. If it threatens the ten-day deadline, the tested dynamic implementation is deployed; caching is not a production-launch blocker.

## Error handling and states

Expected operational failures are values, not thrown exceptions. Zod issues appear next to fields. A conflicting slug maps to the slug field. Invalid credentials use one generic message. Missing authentication prompts sign-in. Failed ownership checks return a generic unavailable-operation message. A `NOT_FOUND` result renders next to the control that produced it; only Server Component reads call `notFound()`, so route-level not-found UI is never swapped in underneath an interaction that merely addressed a stale row.

Unexpected failures such as database outages or programming errors are logged on the server and bubble to the nearest route `error.tsx`. The UI shows a neutral message and retry control without exposing database or stack details. Vercel runtime logs are sufficient for the MVP; external monitoring is not required.

Route behavior includes:

- route-level or local loading fallbacks for navigation and slow reads;
- not-found UI for unknown product slugs, mismatched feedback IDs, and hidden feedback;
- onboarding instead of an error when a signed-in user has no product;
- a first-feedback empty state for an empty board;
- a reset-filter empty state when valid filters produce no rows;
- an empty changelog state when no visible completed feedback exists;
- an empty hidden-items state in owner management.

Next.js `redirect()` and `notFound()` control-flow signals are not swallowed by broad exception handlers.

## Security

- Every external form value and URL query value is parsed with Zod.
- Every protected Server Action performs its own session check.
- Every owner mutation verifies `feedback -> product -> owner` or direct product ownership on the server.
- Client-provided owner IDs, author IDs, vote counts, statuses outside the enum, and completion timestamps are ignored.
- Database uniqueness constraints protect owner/product, slug, and vote invariants under concurrency.
- Feedback and descriptions render as React text; arbitrary HTML is not accepted or rendered.
- Redirect destinations are restricted to internal paths by origin comparison after URL parsing, and the redirect uses the parsed path rather than the submitted string.
- Secrets exist only in local/Vercel environment configuration and never in client bundles or git.
- Drizzle parameterization is used for database queries.
- Custom anti-spam classification, AI moderation, and application-wide rate limiting are outside the MVP; feedback creation and voting still require authentication and bounded inputs.

## Test strategy

Vitest covers inexpensive domain and database integration behavior:

- slug normalization and validation boundaries;
- `returnTo` validation, accepting internal paths with query and hash while rejecting `//evil.com`, `/\evil.com`, `\/evil.com`, a tab-prefixed variant that normalizes to `//`, `https://evil.com`, `javascript:alert(1)`, and `/api` paths, each falling back to the default destination;
- field-length validation boundaries;
- status values and `completedAt` transitions;
- database conflict mapping;
- ownership rejection, including the `NOT_FOUND`/`FORBIDDEN` split for hidden versus visible targets;
- one-product, unique-slug, and unique-vote constraints;
- idempotent add/remove vote behavior;
- `NOT_FOUND` for votes on hidden or missing feedback, and exclusion of hidden feedback from public queries.

Playwright covers four critical browser journeys:

1. Register, receive a session automatically, create the only allowed product, update its slug, verify the old URL is not found, and open the new public board.
2. Register a second user, create feedback on the owner's board, add a vote, remove it, and observe correct counts.
3. As owner, edit feedback, change it to completed, verify changelog inclusion, leave completed, hide it, verify public absence, and restore it.
4. As a visitor, read board/detail/changelog content, exercise URL-backed status and sort controls, get sent to sign-in when attempting protected interactions, and land back on the originating board after signing in.

Tests use a dedicated Neon test database named `feedback_board_test`. Any reset utility must first query and verify that exact database name and require an explicit test-reset environment flag. It refuses to run against development or production. Test data uses unique emails and slugs and does not depend on spec execution order.

The pre-deploy verification sequence is formatting check, ESLint, TypeScript check, Vitest, production build, and Playwright E2E.

## Environments and deployment

- Local Next.js development uses a Neon development branch/database.
- Automated tests use the isolated `feedback_board_test` database.
- Vercel production uses a separate Neon production branch/database.
- The MVP has no staging environment.

Environment configuration uses `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and the task-specific `FEEDBACK_BOARD_ENV` marker. Test database reset additionally requires `ALLOW_FEEDBACK_BOARD_TEST_RESET=true`. A committed `.env.example` documents these names without values.

Drizzle migration files are committed. Production migrations run as an explicit deployment step rather than automatically during every application build. Production contains a populated public demo board but no published owner credentials.

## Definition of Done

The MVP is complete when:

- sign-up, sign-in, sign-out, onboarding, and one-product enforcement work;
- public board, detail, status filtering, sorting, feedback creation, voting, and vote removal work;
- owner editing, status changes, hide/restore, and product settings work;
- authorization and database constraints are enforced server-side;
- loading, expected-error, unexpected-error, empty, and not-found states exist;
- the interface works on mobile and desktop with labels, keyboard access, and visible errors;
- formatting, lint, type checking, tests, and production build pass;
- migrations and setup documentation are committed;
- secrets are absent from the repository;
- the app is deployed to a stable Vercel URL backed by the production Neon database;
- README documents the demo URL, capabilities, stack, architecture, local setup, migrations, and test commands;
- a realistic public demo board is available to recruiters.

Changelog is the first feature removed if the core is not stable by day nine. Deployment, responsive behavior, authorization, and critical tests are never traded away for changelog or caching.

## Delivery boundary

This specification is one implementation unit because all features share the same authentication, product ownership, and feedback lifecycle. The implementation plan will deliver vertical, independently testable slices: foundation/auth, onboarding/product, public feedback, voting, owner management, changelog, hardening/deploy, and finally the isolated caching pass.
