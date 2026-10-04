# Auth content decomposition

## Approved design

Compose the sign-in route directly from `AuthHeader`, `AuthIntro`, and `AuthTabs`. Remove the intermediate `AuthContent` module. The user approved this structure and requested implementation after adding `loading.tsx`.

## Responsibilities

- `AuthIntro({ mode, intent })` selects and renders the heading and supporting text in one container. It has no runtime imports from navigation, forms, or actions.
- `AuthTabs({ mode, returnTo, signInHref, createAccountHref })` is the renamed client `AuthForms`. It owns the shared email state and both mounted form panels.
- `src/app/sign-in/page.tsx` awaits and parses `searchParams`, derives the exit target, builds both mode links, and composes the modules.
- `AuthMain` retains the spacing between its explicit children. `AuthIntro` owns spacing inside its text block.
- `src/app/sign-in/loading.tsx` remains the route fallback and uses the existing skeleton modules.

## Constraints

- Next.js 16.3.1 with `cacheComponents: true` and `typedRoutes: true`.
- Node.js 24.x; pnpm 11.9.0.
- Preserve all existing user-facing copy, field behavior, and layout classes.
- Keep `replace` on both mode links, the URL as the source of mode, shared email state, and `keepMounted` on both form panels.
- Preserve `returnTo`, including its query and fragment, and `intent` through mode changes.
- Keep link construction on the server in the production route.
- Keep the separate credential forms and their actions unchanged.

## Verification

Move the existing text checks to intro stories and the tab-link and hidden-target checks to tab stories. Keep full-screen composition stories for both modes and the route fallback. Extend the existing public-destination E2E journey to assert the contextual text and `intent` after mode switches. Run `pnpm verify` and `pnpm build-storybook` with Node.js 24.

Read the bundled Next.js page, loading, and server/client module guides before implementation. The baseline unit and story suite passed before editing.

## Relation to earlier decisions

This supersedes the content composition in the 2026-09-30 auth-navigation design. The 2026-10-03 auth-header behavior and the user's route-level loading and history-replacement changes are retained.
