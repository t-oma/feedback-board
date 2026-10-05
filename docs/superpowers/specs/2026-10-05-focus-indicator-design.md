# Focus indicator design

## Context

Issue #17. `Button`, `Link`, the password visibility toggle and both
`AuthHeader` links remove their outline with `outline-none` and show focus as a
3 px box-shadow ring at 20% `accent`. Composited over the page colours, that
ring measures 1.30 to 1.32:1, below the 3:1 that WCAG 1.4.11 asks of a focus
indicator. In forced-colors mode the browser drops `box-shadow`, and with the
outline gone these elements show no focus at all.

The open `Tabs.Panel` is a Tab stop, because Base UI gives it `tabIndex={0}`.
`TabsPanel` removes its outline and adds no other indicator, so focus on it is
invisible in every mode. WCAG technique F78 lists this as a failure of 1.4.11,
2.4.7 and 2.4.13.

The mobile design file's implementation note asks for "2px brass ring, offset
2px" on every interactive element. The soft ring the code copied appears in the
designs only on a focused field, on top of an accent border. axe-core has no
rule for focus indicators, so the story suite passed throughout.

## Focus style

Every focusable element that is not a text field gets the design note's ring:
`focus-visible:outline-2 focus-visible:outline-accent`, with
`focus-visible:outline-offset-2` to draw it outside the element. Where an outer
ring would be clipped or would cross a border, `focus-visible:-outline-offset-2`
draws it inside instead.

- `buttonClassName`, shared by `Button` and `Link`: outside.
- The `AuthHeader` home link: outside.
- The `AuthHeader` back link: inside. It fills the 48 px navigation bar, and
  below the `md` breakpoint that bar is the top of the page, so an outer ring
  would run past the viewport edge.
- The password toggle: inside, because it sits within the field's border.
- `TabsPanel`: outside.

`accent` measures 5.21 to 5.93:1 against `surface-muted`, `background` and
`surface`. `src/app/theme-contrast.test.ts` already requires 4.5:1 for `accent`
on every surface, which covers the 3:1 requirement without a new contrast test.

An outline also survives forced colors: the browser keeps it and repaints it in
a system colour. The issue records that check in Playwright's Chromium.

The classes are written out in each component rather than wrapped in a custom
utility. `Button` and `Link` already share theirs through `buttonClassName`,
each of the other places is a single element, and the story checks below
compare the computed result, so a copy that drifts fails a test.

Text fields keep the accent border and the 3 px halo that the designs draw.
`Field.Control` replaces its unscoped `outline-none` with
`focus-visible:outline-hidden`. Outside forced colors that is the same
`outline-style: none`; in forced colors Tailwind adds a transparent 2 px outline
that the browser paints in a system colour, where the accent border would
otherwise be repainted away.

## `:focus-visible`, not `:focus`

Decided by Artem on 2026-10-05. The design note also says focus is "never
removed on mouse users", which read literally means `:focus`, so a button would
keep the ring after a click. The ring stays on `:focus-visible`. Browsers match
it for keyboard focus and for text inputs focused by any means, which is what
2.4.7 requires, and a ring left behind after every click is noise for mouse
users.

## Tab order of the auth panels

Decided by Artem on 2026-10-05. `AuthTabs` passes `tabIndex={-1}` to both
panels, so Tab moves from the active tab straight to the first field. The APG
Tabs pattern moves focus to "the tabpanel unless the first element containing
meaningful content inside the tabpanel is focusable", and React Aria's
`useTabPanel` applies the same rule by making a panel a Tab stop only when it
has no tabbable child. Base UI merges its own props before the caller's, so the
caller's `tabIndex` wins.

The choice sits at the call site because only `AuthTabs` knows its panels open
with a form. `TabsPanel` keeps Base UI's default, since a panel that opens with
text should stay a Tab stop.

One case does not fit the APG rule. A form-level error renders
`AuthFormMessage` above the fields, and then the panel's first content cannot
take focus. The message has `role="alert"`, so a screen reader announces it
when it appears, and it appears only after a submit, when focus is already
inside the form. The alternative was Base UI's default, which costs every
keyboard user an extra Tab stop and draws an outline around the whole form that
the designs do not have.

## Checks

A shared story helper asserts the ring on a focused element: computed
`outline-style` `solid`, `outline-width` `2px`, `outline-color` equal to the
`--color-accent` value read from the document, and `outline-offset` `2px` or
`-2px` for the inside placement. A second helper presses Tab until a given
element has focus, so a check does not depend on how many Tab stops come before
it at the current viewport width.

- `Button` `Primary`, both `Link` stories, the `Field` `Password` story (the
  toggle), every `AuthHeader` story with a back link, and a `Components/Tabs`
  story (the panel) assert the ring.
- A desktop-viewport `AuthHeader` story asserts the ring on the home link, which
  is hidden below `md`.
- The `Features/Auth/Tabs` `SignIn` story asserts that Tab from the active tab
  lands on the Email field.

An ESLint `no-restricted-syntax` rule rejects `outline-none` in string
literals and template literals, with or without a variant prefix. The message
points to `outline-hidden` or a visible `focus-visible:outline-*`.

Forced-colors behaviour has no story check. A page cannot switch itself into
forced colors; that takes the test runner's control of the browser, and play
functions also run in Storybook's own UI, which has none. The lint rule keeps
the cause out instead.

## Scope

`Tabs.Tab` keeps the browser's own outline, which it recolours to `accent`. The
field halo stays as drawn. Verification runs formatting, lint, TypeScript
checks, unit tests, Storybook browser tests and the e2e suite.
