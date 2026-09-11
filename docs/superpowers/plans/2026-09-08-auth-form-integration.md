# Auth form integration implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing sign-in and account-creation forms to their tested Server Actions, show accessible server errors, preserve the shared email across auth modes, and expose a clear pending state.

**Architecture:** The server page continues to parse untrusted navigation input and produces canonical tab links. A new client-side `AuthForms` module owns only the email shared by the two mounted forms; each form owns its own `useActionState` state and calls its existing Server Action. Base UI Form receives `ActionError.fieldErrors`, so Base UI marks fields invalid, connects errors through `aria-describedby`, clears a field error when that field changes, and focuses the first invalid control.

**Tech stack:** Next.js 16.3.1 App Router, React 19.2.8, TypeScript, Base UI 1.7.0, Tailwind CSS 4, Better Auth 1.7.1, Zod 4.4.3, Vitest 4.1.11.

## Global constraints

- Keep `/sign-in` as the single URL-backed page for `sign-in` and `create-account` modes.
- Tabs remain real Next.js links and preserve an explicit `returnTo` plus a valid `intent`.
- Pass `returnTo` to a form only when `parseAuthNavigation` reports `hasExplicitReturnTo: true`. Omitting it preserves the action defaults: `/` after sign-in and `/dashboard` after registration.
- Treat every hidden input as untrusted. Both Server Actions continue to parse `returnTo` immediately before redirecting.
- Keep Zod and the Server Actions responsible for domain validation. Do not add React Hook Form, client-side schema duplication, `better-result`, or a generic `tryCatch` helper.
- Use Base UI's `errors` interface for field errors instead of manually constructing IDs or `aria-describedby` values.
- Fields become `readOnly` while an action is pending. Do not disable them, because disabled controls are omitted from `FormData`.
- Password fields use the existing `Field.PasswordControl`; the forms never set their `type` directly.
- Disable only the submit button while pending to prevent duplicate submissions.
- The shared `Button` owns only the standard spinner behind `showSpinner?: boolean`. Forms still pass `disabled`, their pending label, and form-level `aria-busy` explicitly.
- Invalid credentials remain a form-level error and never identify whether the email or password was wrong.
- Unexpected errors continue to throw to the nearest route error boundary. A dedicated `/sign-in/error.tsx` is a later hardening task and is outside this plan.
- Sign-out, dashboard session protection, onboarding, Playwright setup, and desktop layout work are outside this plan.

## File map

**Create**

- `src/components/field/field-error.tsx`: styled wrapper around Base UI `Field.Error`.
- `src/features/auth/ui/auth-form-message.tsx`: renders form-level expected errors without duplicating field errors.
- `src/features/auth/ui/auth-form-message.test.tsx`: verifies the form-level error selection rule.
- `src/features/auth/ui/auth-forms.tsx`: client module containing the URL-backed tabs and shared email state.

**Modify**

- `src/components/field/exports.ts`: expose `Field.Error` through the existing namespace.
- `src/components/field/field-control.tsx`: style invalid and read-only states exposed by Base UI and the native input.
- `src/components/field/field.stories.tsx`: document an invalid field and a read-only password state in Storybook.
- `src/components/button/button.tsx`: render the shared spinner when `showSpinner` is true.
- `src/components/button/button.stories.tsx`: document the spinner together with the existing disabled state.
- `src/features/auth/ui/sign-in-form.tsx`: invoke `signInAction` and render its state.
- `src/features/auth/ui/create-account-form.tsx`: invoke `createAccountAction` and render its state.
- `src/features/auth/index.ts`: expose `AuthForms` and stop exposing the two internal form implementations.
- `src/app/sign-in/page.tsx`: pass parsed navigation data and canonical hrefs into `AuthForms`.

---

### Task 1: Add shared validation and pending states

**Files:**

- Create: `src/components/field/field-error.tsx`
- Modify: `src/components/field/exports.ts`
- Modify: `src/components/field/field-control.tsx`
- Modify: `src/components/field/field.stories.tsx`
- Modify: `src/components/button/button.tsx`
- Modify: `src/components/button/button.stories.tsx`

**Interfaces:**

- Consumes: Base UI's `Field.Error` and Form `errors`, the control's `data-invalid` state, the native `:read-only` state, the existing `Field.PasswordControl`, and the existing Lucide dependency.
- Produces: `Field.Error`, `Button({ showSpinner?: boolean })`, and Storybook examples for invalid, read-only, and spinner states; no new public package dependency.

- [ ] **Step 1: Add the field-error wrapper**

Create `src/components/field/field-error.tsx`:

```tsx
import { WithoutClassName } from "@/types";
import { Field } from "@base-ui/react/field";
import { ComponentProps } from "react";

export function FieldError(
  props: WithoutClassName<ComponentProps<typeof Field.Error>>,
) {
  return (
    <Field.Error {...props} className="text-xs/5 font-medium text-danger" />
  );
}
```

Do not pass custom children at call sites. Base UI obtains the message from the enclosing Form's `errors` object and handles one or multiple strings.

- [ ] **Step 2: Export the wrapper through the existing namespace**

Update `src/components/field/exports.ts`:

```ts
export { FieldLabel as Label } from "./field-label";
export { FieldControl as Control } from "./field-control";
export { FieldError as Error } from "./field-error";
export { FieldPasswordControl as PasswordControl } from "./field-password-control";
export { FieldRoot as Root } from "./field-root";
```

- [ ] **Step 3: Style invalid and read-only controls**

Keep the implementation of `FieldControl` unchanged apart from its class string. Use:

```tsx
className =
  "h-12 min-w-0 rounded-lg border border-border bg-surface px-3 py-0 text-sm transition-colors outline-none data-invalid:border-danger data-invalid:bg-danger-surface focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 read-only:border-border-subtle read-only:bg-surface-muted read-only:text-foreground-subtle";
```

`data-invalid` comes from Base UI. The `read-only` selectors represent the action pending state.

- [ ] **Step 4: Let Button render the standard spinner**

Replace `src/components/button/button.tsx` with:

```tsx
import { WithoutClassName } from "@/types";
import { LoaderCircle } from "lucide-react";
import { ComponentProps } from "react";

type ButtonProps = WithoutClassName<ComponentProps<"button">> & {
  showSpinner?: boolean;
};

export function Button({
  type,
  children,
  showSpinner = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type ?? "button"}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-surface outline-none focus-visible:ring-3 focus-visible:ring-accent/20 enabled:hover:bg-accent/90 enabled:active:scale-98 disabled:cursor-not-allowed disabled:bg-accent-muted motion-safe:transition-[background-color,scale]"
    >
      {showSpinner && (
        <LoaderCircle
          aria-hidden="true"
          className="size-4 motion-safe:animate-spin"
        />
      )}
      {children}
    </button>
  );
}
```

`showSpinner` controls only the icon. It does not change `disabled`, `children`, or ARIA attributes. Callers retain ownership of those behavioral choices.

- [ ] **Step 5: Add component stories for the new states**

Add the Base UI Form import to `src/components/field/field.stories.tsx`:

```tsx
import { Form } from "@base-ui/react/form";
```

Append these stories:

```tsx
export const Invalid: Story = {
  render: () => (
    <Form errors={{ email: ["Enter a complete email address"] }}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="text"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field.Error />
      </Field.Root>
    </Form>
  ),
};

export const ReadOnlyPassword: Story = {
  render: () => (
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <Field.PasswordControl
        readOnly
        defaultValue="correct horse battery staple"
        autoComplete="current-password"
      />
    </Field.Root>
  ),
};
```

The invalid story uses the same Form `errors` interface as the auth forms. The read-only password story covers the composite control used during a pending submission; its visibility button remains available because only submit buttons are disabled.

Append this story to `src/components/button/button.stories.tsx`:

```tsx
export const Pending: Story = {
  args: {
    children: "Submitting…",
    disabled: true,
    showSpinner: true,
  },
};
```

The story passes `disabled` separately to preserve the Button interface: a spinner does not silently change button behavior.

- [ ] **Step 6: Verify the state stories in Storybook**

Run:

```bash
pnpm storybook --ci
```

Expected:

- `Components/Field/Invalid` shows the danger border, danger surface, and `Enter a complete email address` below the control.
- `Components/Field/Read Only Password` shows the muted input state while the visibility button still reveals and hides the same value.
- `Components/Button/Pending` shows one rotating loader before `Submitting…`, uses the existing disabled presentation, and retains the button's dimensions.
- Both controls retain the existing field width. The error stays in normal document flow and does not overlap the next control.

Stop the local Storybook process after the inspection.

- [ ] **Step 7: Run focused static checks**

Run:

```bash
pnpm exec prettier --check src/components/field src/components/button
pnpm exec eslint src/components/field src/components/button
pnpm typecheck
```

Expected: all commands exit with code 0. Do not add unit tests that assert Tailwind class strings; Step 6 and the complete browser checks in Task 3 cover the visible states.

- [ ] **Step 8: Commit the shared UI change**

```bash
git add src/components/field src/components/button
git commit -m "feat(forms): add validation and pending states"
```

---

### Task 2: Connect both credential forms to their Server Actions

**Files:**

- Create: `src/features/auth/ui/auth-form-message.test.tsx`
- Create: `src/features/auth/ui/auth-form-message.tsx`
- Create: `src/features/auth/ui/auth-forms.tsx`
- Modify: `src/features/auth/ui/sign-in-form.tsx`
- Modify: `src/features/auth/ui/create-account-form.tsx`
- Modify: `src/features/auth/index.ts`
- Modify: `src/app/sign-in/page.tsx`
- Test: `src/features/auth/actions.test.ts`

**Interfaces:**

- Consumes: `signInAction(previousState, formData)`, `createAccountAction(previousState, formData)`, `ActionError`, `AuthMode`, `Field.Error`, `Field.PasswordControl`, `Button({ showSpinner?: boolean })`, and canonical hrefs produced on the server.
- Produces: `AuthForms({ mode, returnTo, signInHref, createAccountHref })`; the individual form modules become internal implementation details.

- [ ] **Step 1: Write the form-message tests first**

Create `src/features/auth/ui/auth-form-message.test.tsx`:

```tsx
import type { ActionError } from "@/shared/action-result";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthFormMessage } from "./auth-form-message";

describe("AuthFormMessage", () => {
  it("renders an announced form-level error", () => {
    const error: ActionError = {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    };

    const markup = renderToStaticMarkup(<AuthFormMessage error={error} />);

    expect(markup).toContain('role="alert"');
    expect(markup).toContain(error.message);
  });

  it("does not duplicate an error that belongs to a field", () => {
    const error: ActionError = {
      ok: false,
      code: "CONFLICT",
      message: "An account already uses this email.",
      fieldErrors: {
        email: ["An account already uses this email."],
      },
    };

    expect(renderToStaticMarkup(<AuthFormMessage error={error} />)).toBe("");
  });
});
```

- [ ] **Step 2: Run the new test and confirm the expected failure**

Run:

```bash
pnpm exec vitest run src/features/auth/ui/auth-form-message.test.tsx
```

Expected: FAIL because `./auth-form-message` does not exist.

- [ ] **Step 3: Implement the form-level message**

Create `src/features/auth/ui/auth-form-message.tsx`:

```tsx
import type { ActionError } from "@/shared/action-result";
import { CircleAlert } from "lucide-react";

type AuthFormMessageProps = {
  error: ActionError | null;
};

export function AuthFormMessage({ error }: AuthFormMessageProps) {
  if (error === null || error.fieldErrors !== undefined) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-surface px-3 py-3 text-sm text-foreground-secondary"
    >
      <CircleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-danger"
      />
      <p>{error.message}</p>
    </div>
  );
}
```

This component deliberately suppresses `VALIDATION` and `CONFLICT` messages when they already appear through `fieldErrors`.

- [ ] **Step 4: Run the message tests again**

Run:

```bash
pnpm exec vitest run src/features/auth/ui/auth-form-message.test.tsx
```

Expected: 1 test file and 2 tests pass.

- [ ] **Step 5: Add the client module that owns shared email state**

Create `src/features/auth/ui/auth-forms.tsx`:

```tsx
"use client";

import { Tabs } from "@/components/tabs";
import type { AuthMode } from "../schemas";
import Link from "next/link";
import { useState } from "react";
import { CreateAccountForm } from "./create-account-form";
import { SignInForm } from "./sign-in-form";

type AuthFormsProps = {
  mode: AuthMode;
  returnTo?: string;
  signInHref: string;
  createAccountHref: string;
};

export function AuthForms({
  mode,
  returnTo,
  signInHref,
  createAccountHref,
}: AuthFormsProps) {
  const [email, setEmail] = useState("");

  return (
    <Tabs.Root value={mode} className="w-full">
      <Tabs.List>
        <Tabs.Tab
          value="sign-in"
          nativeButton={false}
          render={<Link href={signInHref} />}
        >
          Sign in
        </Tabs.Tab>
        <Tabs.Tab
          value="create-account"
          nativeButton={false}
          render={<Link href={createAccountHref} />}
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

The page, rather than this client module, builds both hrefs. This keeps Zod-backed navigation parsing out of the client bundle.

- [ ] **Step 6: Wire the sign-in form**

Replace `src/features/auth/ui/sign-in-form.tsx` with:

```tsx
"use client";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { signInAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";

type SignInFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo?: string;
};

export function SignInForm({
  email,
  onEmailChange,
  returnTo,
}: SignInFormProps) {
  const [error, formAction, pending] = useActionState(signInAction, null);
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error?.code !== "UNAUTHENTICATED") return;

    setPassword("");
    passwordRef.current?.focus();
  }, [error]);

  return (
    <Form
      action={formAction}
      errors={error?.fieldErrors}
      aria-busy={pending}
      className="flex w-full flex-col gap-y-4"
    >
      {returnTo !== undefined && (
        <input type="hidden" name="returnTo" value={returnTo} />
      )}

      <AuthFormMessage error={error} />

      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="text"
          inputMode="email"
          aria-required="true"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onValueChange={onEmailChange}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.PasswordControl
          ref={passwordRef}
          aria-required="true"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onValueChange={setPassword}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" disabled={pending} showSpinner={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </Form>
  );
}
```

`type="text"` plus `inputMode="email"` is intentional. Base UI validates native constraints before submitting; using `type="email"` or `required` would let the browser/Base UI block the Server Action and replace the project-owned Zod messages with browser-dependent copy. `aria-required` retains the announced requirement, and the Server Action remains authoritative.

- [ ] **Step 7: Wire the account-creation form**

Replace `src/features/auth/ui/create-account-form.tsx` with:

```tsx
"use client";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";
import { useActionState } from "react";
import { createAccountAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";

type CreateAccountFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo?: string;
};

export function CreateAccountForm({
  email,
  onEmailChange,
  returnTo,
}: CreateAccountFormProps) {
  const [error, formAction, pending] = useActionState(
    createAccountAction,
    null,
  );

  return (
    <Form
      action={formAction}
      errors={error?.fieldErrors}
      aria-busy={pending}
      className="flex w-full flex-col gap-y-4"
    >
      {returnTo !== undefined && (
        <input type="hidden" name="returnTo" value={returnTo} />
      )}

      <AuthFormMessage error={error} />

      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Field.Control
          type="text"
          aria-required="true"
          placeholder="John Doe"
          autoComplete="name"
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="text"
          inputMode="email"
          aria-required="true"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onValueChange={onEmailChange}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.PasswordControl
          aria-required="true"
          placeholder="••••••••"
          autoComplete="new-password"
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" disabled={pending} showSpinner={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </Form>
  );
}
```

- [ ] **Step 8: Make `AuthForms` the public UI interface of the auth feature**

Update the UI exports at the top of `src/features/auth/index.ts`:

```ts
export { AuthForms } from "./ui/auth-forms";
export { AuthHeader } from "./ui/auth-header";

export { createAccountAction, signInAction } from "./actions";
export { parseAuthNavigation, buildSignInHref } from "./navigation";
```

Do not export `SignInForm`, `CreateAccountForm`, or `AuthFormMessage`; they are implementation details of `AuthForms`.

- [ ] **Step 9: Keep navigation parsing on the server and render `AuthForms`**

In `src/app/sign-in/page.tsx`, remove imports for `Tabs`, `Link`, `SignInForm`, and `CreateAccountForm`. Import `AuthForms` from the auth feature.

After `supportingText`, derive the explicit destination and canonical hrefs:

```tsx
const returnTo = navigation.hasExplicitReturnTo
  ? navigation.returnTo
  : undefined;
const intent = navigation.intent ?? undefined;

const signInHref = buildSignInHref({
  returnTo,
  intent,
  mode: "sign-in",
});
const createAccountHref = buildSignInHref({
  returnTo,
  intent,
  mode: "create-account",
});
```

Replace the existing `Tabs.Root` tree with:

```tsx
<AuthForms
  mode={navigation.mode}
  returnTo={returnTo}
  signInHref={signInHref}
  createAccountHref={createAccountHref}
/>
```

Do not pass `navigation.returnTo` unconditionally. On a bare `/sign-in`, that value is the page fallback `/`; submitting it during registration would incorrectly override the registration action's `/dashboard` fallback.

- [ ] **Step 10: Run the focused auth checks**

Run:

```bash
pnpm exec prettier --check src/app/sign-in/page.tsx src/features/auth src/components/field
pnpm exec eslint src/app/sign-in/page.tsx src/features/auth src/components/field
pnpm typecheck
pnpm exec vitest run src/features/auth/actions.test.ts src/features/auth/ui/auth-form-message.test.tsx
```

Expected:

- Prettier, ESLint, and TypeScript exit with code 0.
- `actions.test.ts` keeps its 10 passing tests.
- `auth-form-message.test.tsx` has 2 passing tests.

- [ ] **Step 11: Commit the working form integration**

```bash
git add src/app/sign-in/page.tsx src/features/auth
git commit -m "feat(auth): connect credential forms to server actions"
```

---

### Task 3: Verify the complete auth-form behavior

**Files:**

- Verify: `src/app/sign-in/page.tsx`
- Verify: `src/features/auth/ui/auth-forms.tsx`
- Verify: `src/features/auth/ui/sign-in-form.tsx`
- Verify: `src/features/auth/ui/create-account-form.tsx`

**Interfaces:**

- Consumes: the finished `AuthForms` interface and the existing Better Auth database configuration.
- Produces: evidence that the page satisfies its expected browser behavior before the next slice begins.

- [ ] **Step 1: Start the local dependencies**

If PostgreSQL is not already running, run:

```bash
docker compose up -d
pnpm db:migrate
```

Then start the app:

```bash
pnpm dev
```

Expected: Next.js starts without an error and `/sign-in` renders.

- [ ] **Step 2: Verify server validation and accessibility**

Open `/sign-in`, submit an empty sign-in form, and inspect the rendered page.

Expected:

- The Server Action runs instead of Base UI substituting native browser messages.
- Email shows `Enter a complete email address` and password shows `Use at least 8 characters`.
- Focus moves to the email input.
- Each visible error is referenced by its input's `aria-describedby`.
- Editing a field clears that field's displayed server error.

- [ ] **Step 3: Verify URL-backed modes and shared email**

Open:

```text
/sign-in?returnTo=%2Fp%2Forbit-cli%3Fsort%3Dtop&intent=vote
```

Type an email, switch to Create account, then switch back.

Expected:

- The email remains in both modes while JavaScript is active.
- The URL adds `mode=create-account` only in account-creation mode.
- Both links preserve `intent=vote` and the explicit `returnTo`.
- The inactive tab remains a real link in the DOM.

- [ ] **Step 4: Verify invalid credentials**

Submit a known email with a wrong password.

Expected:

- One form-level banner says `That email and password do not match an account.`
- The banner has `role="alert"`.
- The email remains filled.
- The password is cleared and receives focus.
- The message does not claim which credential was wrong.

- [ ] **Step 5: Verify account conflicts**

Try to create an account with an email that already exists.

Expected:

- `An account already uses this email.` appears only under the email field.
- The form-level banner is absent.
- Focus moves to the email input.

- [ ] **Step 6: Verify pending state and duplicate-submit protection**

Throttle the request in browser development tools, then submit either form.

Expected while the request is pending:

- The form exposes `aria-busy="true"`.
- Visible inputs are read-only and remain part of the submitted `FormData`.
- The button is disabled.
- The button text changes to `Signing in…` or `Creating account…` and shows a spinner.
- A password visibility button remains usable without submitting the form again.
- A second submission cannot start.

- [ ] **Step 7: Verify redirect rules**

Exercise these successful submissions:

1. Sign in without `returnTo`.
2. Register without `returnTo`.
3. Sign in through a link with a valid internal `returnTo`.

Expected destinations:

1. `/`
2. `/dashboard`, which may still render not found until the onboarding slice exists
3. The validated internal path including its query and hash

- [ ] **Step 8: Verify progressive enhancement**

Disable JavaScript and reload `/sign-in`.

Expected:

- Both mode controls remain anchors with valid destinations.
- Submitting a form still reaches its Server Action.
- Successful authentication still follows the Server Action redirect.
- The already accepted limitation remains: the inactive tab is not sequentially keyboard-focusable before hydration, and a full no-JavaScript mode navigation cannot preserve typed email.

- [ ] **Step 9: Run the complete repository checks**

Run:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
```

Expected: every command exits with code 0, the production build lists `/sign-in` successfully, and Storybook produces `storybook-static` successfully. Vite may print its known non-blocking warnings about ignored module-level `"use client"` directives and the preview chunk size.

- [ ] **Step 10: Inspect the final change set**

Run:

```bash
git status --short
git log -3 --oneline
```

Expected: the working tree is clean and the two planned commits are present. If browser verification required a correction, commit that correction separately with a message describing the behavior fixed; do not amend a commit after hooks or verification have run.

## Self-review notes

- The plan covers the existing spec's expected field errors, invalid-credential message, pending state, focus behavior, URL-backed tabs, explicit `returnTo`, shared email, and progressive enhancement.
- The plan reuses the password visibility control, keeps Button disabled behavior explicit at each call site, and centralizes only the spinner markup behind `showSpinner`.
- The page retains server ownership of navigation parsing. The client module receives only strings already derived by the server.
- No new dependency or generic form abstraction is introduced.
- The plan deliberately leaves unexpected-error UI for the route error-boundary task and full Playwright journeys for the later E2E setup, as required by the MVP delivery order.
