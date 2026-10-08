# Auth card design

## Context

From `sm` up, `/sign-in` renders its mobile layout stretched to the viewport.
On an iPad Pro 11-inch at 834px the form is 794px wide. The desktop design
shows a 440px card on the page background instead. The auth header spec left
"the form's responsive card design" out of its scope.

## Layout

Below `sm` nothing changes: `main` is the full-width `surface` area that fills
the viewport under the header.

From `sm` (640px) up, `main` itself is the card:

- 440px of content, centred horizontally, with the page `background` around
  it. The design file sets no `box-sizing`, so it renders with the browser's
  `content-box`: its fields are 440px wide and the card, with padding and
  border, is 514px. No side gutter is needed: at 640px each side keeps 63px.
- `surface` fill, a 1px `border-subtle` border, a 10px radius and Tailwind's
  `shadow-xs`. The design's shadow is `0 1px 3px rgba(26,25,23,.06)`; the tab
  indicator also takes its shadow from the Tailwind scale rather than the
  design's exact value.
- Padding of 38px at the top, 36px at the sides and 34px at the bottom. The gap
  between the intro and the tabs stays 20px, as on mobile.
- 76px below the header and 104px above the page end. The card is as tall as
  its content and is not centred vertically. A centred card would move the tab
  strip by about 46px on every mode switch, because create-account is taller by
  the Name field, which breaks the design's rule that switching mode moves
  nothing but the field count. On an iPad the keyboard also covers more than a
  quarter of the screen.

The card starts at `sm` rather than `md` because it fits from about 554px, and
an iPad mini in portrait is 744px wide. The header keeps its `md` switch, so
between 640px and 767px the mobile header bar sits above the card.

`main` keeps `overflow-x-clip`, so the sideways slide of the tab panels is
clipped at the card's edge rather than the viewport's.

`AuthMain` renders the card, so the page, its `loading.tsx` skeleton and the
stories get the same frame with no change where they use it.

## Header

From `md` up, the exit-link row has no fill, so the link sits on the page
background above the card. The brand row and its bottom border are unchanged
and still close the header. Below `md` the exit-link row is the mobile header
bar and keeps its `surface` fill and border.

## Deviations from the design

- No 26px logo mark at the top of the card. The project has no logo yet, and the
  header brand is text only.
- Fields stay 48px tall at every width, where the desktop design draws 44px.
  Tablets are touch devices, and the loading skeleton reproduces the 48px
  control.
- The heading stays `text-2xl` (24px); the design uses 25px.
- Field text follows the MVP specification's rule: 16px below `md`, 14px from
  `md` up.

## Not shared yet

The card stays in `AuthMain`. The design has one other card, on the onboarding
screen, and it differs in width (620px), border colour (`border`), radius
(11px), padding, gap and shadow. Apart from the width, these differences look
like drift in the design rather than intent. When onboarding is built, the card
look moves to `src/components` with the values above and the width as its only
variable, and `AuthMain` keeps the mobile behaviour.

## Verification

- A `Features/Auth/SignIn` story at Storybook's `tablet` viewport (834px)
  checks that the tab strip, which spans the card's content, is 440px wide and
  that `main` is centred. A story at `mobile1` (320px) checks that `main` spans
  the viewport. axe runs on both.
- Playwright screenshots at 390, 744, 834 and 1280px in both modes, compared by
  eye, plus a check in the iPad simulator.
- `pnpm verify`.

## Out of scope

The header's composition, a logo, and a shared card component.
