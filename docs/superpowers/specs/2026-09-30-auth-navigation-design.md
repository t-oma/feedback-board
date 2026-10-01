# Auth navigation design

## Goal

Split the sign-in navigation code by what each caller needs, move the sign-in content into the auth feature, remove the auth feature's barrel, and turn on `typedRoutes`.

Nothing changes for the user. The end-to-end tests pass without edits, and that is the main evidence that the refactor kept the behaviour.

## Why

- `parseAuthNavigation` serves two callers that want different things. The actions need only the redirect target, and they ignore `intent`, `mode` and `supportingText`. The page needs to know whether `returnTo` was present at all. It passes `fallback: "/"` and then undoes it through `hasExplicitReturnTo`. Those two fields exist only to cancel each other.
- The supporting-text copy is split across two files. The intent sentences live in `navigation.ts`, a module about parsing and redirect safety. The neutral default and the create-account sentence live in the page.
- `AuthContent` is defined in `src/app/sign-in/page.tsx`. Its skeleton lives in the feature and copies its geometry, and the skeleton's story copies the page's `<main>` classes. Nothing ties the three together. `AuthContent` is async and reads `searchParams`, so it has no stories, and only the end-to-end suite renders a mode and intent combination.
- Every path is a `string`. Next.js checks `Link` hrefs and `redirect` targets against the app's routes only with `typedRoutes`, which is off.
- `src/features/auth/index.ts` ships the sign-in forms to `/dashboard`, which renders only the sign-out button. It is also meant to be the feature's public API, yet three of the five imports from outside the feature bypass it: `src/proxy.ts`, the dashboard's `requireSession` import and `src/server/auth.ts`.

## Navigation module

`src/features/auth/navigation.ts` exports three functions.

- `buildSignInHref({ returnTo, intent, mode }): Route`. Its behaviour does not change. `returnTo` stays a `string`, because the builder only encodes it and `parseReturnTo` validates it again when it comes back, as the auth-entry-href specification requires. The return type needs no assertion, because TypeScript infers `` `/sign-in?${string}` ``, which `Route` accepts.
- `parseReturnTo(value: unknown, origin: string): Route | null`. This is today's private function, now exported, with the same rules. It accepts a string within the schema's bounds that starts with one `/` not followed by `/` or `\`, resolves to the same origin, and is neither `/api` nor below it. It returns `pathname + search + hash`.
- `parseSignInQuery(query, origin): SignInQuery`. `query` holds `returnTo`, `intent` and `mode` as `unknown`, and `SignInQuery` is `{ returnTo: Route | null; intent: AuthIntent | null; mode: AuthMode }`. An unknown mode becomes `"sign-in"`, and an unknown intent becomes `null`.

`parseAuthNavigation` and `AuthNavigation` are removed, and with them `fallback`, `hasExplicitReturnTo`, `supportingText` and the intent copy.

Each action picks its fallback where it redirects: `parseReturnTo(formData.get("returnTo"), env.BETTER_AUTH_URL) ?? "/"` after sign-in, and `?? "/dashboard"` after account creation.

### The one assertion

`parseReturnTo` is where a string from the browser becomes a `Route`, so it holds the only `as Route` in this change. The Next.js documentation expects this for a non-literal href. The type claims more than the check proves: the path is internal, but a page may not exist there. `/nope` passes and ends on the not-found page, which is the right outcome for a redirect. A comment beside the assertion says so.

## Sign-in content

`src/features/auth/ui/auth-content.tsx` exports `AuthContent`, a synchronous component whose props are `SignInQuery`. It renders the heading, the supporting text and `AuthForms`, and builds both tab links with `buildSignInHref`.

All heading and supporting-text copy lives in this file. The intent sentences sit in a `Record<AuthIntent, string>`, so an intent without a sentence does not compile. The copy and the rules for choosing it are the MVP specification's and do not change.

`src/features/auth/ui/auth-main.tsx` exports `AuthMain`, the `<main>` that `/sign-in` renders today, with the same classes.

The page keeps what belongs to the route. It renders `AuthHeader`, then `AuthMain` around a `Suspense` boundary with `AuthContentSkeleton` as its fallback. Inside the boundary, a private async component awaits `searchParams`, calls `parseSignInQuery` with `env.BETTER_AUTH_URL`, and renders `AuthContent` with the result. That component stays in the page because it is the part that suspends, and it reads this route's query and the server environment.

## Stories

`auth-content.stories.tsx` replaces the skeleton's story file. It renders `AuthContent`, and `AuthContentSkeleton` as a `Loading` story, so the skeleton sits beside the content whose geometry it copies. One decorator wraps every story in `AuthMain`, inside a flex column that stands in for the root layout's `<body>`. No class list is copied from the page.

- `SignIn`, with no intent. `play` checks the `h1` "Sign in" and the neutral sentence.
- One story per intent, each checking its sentence.
- `CreateAccount`, with an intent set. `play` checks the privacy sentence, which the intent must not replace.
- `WithReturnTo`, with `returnTo` and `intent`. `play` checks that both tab links carry them and differ only in `mode`, and that both forms send `returnTo` in a hidden input. The value is an existing route, such as `/dashboard?tab=planned`, because the prop is a `Route`.
- `Loading`, the skeleton, with its existing `play`.

### Mocking the actions

`AuthForms` imports the Server Actions, and `actions.ts` imports `server-only`, Better Auth and the database driver. In the story browser, a story that renders `AuthForms` fails to load with `ReferenceError: Buffer is not defined` from `pg`. Storybook's automock, `sb.mock` without a mock file, does not help, because it still evaluates the module's imports. Both results come from a probe story.

The fix is a mock file, `src/features/auth/__mocks__/actions.ts`, registered in `.storybook/preview.ts` with `sb.mock(import("../src/features/auth/actions.ts"))`. Storybook then loads the mock in place of the real module. Each export is a `fn()` typed from the real action, so a story can set a return value with `mocked()` and the call keeps the real signature. The probe story rendering `AuthForms` passed with this mock, axe included.

## Barrel

`src/features/auth/index.ts` is deleted. Every import names the file it needs, such as `@/features/auth/actions` or `@/features/auth/ui/auth-content`.

A Server Component that imports the barrel reaches every Client Component it re-exports, and Next.js adds each of them to the route's client references, used or not. Production builds measured the route-specific JavaScript of `/dashboard`, read from its client reference manifest, uncompressed:

| Imports                                                                 | `/dashboard` JavaScript | Includes `AuthForms` |
| ----------------------------------------------------------------------- | ----------------------- | -------------------- |
| Feature barrel, today                                                   | 84 KB                   | yes                  |
| Direct imports                                                          | 27 KB                   | no                   |
| A barrel in `ui/`                                                       | 84 KB                   | yes                  |
| A barrel in `ui/`, plus `"sideEffects": ["**/*.css"]` in `package.json` | 27 KB                   | no                   |

A barrel in `ui/` therefore works only with `sideEffects`, which promises that no module in the project except CSS does anything when imported. That is true today: the only bare imports in `src` are CSS files and the `server-only` package. Nothing checks it, though. A later bare import could be dropped from the bundle without a warning, and removing the field would grow `/dashboard` again without failing a test. Direct imports carry neither risk, and their only cost is a few more import lines in the sign-in page.

The auth-session specification kept `session.server.ts` out of the barrel so that a Client Component could not reach it by accident. Removing the barrel keeps that protection. `session.server.ts` imports `server-only`, which fails the build when a Client Component imports it. The MVP specification requires that import in every `*.server.ts`.

Component directories keep their `index.ts`. Each one exports a single component or one compound namespace, and `src/components/types.test-d.ts` checks them. The feature barrel was different, because it mixed Server Actions, Client Components and plain functions behind one import path.

## typedRoutes

`next.config.ts` sets `typedRoutes: true`. It rejects five places today, and with the changes above each compiles without an assertion at the call site:

- the two `redirect` calls in `actions.ts`, through `parseReturnTo`;
- the `redirect` in `session.server.ts`, through `buildSignInHref`;
- the two tab links in `auth-forms.tsx`, whose `signInHref` and `createAccountHref` props become `Route`.

`requireSession` takes `returnTo: Route`, so its callers' paths are checked too. `Link` from the route-states change is already generic over the route type, so the hrefs in `not-found.tsx` and `error.tsx` become checked without touching it.

Without the flag, `next` exports `Route` as `string & {}`. The `Route` types can therefore land before the flag, and every commit compiles.

`tsconfig.json` includes the generated types of both `.next` and `.next-e2e`, so after an end-to-end build there are two `link.d.ts` files. TypeScript merges their declarations into overloads, and `skipLibCheck` hides the duplicate identifiers. A probe with both files present reported the same five errors and nothing else. A call passes if either copy accepts it, so a stale copy can let a removed route through but cannot reject a valid one.

The comment in `src/proxy.ts` that names `parseAuthNavigation` is rewritten so that it names no function in another file.

## Tests

- `navigation.test.ts` keeps the `buildSignInHref` tests. The `parseAuthNavigation` cases move to `parseReturnTo` for accepted and rejected paths, and to `parseSignInQuery` for mode and intent parsing and for the rule that `intent` never changes `returnTo`. The intent sentence cases move to the stories, together with the copy.
- `actions.test.ts` and `session.server.test.ts` do not change. They already cover both fallbacks and the rejected external targets.
- The end-to-end tests do not change, and they must pass.

## Verification

`pnpm verify` passes, which includes the end-to-end build with `typedRoutes` on. `pnpm build-storybook` passes with the actions mock.

## Out of scope

- A lint rule for boundaries between features. It comes with the products slice, when there is a second feature to restrict.
- `AuthHeader`, which the board slice changes.
- Redirecting a signed-in user away from `/sign-in`. That changes behaviour, and this change must not.

## Sources

- Next.js `typedRoutes` and "Statically typed links": `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/typedRoutes.md` and `.../05-config/02-typescript.md`.
- `Route` without the flag: `node_modules/next/dist/types.d.ts`.
- Storybook's mock resolution, including the `__mocks__` redirect: `resolveMock` in `node_modules/storybook/dist/mocking-utils/index.js`.
