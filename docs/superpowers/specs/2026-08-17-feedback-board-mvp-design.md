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
- Build on Cache Components from the first commit, and add `use cache` per slice once that slice's uncached behavior is correct and tested.

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
- `schemas.ts` owns the feature's Zod schemas and the types inferred from them, so an inferred type always sits beside the schema it comes from.
- `contracts.ts` owns hand-written constants and types that carry no validation logic, such as the feedback status values, the sort and filter keys, and the mapping between URL and database spellings.

Both are client-safe and must not import server-only dependencies. A schema that depends on server-only code uses the `*.server.ts` suffix instead. The dependency between the two runs one way: `schemas.ts` may import `contracts.ts`, never the reverse. Without that rule the two files form a cycle, because schemas need the shared constants while inferred types need the schemas.

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
- `/dashboard/settings` requires a valid session and an existing owned product. A signed-in user without a product is redirected to `/dashboard`, where onboarding is the correct destination; having no product yet is a stage of the flow, not a missing page, so this route never renders not-found UI for that case.
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

Better Auth owns its generated `user`, `session`, `account`, `verification`, and `rateLimit` tables; the last one exists because its limiter is configured with database storage, which is what makes counters survive the ephemeral instances of a serverless deployment. Its user ID format remains unchanged and domain foreign keys use the corresponding text type.

### Product

- `id`: UUID primary key.
- `ownerId`: required Better Auth user ID, unique, foreign key to user.
- `name`: required string, 2–80 characters.
- `slug`: required lowercase string, 3–48 characters, unique.
- `description`: `NOT NULL`, defaults to `''`, maximum 500 characters.
- `createdAt`, `updatedAt`: timestamps with timezone.

The unique constraint on `ownerId` enforces one product per owner. The unique constraint on the normalized lowercase `slug` enforces global public URL uniqueness.

### Feedback

- `id`: UUID primary key.
- `productId`: required UUID foreign key to product.
- `authorId`: required Better Auth user ID foreign key to user.
- `title`: required string, 5–120 characters.
- `body`: required plain text, 10–2000 characters.
- `status`: PostgreSQL enum `open | planned | in_progress | completed`, default `open`.
- `completedAt`: nullable timestamp with timezone.
- `hiddenAt`: nullable timestamp with timezone.
- `createdAt`, `updatedAt`: timestamps with timezone.

Indexes support public listing by product, visibility, status, and creation time, plus changelog listing by product and completion time.

A database check constraint enforces that `completedAt` is non-null exactly when status is `completed`.

Every write to a feedback row sets `updatedAt`, including status changes and hide/restore, and the same holds for a product settings update. The column records when the row last changed rather than when its text last changed; no query orders by it, so the distinction only matters for reading the data directly.

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

Hidden feedback is excluded from every public query. A missing or hidden feedback detail behaves as not found. Viewer-specific vote state is loaded separately when a session exists.

Public list queries aggregate vote counts in one database round trip rather than per row. The aggregation is a `LEFT JOIN` from feedback to vote grouped by the feedback row, counting the vote's user column rather than `*`. An inner join silently drops every feedback item that has no votes, and `COUNT(*)` over a left join counts the empty joined row and reports one vote where there are none. Neither mistake is visible on seeded data in which every item already has votes, so the fixtures for these queries include a feedback row with no votes at all.

Every public list query carries a hard `LIMIT` of 100 rows. Pagination remains a non-goal and the demo board is not expected to approach that bound; the limit exists so that no unbounded query reaches production, and reaching it is the signal to add pagination after the MVP.

## Mutation contract

Each Server Action performs the following sequence:

1. Parse and normalize external input with Zod.
2. Resolve and validate the full session when authentication is required.
3. Load the target relationship needed for authorization.
4. Apply the mutation in PostgreSQL.
5. Return a typed expected result or redirect on success.
6. Refresh affected server-rendered data with `refresh()`, which refetches the current route's payload without invalidating any cache. Actions that end in `redirect()` need no separate refresh, because the redirect response already streams the destination. Tag invalidation takes over this role for any read that has been cached.

The serializable expected-result shape is:

```ts
type ActionError = {
  ok: false;
  code:
    | "VALIDATION"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "RATE_LIMITED";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

type ActionResult<T = undefined> = { ok: true; data: T } | ActionError;
```

Codes carry the following meaning:

- `VALIDATION`: parsing or normalization rejected the input. `fieldErrors` carries the per-field messages.
- `UNAUTHENTICATED`: the action requires a session and none is valid.
- `NOT_FOUND`: the target row does not exist, or the caller could not have reached it through a public read.
- `FORBIDDEN`: the target exists and is publicly readable, but the caller does not own it.
- `CONFLICT`: a database uniqueness constraint rejected the write, such as a taken slug or a second product for one owner.
- `RATE_LIMITED`: the caller exceeded the per-user feedback creation cap. It is separate from `CONFLICT` because the request was well formed and permitted, and retrying it later succeeds.

`NOT_FOUND` and `FORBIDDEN` are separated by what the caller can already observe, so an action never reveals more than the matching public read. Feedback that is hidden, or that belongs to a different product than the one addressed, is reported to a non-owner as `NOT_FOUND` rather than `FORBIDDEN`; the owner of that board instead receives the real outcome, because hidden items are part of owner management. Feedback that is visible to everyone but owned by another board returns `FORBIDDEN`, since its existence is already public.

`data` is required rather than optional, so a caller that narrows on `ok` reaches the payload without also handling `undefined`. The cost lands on the producing side: an action with no payload returns `{ ok: true, data: undefined }` rather than `{ ok: true }`. That trade is deliberate, because the omission is written once per action and the check would otherwise be written at every call site.

Redirecting actions redirect instead of returning their success variant, so they are declared as `Promise<ActionError>`. Typing them as `ActionResult` would leave every caller with a success branch that can never run. `ActionError` is a named type for exactly this reason; it also keeps the error shape from being restated wherever only failures are possible. Passwords, raw database errors, and internal stack details are never returned.

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

## Rendering and caching model

Cache Components is enabled from the first commit through `cacheComponents: true` in `next.config.ts`. Turning the flag on and caching data are separate decisions. With the flag on and no `use cache` anywhere, nothing is cached and the application is fully dynamic, which is exactly the uncached core this specification wants correct first. What the flag changes is composition, and composition is the expensive thing to change late.

Under this model every route prerenders a static shell at build time and streams the rest at request time. Any component that reads `cookies()`, `headers()`, `searchParams`, or an uncached database result must sit inside a `<Suspense>` boundary; outside one it blocks the shell and raises a blocking-prerender insight in development. Boundary placement is therefore a behavioral contract rather than a visual choice, so this document fixes where the boundaries go and the UI workstream supplies their fallbacks:

- the viewer-dependent part of the site header, meaning the sign-in control or the account menu, streams separately on every page;
- the public board's feedback list streams, because it reads `searchParams` for status and sort;
- viewer vote state streams, because it depends on the session;
- dashboard and settings pages stream their owner-scoped content;
- product name, description, and changelog entries depend on the route params but not on the viewer, which is what makes them the reads worth caching; until they are cached they stream like any other uncached database read.

The shell carries layout, static headings, filter controls, and the skeletons for everything above, so these fallbacks are the same loading states the UI workstream already owns.

Product slugs are not known at build time, so the board routes declare no `generateStaticParams`; under Cache Components that function may not return an empty list. Their `params` promise is passed into a boundary instead of being awaited at the top of the component, which lets the shell prerender for slugs the build has never seen.

Synchronous non-deterministic calls such as `new Date()`, `Math.random()`, and `crypto.randomUUID()` fail the prerender with a build error that no opt-out clears. The data model already avoids this by generating UUIDs and completion timestamps in PostgreSQL, and application code preserves that property. A route not yet ready for its boundary work may set `instant = false` on its segment as a temporary opt-out, but no route ships that way.

Caching is then added per slice, once that slice's uncached behavior is correct and its tests pass, rather than in one pass at the end. Only viewer-neutral public reads are cached:

- public product data;
- visible feedback lists and vote counts;
- visible feedback detail;
- changelog entries.

Cached functions use finite, validated arguments, `cacheLife("max")`, and the tag formats `product:{productId}`, `product-slug:{slug}`, and `feedback:{feedbackId}`. Session data, viewer vote state, owner dashboard reads, and mutation results remain uncached. Server Actions call `updateTag()` for read-your-own-writes behavior after creating feedback, voting, editing, changing status, hiding/restoring, or updating product settings. It expires the tag immediately, is available only inside Server Actions, and makes the route re-render that ships with the action response wait for fresh data. `revalidateTag()` is not a substitute here: it serves the stale value and deliberately omits that immediate re-render, so a user would see their own vote or edit one navigation late.

A slug update calls `updateTag()` for `product-slug:` under both the old and the new value. Only the new slug is reachable from the request, but the entry cached under the old one is what makes the previous URL resolve, and this specification requires it to become not found immediately. Expiring the new tag alone would leave the old URL serving a cached success response until its lifetime ran out, which contradicts the routing rule and would be caught by the first Playwright journey. The action reads the current slug before writing, so both values are available to it.

No Redis or remote application cache is introduced. Shipping with no `use cache` at all stays acceptable: the flag costs nothing at runtime, the application is correct without it, and at portfolio traffic the cache is a learning exercise rather than a performance requirement. Deferring the flag itself is what is not acceptable, because that moves a composition change to the point where the UI is already built.

## Error handling and states

Expected operational failures are values, not thrown exceptions. Zod issues appear next to fields. A conflicting slug maps to the slug field. Invalid credentials use one generic message. Missing authentication prompts sign-in. Failed ownership checks return a generic unavailable-operation message. A `NOT_FOUND` result renders next to the control that produced it; only Server Component reads call `notFound()`, so route-level not-found UI is never swapped in underneath an interaction that merely addressed a stale row.

Unexpected failures such as database outages or programming errors are logged on the server and bubble to the nearest route `error.tsx`. The UI shows a neutral message and retry control without exposing database or stack details. Vercel runtime logs are sufficient for the MVP; external monitoring is not required.

Route behavior includes:

- a loading fallback at every streaming boundary named in the rendering model, plus route-level `loading.tsx` where a whole segment is replaced during navigation;
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
- Two abuse limits ship, both of them portable application code rather than platform configuration. Better Auth's own rate limiting is enabled with database storage and a stricter rule on the sign-in and sign-up paths. Feedback creation is additionally capped per user per time window by a count in the Server Action.
- Platform-level rate limiting, such as a Vercel firewall rule, is deliberately not used. It would not survive the planned move to self-hosting, no local test can exercise it, and it requires dashboard state that the repository cannot describe.
- The two limits cover different surfaces on purpose. Better Auth's limiter only sees requests reaching the mounted `/api/auth/[...all]` handler, which is publicly addressable whether or not the application's own forms use it, and it does not apply to server-side `auth.api` calls made from Server Actions. The per-user cap is what protects the public demo board, because feedback creation never touches that handler.
- Application code uses no platform-specific runtime API, so changing where the application is deployed stays a deployment change rather than a code change.
- Custom anti-spam classification and AI moderation are outside the MVP; feedback creation and voting still require authentication and bounded inputs.

## Test strategy

Vitest covers inexpensive domain and database integration behavior:

- slug normalization and validation boundaries;
- `returnTo` validation, accepting internal paths with query and hash while rejecting `//evil.com`, `/\evil.com`, `\/evil.com`, a tab-prefixed variant that normalizes to `//`, `https://evil.com`, `javascript:alert(1)`, and `/api` paths, each falling back to the default destination;
- field-length validation boundaries;
- status values and `completedAt` transitions;
- database conflict mapping;
- ownership rejection, including the `NOT_FOUND`/`FORBIDDEN` split for hidden versus visible targets;
- one-product, unique-slug, and unique-vote constraints;
- those same constraints under concurrent writes, issued as simultaneous statements rather than sequential ones: two product creations for one owner and two claims of one slug each leave a single row with the loser surfacing `CONFLICT`, while two `addVote` calls for the same user and feedback both report success and still leave one row;
- idempotent add/remove vote behavior;
- vote count aggregation, asserting that a feedback row with no votes still appears under both orderings and reports a count of zero;
- the per-user feedback creation cap, accepting writes up to the limit inside one window and returning `RATE_LIMITED` past it, with a separate user unaffected;
- `NOT_FOUND` for votes on hidden or missing feedback, and exclusion of hidden feedback from public queries.

Playwright covers four critical browser journeys:

1. Register, receive a session automatically, create the only allowed product, update its slug, verify the old URL is not found, and open the new public board.
2. Register a second user, create feedback on the owner's board, add a vote, remove it, and observe correct counts.
3. As owner, edit feedback, change it to completed, verify changelog inclusion, leave completed, hide it, verify public absence, and restore it.
4. As a visitor, read board/detail/changelog content, exercise URL-backed status and sort controls, get sent to sign-in when attempting protected interactions, and land back on the originating board after signing in.

Tests use a dedicated database named `feedback_board_test`, served by the local PostgreSQL container rather than by a managed provider. Any reset utility must still first query and verify that exact database name and require an explicit test-reset environment flag, and it refuses to run against development or production. A local container narrows what the utility can destroy but does not remove the need for the guard, since `DATABASE_URL` is what decides where it points and nothing stops that variable from holding a production value. Test data uses unique emails and slugs and does not depend on spec execution order.

The pre-deploy verification sequence is formatting check, ESLint, TypeScript check, Vitest, production build, and Playwright E2E. The production build is where prerender violations surface, so it stays in the sequence even when nothing about the build output has changed.

## Environments and deployment

- Local development runs PostgreSQL in a Docker container described by a committed `compose.yaml`.
- Automated tests use the isolated `feedback_board_test` database in that same local container, and CI provides it as a service container.
- Vercel production uses a Neon database.
- The MVP has no staging environment.

The database is local for development and managed in production on purpose. Keeping it local removes a network round trip from every query in a database-heavy test suite, removes the network as a source of flaky tests, and shrinks the blast radius of the reset utility to a container. Keeping production managed means backups, point-in-time recovery, and upgrades are not a standing obligation on a portfolio project, where losing the database means losing the artifact itself.

Database access uses an ordinary PostgreSQL driver over TCP rather than a provider-specific driver such as Neon's HTTP client. The same connection code then works against the local container, the managed production database, and any later self-hosted instance, which is the same portability rule the security section applies to platform APIs. The container image pins the same PostgreSQL major version as production.

Hosting the database next to the application is a question that only opens if the application itself moves to a VPS, and it may well stay answered no. It is specifically not worth doing while the application runs on Vercel: Vercel deployments egress from arbitrary IP addresses unless the project buys Static IPs or Secure Compute, neither of which exists on the Hobby plan, so a self-hosted database would have to accept connections from the entire internet and defend itself with credentials alone. Serverless instances also multiply connections against a fixed `max_connections`, which a managed provider absorbs with its own pooler.

Self-hosting on a VPS is a planned follow-up rather than part of this MVP, and it is sequenced after the deployed application is complete so that the two learning goals do not compete for the same budget. It changes the deployment target only. Should it later grow past a single instance, three requirements appear that a single instance does not have: a shared `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, a `deploymentId` to survive rolling deployments, and a shared cache handler implementing `refreshTags()`. Without the third, `updateTag()` invalidates only the instance that served the mutation, which silently breaks the read-your-own-writes guarantee this specification relies on and reintroduces the Redis dependency the non-goals exclude. A single container behind a reverse proxy has none of these requirements.

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
- README documents the demo URL, capabilities, stack, architecture, local setup including starting the database container, migrations, and test commands;
- a realistic public demo board is available to recruiters.

Changelog is the first feature removed if the core is not stable by day nine. Deployment, responsive behavior, authorization, and critical tests are never traded away for changelog or caching.

## Delivery boundary

This specification is one implementation unit because all features share the same authentication, product ownership, and feedback lifecycle. The implementation plan will deliver vertical, independently testable slices: foundation/auth, onboarding/product, public feedback, voting, owner management, changelog, and hardening/deploy. Caching is not a slice of its own; each slice adds `use cache` to its own viewer-neutral reads once its uncached behavior is tested.
