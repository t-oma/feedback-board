# Auth content decomposition implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace `AuthContent` with independently composed intro and tab modules while preserving sign-in behavior.

**Architecture:** The async page prepares query-dependent navigation and renders `AuthIntro` and client `AuthTabs` as direct siblings inside `AuthMain`. `loading.tsx` continues to provide the complete route fallback.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, TypeScript, Tailwind, Base UI, Storybook, Vitest, Playwright.

## Global constraints

- Next.js 16.3.1 with `cacheComponents: true` and `typedRoutes: true`.
- Node.js 24.x; pnpm 11.9.0.
- Preserve all existing user-facing copy, field behavior, and layout classes.
- Keep `replace` on both mode links, the URL as the source of mode, shared email state, and `keepMounted` on both form panels.
- Preserve `returnTo`, including its query and fragment, and `intent` through mode changes.
- Keep link construction on the server in the production route.
- Keep the separate credential forms and their actions unchanged.

## Task 1: Extract and compose auth modules

**Interfaces:** `AuthIntro` consumes `{ mode: AuthMode; intent: AuthIntent | null }`. `AuthTabs` consumes `{ mode: AuthMode; returnTo: Route | null; signInHref: Route; createAccountHref: Route }`. The page produces the complete route UI.

- [x] Inspect the current main branch and Next.js bundled guides.
- [x] Create `codex/auth-content` from current main in the existing managed worktree.
- [x] Run the unchanged baseline: `pnpm test` passed.
- [x] Write these source files, then remove `src/features/auth/ui/auth-content.tsx` and `src/features/auth/ui/auth-forms.tsx`.

### `src/features/auth/ui/auth-intro.tsx`

```tsx
import type { AuthIntent, AuthMode } from "../schemas";

type AuthIntroProps = {
  mode: AuthMode;
  intent: AuthIntent | null;
};

const intentSupportingText: Record<AuthIntent, string> = {
  vote: "Sign in to vote.",
  feedback: "Sign in to add feedback.",
  board: "Sign in to create your board.",
};

export function AuthIntro({ intent, mode }: AuthIntroProps) {
  const heading = mode === "sign-in" ? "Sign in" : "Create an account";

  const signInSupportingText = intent
    ? intentSupportingText[intent]
    : "Sign in to vote, add feedback, or manage your board.";

  const supportingText =
    mode === "sign-in"
      ? signInSupportingText
      : "Your name is shown next to anything you post. Nothing else is public.";

  return (
    <div className="flex flex-col gap-y-2">
      <h1 className="font-serif text-2xl font-semibold">{heading}</h1>
      <p className="min-h-10 text-sm text-foreground-secondary">
        {supportingText}
      </p>
    </div>
  );
}
```

### `src/features/auth/ui/auth-tabs.tsx`

```tsx
"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Tabs } from "@/components/tabs";

import type { AuthMode } from "../schemas";
import { CreateAccountForm } from "./create-account-form";
import { SignInForm } from "./sign-in-form";

type AuthTabsProps = {
  mode: AuthMode;
  returnTo: Route | null;
  signInHref: Route;
  createAccountHref: Route;
};

export function AuthTabs({
  mode,
  returnTo,
  signInHref,
  createAccountHref,
}: AuthTabsProps) {
  const [email, setEmail] = useState("");

  return (
    <Tabs.Root value={mode}>
      <Tabs.List>
        <Tabs.Tab
          value="sign-in"
          nativeButton={false}
          render={<Link href={signInHref} replace />}
        >
          Sign in
        </Tabs.Tab>
        <Tabs.Tab
          value="create-account"
          nativeButton={false}
          render={<Link href={createAccountHref} replace />}
        >
          Create account
        </Tabs.Tab>
        <Tabs.Indicator renderBeforeHydration />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel keepMounted value="sign-in">
          <SignInForm
            email={email}
            onEmailChange={setEmail}
            returnTo={returnTo}
          />
        </Tabs.Panel>
        <Tabs.Panel keepMounted value="create-account">
          <CreateAccountForm
            email={email}
            onEmailChange={setEmail}
            returnTo={returnTo}
          />
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  );
}
```

### `src/app/sign-in/page.tsx`

```tsx
import type { Metadata } from "next";

import {
  buildSignInHref,
  getAuthBackTarget,
  parseSignInQuery,
} from "@/features/auth/navigation";
import { AuthHeader } from "@/features/auth/ui/auth-header";
import { AuthIntro } from "@/features/auth/ui/auth-intro";
import { AuthMain } from "@/features/auth/ui/auth-main";
import { AuthTabs } from "@/features/auth/ui/auth-tabs";
import { env } from "@/server/env";

// One title for both modes. A title per mode would need `generateMetadata`
// reading `searchParams`, which makes the head depend on the request.
export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn({ searchParams }: PageProps<"/sign-in">) {
  const { returnTo, intent, mode } = parseSignInQuery(
    await searchParams,
    env.BETTER_AUTH_URL,
  );
  const signInHref = buildSignInHref({ returnTo, intent, mode: "sign-in" });
  const createAccountHref = buildSignInHref({
    returnTo,
    intent,
    mode: "create-account",
  });

  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <AuthMain>
        <AuthIntro mode={mode} intent={intent} />
        <AuthTabs
          mode={mode}
          returnTo={returnTo}
          signInHref={signInHref}
          createAccountHref={createAccountHref}
        />
      </AuthMain>
    </>
  );
}
```

## Task 2: Relocate stories and verify route wiring

**Interfaces:** Intro stories exercise the intro props; tab stories exercise prepared hrefs and hidden form targets. Screen stories compose the same modules as the route without a new production wrapper.

- [x] Write these stories and remove `src/features/auth/ui/auth-content.stories.tsx`.

### `src/features/auth/ui/auth-intro.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthIntro } from "./auth-intro";
import { AuthMain } from "./auth-main";

const neutralSignInText =
  "Sign in to vote, add feedback, or manage your board.";

const meta = {
  title: "Features/Auth/Intro",
  component: AuthIntro,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <AuthMain>
          <Story />
        </AuthMain>
      </div>
    ),
  ],
  args: {
    intent: null,
    mode: "sign-in",
  },
} satisfies Meta<typeof AuthIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(neutralSignInText)).toBeInTheDocument();
  },
};

export const IntentVote: Story = {
  args: { intent: "vote" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sign in to vote.")).toBeInTheDocument();
  },
};

export const IntentFeedback: Story = {
  args: { intent: "feedback" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Sign in to add feedback."),
    ).toBeInTheDocument();
  },
};

export const IntentBoard: Story = {
  args: { intent: "board" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Sign in to create your board."),
    ).toBeInTheDocument();
  },
};

export const CreateAccount: Story = {
  args: { mode: "create-account", intent: "vote" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Create an account" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "Your name is shown next to anything you post. Nothing else is public.",
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText("Sign in to vote."),
    ).not.toBeInTheDocument();
  },
};
```

### `src/features/auth/ui/auth-tabs.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { buildSignInHref } from "../navigation";
import { AuthMain } from "./auth-main";
import { AuthTabs } from "./auth-tabs";

const meta = {
  title: "Features/Auth/Tabs",
  component: AuthTabs,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <AuthMain>
          <Story />
        </AuthMain>
      </div>
    ),
  ],
  args: {
    mode: "sign-in",
    returnTo: null,
    signInHref: buildSignInHref(),
    createAccountHref: buildSignInHref({ mode: "create-account" }),
  },
} satisfies Meta<typeof AuthTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};

export const CreateAccount: Story = {
  args: { mode: "create-account" },
};

const returnTo = "/dashboard?tab=planned";
const intent = "feedback";

export const WithReturnTo: Story = {
  args: {
    returnTo,
    signInHref: buildSignInHref({ returnTo, intent }),
    createAccountHref: buildSignInHref({
      returnTo,
      intent,
      mode: "create-account",
    }),
  },
  play: async ({ args, canvas, canvasElement }) => {
    const tabQuery = (name: string) => {
      const href = canvas.getByRole("tab", { name }).getAttribute("href");
      return new URL(href ?? "", window.location.origin).searchParams;
    };

    for (const [name, mode] of [
      ["Sign in", null],
      ["Create account", "create-account"],
    ] as const) {
      const query = tabQuery(name);

      await expect(query.get("returnTo")).toBe(args.returnTo);
      await expect(query.get("intent")).toBe(intent);
      await expect(query.get("mode")).toBe(mode);
    }

    const hiddenInputs = canvasElement.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="returnTo"]',
    );

    await expect(Array.from(hiddenInputs, (input) => input.value)).toEqual([
      args.returnTo,
      args.returnTo,
    ]);
  },
};
```

### `src/features/auth/ui/sign-in.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  buildSignInHref,
  getAuthBackTarget,
  parseReturnTo,
  type SignInQuery,
} from "../navigation";
import { AuthContentSkeleton } from "./auth-content-skeleton";
import { AuthHeader, AuthHeaderSkeleton } from "./auth-header";
import { AuthIntro } from "./auth-intro";
import { AuthMain } from "./auth-main";
import { AuthTabs } from "./auth-tabs";

const meta = {
  title: "Features/Auth/SignIn",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    returnTo: null,
    intent: null,
    mode: "sign-in",
  },
  render: ({ returnTo, intent, mode }) => (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <AuthMain>
        <AuthIntro mode={mode} intent={intent} />
        <AuthTabs
          mode={mode}
          returnTo={returnTo}
          signInHref={buildSignInHref({ returnTo, intent })}
          createAccountHref={buildSignInHref({
            returnTo,
            intent,
            mode: "create-account",
          })}
        />
      </AuthMain>
    </>
  ),
} satisfies Meta<SignInQuery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    returnTo: parseReturnTo(
      "/p/orbit-cli?sort=top#vote",
      "https://feedback.example",
    ),
    intent: "feedback",
  },
};

export const CreateAccount: Story = {
  args: { mode: "create-account", returnTo: "/dashboard", intent: "board" },
};

export const Loading: Story = {
  render: () => (
    <>
      <AuthHeaderSkeleton />
      <AuthMain>
        <AuthContentSkeleton />
      </AuthMain>
    </>
  ),
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading sign-in");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};
```

- [x] Extend `e2e/auth.e2e.ts`'s existing public-target mode-switch journey. After switching to account creation, assert the privacy heading and retained intent:

```tsx
await expect(
  page.getByRole("heading", { level: 1, name: "Create an account" }),
).toBeVisible();
await expect(
  page.getByText(
    "Your name is shown next to anything you post. Nothing else is public.",
  ),
).toBeVisible();
expect(new URL(page.url()).searchParams.get("intent")).toBe("feedback");
```

After switching back, assert the sign-in heading, contextual copy, and retained intent:

```tsx
await expect(
  page.getByRole("heading", { level: 1, name: "Sign in" }),
).toBeVisible();
await expect(page.getByText("Sign in to add feedback.")).toBeVisible();
expect(new URL(page.url()).searchParams.get("intent")).toBe("feedback");
```

- [x] Format changed files with `pnpm exec prettier --write`.
- [x] Run `pnpm verify` with Node.js 24 on PATH. Expect formatting, lint, types, unit/story tests, and production E2E to pass.
- [x] Run `pnpm build-storybook`. Expect a successful static build.
- [x] Inspect full-screen sign-in, account-creation, and loading stories at mobile and desktop widths.
- [x] Review the diff and comments, and search runtime source for removed `AuthContent` and `AuthForms` imports. Keep `AuthContentSkeleton` as the aggregate content placeholder.

## Verification result

`pnpm verify` passed on 2026-10-04: formatting, ESLint, TypeScript, 146 unit/story tests, and 7 E2E tests against the production build. `/sign-in` remains partially prerendered. `pnpm build-storybook` passed.

Full-screen sign-in, account-creation, and loading stories were checked at 390px and 1280px. Loaded screens retain a 20px gap between intro and tabs; no screen overflows horizontally. `AuthTabs` was compared with the previous `AuthForms` source and differs only by its name.
