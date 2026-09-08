# Storybook foundation design

## Goal

Add a small Storybook workspace for inspecting the project's shared interface modules in isolation. The first stories document only behavior that the components already support. Later component changes add their matching stories in the same commit.

## Framework and configuration

Use the current stable Storybook release with `@storybook/nextjs-vite`. Storybook recommends this framework for Next.js projects, and the repository already satisfies its Next.js and Vite requirements. Keep every Storybook package on the same version.

Configure Storybook manually instead of retaining the CLI's generated demo components. The repository gains:

- `.storybook/main.ts`, with a story glob limited to `../src/**/*.stories.@(ts|tsx)` and `@storybook/nextjs-vite` as the framework;
- `.storybook/preview.ts`, importing `src/app/globals.css` so stories use the real Tailwind configuration, theme tokens, fonts, and body colors;
- `storybook` and `build-storybook` package scripts;
- `storybook-static/` in `.gitignore`.

Do not add addons in this first pass. In particular, defer the Vitest addon, Playwright browser mode, visual-regression services, MSW, generated documentation pages, and a theme switcher. The application has one fixed theme, and the immediate purpose is local visual inspection.

## Story organization

Keep stories beside their implementation:

- `src/components/button/button.stories.tsx`;
- `src/components/field/field.stories.tsx`;
- `src/components/tabs/tabs.stories.tsx`.

Colocation keeps the story and its component in the same change set. Do not create a separate `src/stories` directory or keep the sample stories produced by Storybook's initializer.

Each story imports the module through its public project interface, such as `@/components/button` or `@/components/field`, rather than reaching into private files. A story should teach the same interface that application code uses.

## Initial stories

The first pass records current behavior and must not add production props, styles, or state solely to make a story more interesting.

### Button

Add these stories:

- `Default`, with the current primary label;
- `WithIcon`, proving arbitrary children compose correctly with an existing Lucide icon;
- `Disabled`, using the native `disabled` prop even though dedicated pending styling is not implemented yet.

Keep the story canvas narrow enough to make the button's current `w-full` behavior visible. Do not add a `pending` prop or spinner to the production button in this phase.

### Field

Render the existing `Field.Root`, `Field.Label`, and `Field.Control` composition rather than treating the namespace as a single component. Add:

- `Email`, with the current email attributes and placeholder;
- `Filled`, with a representative default value;
- `Password`, with the current password type, placeholder, and autocomplete attribute.

Do not fabricate an error below the control. The current field interface has no exported error part, and the first stories should make that omission visible rather than pretending it has already been solved.

### Tabs

Render the existing wrapper with two auth-like values because that is its current real consumer. Add:

- `SignInActive`;
- `CreateAccountActive`;
- `Links`, using `nativeButton={false}` and real anchor elements with harmless hash destinations.

The first two stories demonstrate selection and panel behavior. The link story verifies the wrapper supports its existing progressive-enhancement interface without depending on Next.js routing or the auth feature.

## Relationship to the auth-form work

Storybook setup happens before the auth-form integration plan. Once production code adds new shared states, update the colocated stories in the same logical changes:

- add `Pending` to Button when disabled pending styles and spinner composition exist;
- add `ServerError` and `ReadOnly` to Field when `Field.Error` and the corresponding styles exist;
- update Tabs stories only if the shared Tabs interface changes.

Do not add auth-form stories in the foundation pass. The planned forms will import Server Actions, and the Next.js Vite framework does not currently provide transparent Server Action execution inside Storybook. A later design can choose between module mocks and a separate presentational form module after the production form structure is known. Storybook must not force dependency injection or a container/view split before there is a second real consumer.

## Production impact

Story files and `.storybook` configuration remain development-only. They must not be imported from application modules and must not alter the Next.js production bundle.

The setup does not change the public interface of Button, Field, or Tabs. If a current component cannot render under Storybook without a production change, stop and diagnose the environment instead of changing the component to satisfy the tool.

## Verification

Verification for the foundation consists of:

1. Start Storybook and inspect every story at mobile and desktop canvas widths.
2. Confirm the preview uses the repository's background, surface, typography, borders, and accent tokens from `globals.css`.
3. Build the static Storybook output with `pnpm build-storybook`.
4. Run Prettier, ESLint, TypeScript, Vitest, and the Next.js production build.
5. Confirm `storybook-static/` is ignored and the generated output is not staged.

The initial stories are visual examples, not automated component tests. The later Storybook testing decision will determine whether stories also run through Vitest browser mode and CI.

## Sources

- [Storybook for Next.js with Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite/)
- [Storybook Tailwind CSS recipe](https://storybook.js.org/recipes/tailwindcss/)
