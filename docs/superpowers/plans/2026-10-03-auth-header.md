# Auth header implementation plan

> Implement inline in this chat, in the existing managed worktree. The required execution helper skills named by the general planning template are not installed; execute the concrete steps below directly.

**Goal:** Let a guest leave authentication for their public context without a database lookup.

**Architecture:** Resolve request data once below Suspense. A pure navigation function selects the exit href and destination kind; the responsive header owns the complete visible messages.

**Tech Stack:** Next.js 16.3.1, React 19, TypeScript, Tailwind 4, Vitest, Storybook, Playwright.

## Global constraints

- Branch: `codex/auth-header`.
- Read the bundled Next.js documentation before code changes.
- Preserve post-auth redirect behavior and form state.
- No database lookup for the header.
- Keep the existing design tokens; mobile top navigation and desktop navigation below the brand row.
- Do not add comments that restate code or make unverified claims.

## Task 1: Resolve exit navigation

**Files:** Modify `src/features/auth/navigation.ts` and `src/features/auth/navigation.test.ts`.

**Interface:** Consume normalized `Route | null`; produce the `AuthBackTarget` discriminated union below.

- [x] Add table-driven cases through `parseReturnTo` for:
  - `/p/orbit-cli?sort=top#vote` → same href, `kind: "board"`, `slug: "orbit-cli"`.
  - `/p/orbit-cli/feedback/019a0000-0000-7000-8000-000000000001?from=board#vote` → same href, `kind: "feedback"`.
  - `/p/orbit-cli/changelog?year=2026#latest` → same href, `kind: "changelog"`.
  - Trailing slashes on recognized public routes.
  - `null`, `/dashboard`, `/dashboard/settings`, `/sign-in`, `/unknown`, external URLs, malformed public paths, and extra segments → home.
- [x] Add the implementation:

```ts
export type AuthBackTarget =
  | { kind: "home"; href: Route }
  | { kind: "board"; href: Route; slug: string }
  | { kind: "feedback"; href: Route }
  | { kind: "changelog"; href: Route };

export function getAuthBackTarget(returnTo: Route | null): AuthBackTarget {
  const pathname = returnTo?.split(/[?#]/, 1)[0] ?? "";
  const match =
    /^\/p\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/(changelog|feedback\/[^/]+))?\/?$/.exec(
      pathname,
    );

  const [, slug, section] = match ?? [];

  if (returnTo === null || !slug) {
    return { kind: "home", href: "/" };
  }

  if (section === "changelog") {
    return { kind: "changelog", href: returnTo };
  }

  if (section) {
    return { kind: "feedback", href: returnTo };
  }

  return { kind: "board", href: returnTo, slug };
}
```

- [x] Run `pnpm exec vitest run --project unit src/features/auth/navigation.test.ts`.

## Task 2: Render the responsive header and streaming fallback

**Files:** Modify `src/features/auth/ui/auth-header.tsx`, `auth-header.stories.tsx`, and `src/app/sign-in/page.tsx`.

**Interface:** `AuthHeader({ backTarget }: { backTarget: AuthBackTarget })` and `AuthHeaderSkeleton()`.

- [x] Replace `goBackText` with the required target object. Render a Next Link with `href={backTarget.href}`, decorative ArrowLeftIcon, and `getBackLabel(backTarget)`. Give it a 48px touch area, truncation, and focus-visible ring.
- [x] Share this private header frame between loaded and skeleton variants:

```tsx
function AuthHeaderFrame({ children }: { children: ReactNode }) {
  return (
    <header className="shrink-0">
      <div className="hidden h-15 items-center border-b border-border bg-surface px-5 md:flex">
        <Link
          href="/"
          className="rounded-sm font-serif font-semibold outline-none focus-visible:ring-3 focus-visible:ring-accent/20"
        >
          Feedback Board
        </Link>
      </div>
      <nav
        aria-label="Exit authentication"
        className="flex h-12 items-center border-b border-border bg-surface px-5 md:border-b-0"
      >
        {children}
      </nav>
    </header>
  );
}
```

- [x] The skeleton child is a noninteractive `span` with `aria-hidden="true"` and `className="h-5 w-44 rounded-md bg-surface-muted"`.
- [x] Replace the route's current composition with:

```tsx
export default function SignIn({ searchParams }: PageProps<"/sign-in">) {
  return (
    <Suspense
      fallback={
        <>
          <AuthHeaderSkeleton />
          <AuthMain>
            <AuthContentSkeleton />
          </AuthMain>
        </>
      }
    >
      <AuthPageFromQuery searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthPageFromQuery({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const query = parseSignInQuery(await searchParams, env.BETTER_AUTH_URL);
  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(query.returnTo)} />
      <AuthMain>
        <AuthContent {...query} />
      </AuthMain>
    </>
  );
}
```

- [x] Header story args use `getAuthBackTarget(parseReturnTo(value, "https://feedback.example"))`; assert the link within `getByRole("navigation", { name: "Exit authentication" })`, inside the banner landmark, then assert its href and an explicit expected label for each story. Add home, board, feedback, changelog, long slug, and skeleton examples. Skeleton asserts no navigation link.
- [x] Run the header story project, lint, and typecheck.

## Task 3: Verify the auth exit journey

**Files:** Modify `e2e/auth.e2e.ts`.

**Interface:** Real browser navigation, using the existing built production server and test environment.

- [x] Add a guest journey:

```ts
await page.goto("/sign-in?returnTo=%2Fdashboard");
await page.getByRole("tab", { name: "Create account" }).click();
await expect(page).toHaveURL(/mode=create-account/);
await page.getByRole("link", { name: "Back to Feedback Board" }).click();
await expectPath(page, "/");
await page.goto("/dashboard");
await expectDashboardReturnTo(page);
```

- [x] Add a public-target journey: build the sign-in URL with URLSearchParams, use `/p/orbit-cli?sort=top#vote`, switch both modes, and assert `Back to orbit-cli` keeps the exact href in each mode.
- [x] Run `pnpm verify` and `pnpm build-storybook` under the available Node 24 runtime.
- [x] Inspect mobile and desktop header geometry and focus behavior in the browser. Keep generated previews and build files ignored.
- [x] Re-read changed comments, search for removed identifiers, review the diff, and commit the complete implementation.

## Verification results

- `pnpm verify` passed: formatting, lint, typecheck, 142 unit/story tests, and 6 production E2E tests.
- `pnpm build-storybook` passed.
- After the visual focus-ring adjustment, the 6 header stories and header lint passed again.
- Browser inspection checked 390px mobile, 1280px desktop, and a long slug at 320px. The navigation is 48px high, below the 60px brand row on desktop. Loading has no provisional exit link.
- The test commands used the local Node 24.14.1 runtime.

## Follow-up agreed on 2026-10-04

- [x] Update navigation unit expectations to assert `kind`, `href`, and board `slug`, without English text.
- [x] Move complete labels into this private UI function:

```ts
function getBackLabel(target: AuthBackTarget): string {
  switch (target.kind) {
    case "home":
      return "Back to Feedback Board";
    case "board":
      return `Back to ${target.slug}`;
    case "feedback":
      return "Back to feedback";
    case "changelog":
      return "Back to changelog";
  }
}
```

- [x] Use the always-visible outer header and responsive brand row shown above.
- [x] Run `pnpm verify` and rebuild Storybook. Check header geometry at 390px and 1280px, including the loading variant.

Follow-up verification passed on 2026-10-04: `pnpm verify` and `pnpm build-storybook`. Browser checks at 390px and 1280px confirmed one banner containing the navigation, preserved header dimensions, keyboard focus, and no exit link in the loading state.
