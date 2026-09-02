# Auth Entry Href Builder Design

## Context

The auth feature already parses `returnTo`, `intent`, and `mode` when a visitor reaches `/sign-in`. Callers also need one consistent way to create that URL without manually concatenating query parameters or depending on React and Next.js navigation primitives.

## Decision

Add a pure `buildSignInHref` function to `src/features/auth/navigation.ts`:

```ts
buildSignInHref(options?: {
  returnTo?: string;
  intent?: AuthIntent;
  mode?: AuthMode;
}): string;
```

All three options are independent and optional. An empty `returnTo` is treated as absent because it names no destination. `sign-in` is the canonical mode and is also omitted; `create-account` is serialized as `mode=create-account`. With no parameters to serialize, the function returns `/sign-in`. Otherwise, it appends a non-empty `returnTo`, a defined `intent`, and a non-default `mode` using `URLSearchParams`. Callers pass the raw internal destination, including any nested query or hash; the builder performs exactly one layer of query-string encoding.

Examples:

```ts
buildSignInHref();
// /sign-in

buildSignInHref({ intent: "vote" });
// /sign-in?intent=vote

buildSignInHref({ mode: "sign-in" });
// /sign-in

buildSignInHref({ mode: "create-account" });
// /sign-in?mode=create-account

buildSignInHref({ returnTo: "" });
// /sign-in

buildSignInHref({
  returnTo: "/p/orbit-cli?sort=top#vote",
  intent: "feedback",
  mode: "create-account",
});
// /sign-in?returnTo=%2Fp%2Forbit-cli%3Fsort%3Dtop%23vote&intent=feedback&mode=create-account
```

Omitting an empty `returnTo` is URL canonicalization, not security validation. The builder does not validate non-empty destinations, accept an `origin`, choose a fallback, or authorize anything. Application code supplies trusted destinations when constructing a link; `parseAuthNavigation` remains the security seam that validates query parameters again when they return from the browser as untrusted input. It rejects an externally supplied empty `returnTo` just like an absent one and uses the caller fallback.

## Integration

Server and Client Components may pass the returned string to `next/link`. A later progressive-enhancement `AuthPromptLink` may use the same function for both its base link and its popover action. No `SignInLink` wrapper, hook, UI, or imperative router navigation is part of this change.

## Verification

Extend `src/features/auth/navigation.test.ts` through the public `buildSignInHref` interface. Cover the bare route, omission of an empty `returnTo`, each optional parameter independently, all parameters together, and a `returnTo` containing its own query, ampersand, and hash. Verify URL fields through `URL` and `URLSearchParams` rather than an exact combined query string, so the test checks behavior without depending on parameter order or incidental percent-escape casing. The `parseAuthNavigation` tests cover externally supplied empty and invalid values, the `sign-in` mode fallback, and the composition of `returnTo`, `intent`, and `mode` in one parsed result.

No new dependency or lockfile change is required.
