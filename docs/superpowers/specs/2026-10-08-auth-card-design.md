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

- 448px of content (`w-md` from Tailwind's container scale, where the design
  draws 440px), centred horizontally, with the page `background` around it.
  The design file sets no `box-sizing`, so it renders with the browser's
  `content-box` and measures the card by its fields; the card keeps
  `content-box`, so with padding and border it is 522px. No side gutter is
  needed: at 640px each side keeps 59px.
- `surface` fill, a 1px `border-subtle` border, an 8px radius (`rounded-lg`,
  as the dashboard's address card has, where the design draws 10px) and
  Tailwind's `shadow-xs`. The design's shadow is `0 1px 3px rgba(26,25,23,.06)`; the tab
  indicator also takes its shadow from the Tailwind scale rather than the
  design's exact value.
- Padding of 36px on every side, Tailwind's `p-9`. The design draws 38px at the
  top and 34px at the bottom, a difference too small to read as anything but
  drift. The gap between the intro and the tabs stays 20px, as on mobile.
- 76px below the header and 104px above the page end. The card is as tall as
  its content and is not centred vertically. A centred card would move the tab
  strip by about 46px on every mode switch, because create-account is taller by
  the Name field, which breaks the design's rule that switching mode moves
  nothing but the field count. On an iPad the keyboard also covers more than a
  quarter of the screen.

The card starts at `sm` rather than `md` because it fits from about 554px, and
an iPad mini in portrait is 744px wide. The header moves its switch from `md`
to `sm` with it, so the page has two states: the mobile layout, and the card
under the two-row header. A mobile header bar above the card would mix the two.

A phone held sideways gets the card once it is 640px wide. Below `md` that is
only small phones such as an iPhone SE at 667×375, where the 108px header, the
76px offset and the card padding push the first field below the fold. Phones of 768px and wider already got the two-row header
before this change. A height condition would fix both and is left for later.

`main` keeps `overflow-x-clip`, so the sideways slide of the tab panels is
clipped at the card's edge rather than the viewport's.

`NarrowMain` in `src/components` renders the card, so the page, its
`loading.tsx` skeleton and the stories get the same frame. The layout grid
design later split it into `PageMain`, the frame, and `FormPanel`, the card.

## Header

From `sm` up, the exit-link row has no fill, so the link sits on the page
background above the card. The brand row and its bottom border are unchanged
and still close the header. Below `sm` the exit-link row is the mobile header
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

## Shared with onboarding

The design has one other card, on the onboarding screen, and it differs in
width (620px), border colour (`border`), radius (11px), padding, gap and
shadow. Apart from the width, these differences look like drift in the design
rather than intent. The width belongs to the design's desktop composition of
onboarding, which is not built yet, so onboarding renders its mobile
composition in this card too (see the onboarding design). The card was first
`AuthMain`; it moved to `src/components` as `NarrowMain`, with the values above
and no variable.

## Verification

- A `Features/Auth/SignIn` story at an iPad mini viewport (744px, between `sm`
  and `md`) checks that the tab strip, which spans the card's content, is 448px
  wide, that `main` is centred and that the header shows the brand link. A
  story at `mobile1` (320px) checks that `main` spans the viewport and that the
  brand link is absent. axe runs on both.
- Playwright screenshots at 390, 744, 834 and 1280px in both modes, compared by
  eye, plus a check in the iPad simulator.
- `pnpm verify`.

## Out of scope

The header's composition and a logo.
