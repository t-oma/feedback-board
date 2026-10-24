# Action slices design

## Goal

Organize the code by what a person does in the app. Each user action, such as
signing in or creating a product, gets a slice of its own; the domain those
actions share sits a layer below them; and UI that only one page renders sits
beside that page.

## Why

`src/features/auth` and `src/features/products` are domains. Each holds the
actions of its domain, the rules they share and the UI of the pages that use
them, so the sign-in form, the auth header of the sign-in page and the password
bounds Better Auth reads all live in one feature. The tree does not show which
actions the app has.

Feature-Sliced Design names that layer: its features are "the main interactions
in your app, things that your users care to do". Its other rules fit this
project less well:

- It treats reuse on several pages as the sign of a feature and keeps UI that
  one page uses in that page's slice. No action here is reused yet, so by the
  book every one of them would sit in a page.
- Its Next.js guide renames its `app` and `pages` layers to `_app` and
  `_pages`, moves the router out of `src`, and turns each `page.tsx` into a
  re-export. A slice exposes one `index.ts`, plus `index.server.ts` for
  server-only code, and the guide does not recommend changing that.
- A slice `index.ts` is the barrel the auth navigation specification removed.
  It measured `/dashboard` at 84 KB of route JavaScript through the feature
  barrel and 27 KB through direct imports. On 2026-10-13 a component directory
  whose `index.ts` re-exported `CreateProductForm` beside its skeleton made the
  dashboard's loading state load the form's chunks, 94,570 bytes, and grew the
  route by 6,747 bytes; importing the skeleton directly matched `main`.

So this design takes the layers and the import direction from Feature-Sliced
Design, keeps Next.js's own conventions for pages, and keeps direct imports.

## Layers

| Layer      | Holds                                                            | Imports from               |
| ---------- | ---------------------------------------------------------------- | -------------------------- |
| `app`      | routes, and UI only one route renders                            | every layer below          |
| `widgets`  | UI that several routes render, composed of features and entities | features, entities, bottom |
| `features` | one slice per user action                                        | entities, bottom           |
| `entities` | one slice per domain concept                                     | bottom                     |
| bottom     | `src/components`, `src/shared` and `src/server`, as now          | bottom                     |

A slice never imports another slice of its own layer, and nothing outside
`src/app` imports from it. `src/proxy.ts` belongs with `src/app`.

`widgets` came with the [site header](2026-10-22-site-header-design.md): the
control for the viewer combines the session from `entities/user` with signing
out from `features/sign-out`, and every route with a header renders it. A
feature may not import another feature, and `app` holds UI for one route, so
neither could hold it. Feature-Sliced Design names this layer the same.

The bottom layer keeps its names. Feature-Sliced Design would call it `shared`,
which `src/shared` already is with a narrower meaning; renaming the three
directories is mechanical and left to a change of its own.

## Slices

A slice keeps the layout a feature has today. Its root holds modules named by
role, with the rules the MVP specification gives those names: `actions.ts`
starts with `"use server"`, a `*.server.ts` imports `server-only`, and
`schemas.ts` may import `contracts.ts` but not the reverse. Its UI sits in a
flat `ui/`, and tests and `__mocks__` sit beside what they cover.

A module one action uses lives in that action's slice. A module several
actions use moves to the entity they share, even when today's second user is
only planned:

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── _ui/                 dashboard-header, owner-overview, owner-heading,
│   │   │                        copy-link-button, and their stories
│   │   └── layout.tsx, loading.tsx, page.tsx
│   └── sign-in/
│       ├── _ui/                 auth-back-target, auth-header, auth-intro,
│       │                        auth-tabs, and their tests and stories;
│       │                        sign-in, the page and its skeleton
│       └── loading.tsx, page.tsx, sign-in.stories.tsx
├── widgets/
│   └── viewer/                  ui/: viewer-control, account-menu,
│                                lazy-account-menu, sign-in-link, and their
│                                stories
├── features/
│   ├── create-account/          actions.ts, schemas.ts, ui/create-account-form.tsx
│   ├── create-product/          actions.ts, contracts.ts, schemas.ts, ui/: the
│   │                            form, its skeleton, intro and created notice
│   ├── sign-in/                 actions.ts, schemas.ts, ui/sign-in-form.tsx
│   └── sign-out/                actions.ts, ui/sign-out-menu-item.tsx
└── entities/
    ├── product/                 contracts.ts, errors.ts, queries.server.ts,
    │                            schemas.ts
    └── user/                    contracts.ts, errors.ts, navigation.ts,
                                 schemas.ts, session.server.ts,
                                 sign-in-href.ts
```

How today's modules divide:

- `features/auth/actions.ts` becomes one `actions.ts` per action.
- `signInSchema` and `createAccountSchema` move to their actions. The field
  schemas they compose, and the sign-in query's `intent` and `mode`, move to
  `entities/user/schemas.ts`, because `navigation.ts` parses the query.
- `classifyAuthError` serves sign-in and account creation, so it moves to
  `entities/user`.
- `createProductSchema` moves to `create-product`. The field schemas,
  `normalizeProduct*` and `suggestProductSlug` move to `entities/product`: the
  product settings the MVP specification plans can change the slug, and must
  validate it the same way. `classifyProductError` moves there for the same
  reason, since a new slug can be taken.
- `features/auth/contracts.ts` becomes `entities/user/contracts.ts`: the bounds
  it holds belong to the user account.

`entities/user` holds the account's field rules, the session of the person
signed in, and the way to the sign-in page.

## Pages

UI that one route renders sits in a private folder of that route, `_ui/`,
which Next.js leaves out of routing. The name repeats the `ui/` of a slice. A
route may use the `_ui/` of its own segment and of the segments above it, so a
page under `/dashboard` can render the dashboard header. When a second route
needs a component, it moves down to `widgets`, `features`, `entities` or
`src/components`.

When a story needs a page's whole composition, the page reads the request,
such as its `searchParams`, and hands what it read to a component in `_ui/`
that composes the page; that component's skeleton sits beside it, and
`loading.tsx` renders the skeleton. `SignIn` and `SignInSkeleton` do this for
`/sign-in`, as `Board` and `BoardSkeleton` do for a public board. The
component is synchronous, so its stories render the page as it ships and
check it against its skeleton, while the `async` page stays with the
end-to-end tests, which the Next.js testing guide recommends for `async`
Server Components. `sign-in.stories.tsx` sits beside the page in
`src/app/sign-in/`.
`src/app/dashboard/dashboard-header.tsx` moves into `_ui/`.

## Contracts

`contracts.ts` holds constants and types without logic, and it imports
nothing. Any layer may import a slice's `contracts.ts`, as `src/server/auth.ts`
does for the password bounds and `src/server/db/schema/products.ts` for the
column lengths. A lint rule keeps `contracts.ts` free of imports, so the
exception cannot start a cycle.

## No index files

Slices and `_ui/` folders have no `index.ts`; an import names the file it
needs. `src/components` keeps its directories and their `index.ts`, which
`src/components/types.test.ts` type-checks one directory at a time.

## Checking the layers

ESLint's `no-restricted-imports` rejects, by the importing file's location:

- in the bottom layer, any `@/app`, `@/widgets`, `@/features` or `@/entities`
  path other than `@/entities/<slice>/contracts`;
- in `entities`, any `@/app`, `@/widgets` or `@/features` path, and any
  `@/entities` path other than a `contracts` module;
- in `features`, any `@/app`, `@/widgets` or `@/features` path;
- in `widgets`, any `@/app` or `@/widgets` path;
- in a slice, a relative path that leaves the slice;
- in `contracts.ts`, every import;
- in `src/app`, an `@/app` path, and a relative path that climbs into another
  route's folder, such as `../other/_ui/x`. Climbing to `../_ui/x` stays
  allowed, which is how a route reaches the `_ui/` of a segment above it.

Inside a slice, imports are relative, so the alias rules do not stop a slice
from reaching its own modules. For the files two blocks match, ESLint takes the
later block's options, so each block lists every pattern its files need.

## Tests and stories

Each action's test file mocks only what that action reaches, and declares
those mocks itself, so the file shows what its action depends on. The action
tests share data rather than behaviour: `src/server/action.testing.ts` holds
the request headers, the unexpected-failure result, a `FormData` builder and
a real Next.js redirect error. The schema tests divide like the schemas: the
field and normalization tests go to the entity, and the tests of each action's
schema go to that action.

Each action keeps a mock beside it in `__mocks__/actions.ts`, and
`.storybook/preview.ts` registers one `sb.mock` per action.

A story's title starts with its layer. `.storybook/main.ts` lists each layer's
directory with a `titlePrefix`, `Components`, `Entities`, `Features`,
`Widgets` or `Pages`, and a story's own `title` names only its slice or route and its
component, such as `Sign In/Header`. A story that moves to another layer moves
in the sidebar with it.

## MVP specification

Its section on how the code is organized names the domain features. It is
rewritten for the layers above, with the planned feedback and votes as entities
and their mutations as actions, and it points here for the import rules.

## Verification

- `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`
  pass.
- The client reference manifests of `/dashboard` and `/sign-in` list the same
  client modules from `src` as on `main`, apart from their paths, and each
  entry loads as many chunks as on `main`, of the same sizes give or take a
  hundred bytes.
- One probe import per rule above fails `pnpm lint`, and the code as written
  passes it.
- No comment names a moved file by its old path.

## Out of scope

- Renaming the bottom layer.
- The `Field` namespace on `/dashboard`: the onboarding skeleton imports it, so
  the route lists `field-password-control.tsx`, which it never renders.

## Sources

- Feature-Sliced Design, "Layers":
  https://feature-sliced.design/docs/reference/layers
- Feature-Sliced Design, "Usage with Next.js":
  https://feature-sliced.design/docs/guides/tech/with-nextjs
- Feature-Sliced Design, "Public API":
  https://feature-sliced.design/docs/reference/public-api
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`,
  "Private folders" and "Split project files by feature or route".
