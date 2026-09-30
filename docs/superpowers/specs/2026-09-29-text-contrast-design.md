# Text contrast design

## Context

The theme contains two sources of low-contrast text. `foreground-faint` is
`#8c877c`, which does not reach the WCAG AA minimum of 4.5:1 for normal text on
any application surface. Nothing uses the token. Input placeholders inherit
Tailwind's semi-transparent preflight colour, so the placeholders on the auth
forms render at roughly 3.3:1 against `surface`.

Disabled text is outside this change because WCAG exempts inactive controls.
Storybook's web-font loading is tracked separately and does not affect these
colour pairs.

## Theme changes

Remove `foreground-faint` rather than preserve a text token that cannot satisfy
its stated role. Existing designs that use `#8c877c` for small text use
`foreground-subtle` instead. If a future non-text element needs a lower-contrast
colour, that feature should add a token named for its graphical role.

Add a base `::placeholder` rule in `src/app/globals.css` whose colour is
`var(--color-foreground-subtle)`. The rule applies to current auth fields and to
future inputs and textareas without requiring every component to repeat a
placeholder utility.

Keep `foreground-disabled`, but define its role as disabled text only. It is not
a placeholder colour.

## Contrast contract

Add a Node unit test at `src/app/theme-contrast.test.ts`. It reads the colour
declarations from `src/app/globals.css`, converts six-digit hex values to linear
sRGB, and calculates the WCAG contrast ratio without a new dependency.

The test selects surfaces by the theme's naming convention:

- surfaces are `background`, `surface`, tokens beginning with `surface-`, and
  tokens ending with `-surface`;
- `foreground-disabled`, `accent-muted`, `border`, `border-subtle`, and
  `danger-border` are explicit non-text exceptions;
- every other colour token is text by default.

Every text colour must have a contrast ratio of at least 4.5:1 against every
selected surface. Adding a non-text token therefore requires a deliberate
exception, and the test fails if a named exception no longer exists in the
stylesheet. A text or surface token that is not a six-digit hex value fails
with the token name instead of disappearing from the test. Contrast failures
report both token names and the measured ratios for the full matrix.

The matrix already covers the active primary button's `surface` text on an
`accent` background. Contrast is symmetric, so the matrix's `accent` on
`surface` calculation verifies the same colour pair at 5.93:1. The test does
not duplicate that pair as a component-specific case. `surface` on
`accent-muted` belongs to the disabled or pending button state and remains
exempt.

## Browser verification

Extend the `Email` field story's `play` function to read the computed
`::placeholder` colour in Chromium and compare it with
`foreground-subtle`. This verifies that the browser receives the intended
opaque colour after Tailwind and the base stylesheet are applied. One field
story is sufficient because the selector is global; axe continues to check the
rendered component stories for other active text and background combinations.

## Documentation and scope

Update the theme token table to remove `foreground-faint` and describe
`foreground-disabled` as disabled text. Replace the original verification
section, which rejected tests for token declarations, with the contrast
contract and the computed placeholder assertion.

The change does not modify field components or auth forms, add dependencies,
or change the lockfile. Verification runs formatting, lint, TypeScript checks,
unit tests, and Storybook browser tests.
