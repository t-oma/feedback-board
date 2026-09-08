# Storybook foundation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal Storybook 10.6 component catalog for the existing shared Button, Field, and Tabs interfaces without changing production component behavior.

**Architecture:** Storybook runs beside Next.js through `@storybook/nextjs-vite`, loads the application's real global Tailwind stylesheet, and discovers colocated Component Story Format files under `src`. Each story imports a component through its public barrel and documents only states that already exist.

**Tech Stack:** Next.js 16.3.1, React 19.2.8, Storybook 10.6.0, `@storybook/nextjs-vite` 10.6.0, Vite 7, TypeScript 5, Tailwind CSS 4, Base UI, Lucide React, pnpm 11.

## Global constraints

- Keep `storybook` and every `@storybook/*` package on exactly `10.6.0`.
- Do not use the Storybook initializer or retain generated demo stories.
- Do not add addons, browser tests, visual-regression services, documentation pages, or auth-form stories in this pass.
- Do not change the production API or styles of Button, Field, or Tabs to support a story.
- Preserve the existing untracked auth integration plan at `docs/superpowers/plans/2026-09-08-auth-form-integration.md`.
- Use the App Router mode globally because this repository has an `app` directory and no `pages` directory.
- Import `src/app/globals.css` once from Storybook preview so Tailwind utilities, theme tokens, and the body palette match the application.

---

## Task 1: Install and configure the Storybook runtime

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Modify: `.gitignore`
- Modify: `eslint.config.mjs`

- [x] **Step 1: Install matching Storybook packages**

Run:

```bash
pnpm add --save-dev --save-exact storybook@10.6.0 @storybook/nextjs-vite@10.6.0
```

Expected: `package.json` contains both packages as exact dev dependency versions and `pnpm-lock.yaml` resolves them successfully.

- [x] **Step 2: Add development and static-build scripts**

Add these entries to `package.json`:

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

- [x] **Step 3: Add the minimal main configuration**

Create `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
};

export default config;
```

- [x] **Step 4: Load the application environment in every story**

Create `.storybook/preview.ts`:

```ts
import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
```

- [x] **Step 5: Exclude generated static output**

Add `/storybook-static/` to `.gitignore`. Add `storybook-static/**` to the existing ESLint `globalIgnores` list so a local static build cannot become lint input.

- [x] **Step 6: Format and type-check the configuration**

Run:

```bash
pnpm exec prettier --write package.json .storybook/main.ts .storybook/preview.ts eslint.config.mjs
pnpm typecheck
```

Expected: both commands exit with status 0.

---

## Task 2: Document the current Button states

**Files:**

- Create: `src/components/button/button.stories.tsx`

- [x] **Step 1: Add Default, WithIcon, and Disabled stories**

Create `src/components/button/button.stories.tsx`:

```tsx
import { Button } from "@/components/button";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    children: "Continue",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      Continue
      <ArrowRight aria-hidden="true" className="size-4" />
    </Button>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true,
  },
};
```

- [x] **Step 2: Validate the story module**

Run:

```bash
pnpm exec prettier --write src/components/button/button.stories.tsx
pnpm exec eslint src/components/button/button.stories.tsx
pnpm typecheck
```

Expected: all commands exit with status 0; no production Button file changes.

---

## Task 3: Document the current Field composition

**Files:**

- Create: `src/components/field/field.stories.tsx`

- [x] **Step 1: Add Email, Filled, and Password stories**

Create `src/components/field/field.stories.tsx`:

```tsx
import { Field } from "@/components/field";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/Field",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Email: Story = {
  render: () => (
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Field.Control
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
      />
    </Field.Root>
  ),
};

export const Filled: Story = {
  render: () => (
    <Field.Root name="name">
      <Field.Label>Name</Field.Label>
      <Field.Control defaultValue="John Doe" autoComplete="name" />
    </Field.Root>
  ),
};

export const Password: Story = {
  render: () => (
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <Field.Control
        type="password"
        required
        placeholder="••••••••"
        autoComplete="current-password"
      />
    </Field.Root>
  ),
};
```

The stories intentionally omit an error message because the public Field namespace does not yet export an error part.

- [x] **Step 2: Validate the story module**

Run:

```bash
pnpm exec prettier --write src/components/field/field.stories.tsx
pnpm exec eslint src/components/field/field.stories.tsx
pnpm typecheck
```

Expected: all commands exit with status 0; no production Field file changes.

---

## Task 4: Document interactive and link-backed Tabs

**Files:**

- Create: `src/components/tabs/tabs.stories.tsx`

- [x] **Step 1: Add an auth-shaped tabs fixture**

Create `src/components/tabs/tabs.stories.tsx`:

```tsx
import { Tabs } from "@/components/tabs";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type AuthMode = "sign-in" | "create-account";

const meta = {
  title: "Components/Tabs",
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function AuthTabs({ defaultValue }: { defaultValue: AuthMode }) {
  return (
    <Tabs.Root defaultValue={defaultValue} className="w-full">
      <Tabs.List>
        <Tabs.Tab value="sign-in">Sign in</Tabs.Tab>
        <Tabs.Tab value="create-account">Create account</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel value="sign-in">
          <p className="text-sm text-foreground-secondary">
            Sign in to continue to your board.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="create-account">
          <p className="text-sm text-foreground-secondary">
            Create an account to start posting feedback.
          </p>
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  );
}

export const SignInActive: Story = {
  render: () => <AuthTabs defaultValue="sign-in" />,
};

export const CreateAccountActive: Story = {
  render: () => <AuthTabs defaultValue="create-account" />,
};

export const Links: Story = {
  render: () => (
    <Tabs.Root defaultValue="sign-in" className="w-full">
      <Tabs.List>
        <Tabs.Tab
          value="sign-in"
          nativeButton={false}
          render={<a href="#sign-in" />}
        >
          Sign in
        </Tabs.Tab>
        <Tabs.Tab
          value="create-account"
          nativeButton={false}
          render={<a href="#create-account" />}
        >
          Create account
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel value="sign-in">
          <p className="text-sm text-foreground-secondary">
            The selected tab is also a real anchor.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="create-account">
          <p className="text-sm text-foreground-secondary">
            This destination works without Next.js routing.
          </p>
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  ),
};
```

- [x] **Step 2: Validate the story module**

Run:

```bash
pnpm exec prettier --write src/components/tabs/tabs.stories.tsx
pnpm exec eslint src/components/tabs/tabs.stories.tsx
pnpm typecheck
```

Expected: all commands exit with status 0. Clicking the button-backed tabs switches panels; the link-backed tabs render as anchors with hash destinations.

---

## Task 5: Verify the catalog and the existing application

**Files:**

- Verify only: `.storybook/*`
- Verify only: `src/components/**/*.stories.tsx`
- Verify only: existing application and test files

- [x] **Step 1: Build the static catalog**

Run:

```bash
pnpm build-storybook
```

Expected: Storybook builds into `storybook-static/` with no missing-story, CSS, alias, or framework errors.

- [x] **Step 2: Inspect every story in the browser**

Run:

```bash
pnpm storybook -- --ci
```

Open `http://localhost:6006`. Inspect all nine stories at narrow and wide canvas widths. Confirm:

- background, surface, borders, accent color, and typography match `globals.css`;
- Button fills the 18rem fixture and icon spacing is correct;
- email, filled, and password controls render and focus correctly;
- both interactive Tabs stories switch panels;
- the Links story uses anchor elements and changes the URL hash;
- the browser console has no render or hydration errors.

- [x] **Step 3: Run the full project verification suite**

Run:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: every command exits with status 0.

- [x] **Step 4: Check repository scope**

Run:

```bash
git status --short
git check-ignore -v storybook-static/index.html
git diff -- src/components/button/button.tsx src/components/field src/components/tabs
```

Expected: `storybook-static/` is ignored; no generated output is staged; existing production component implementations are unchanged; the pre-existing auth plan remains present.
