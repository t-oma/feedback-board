# Layout grid design

## Context

Each page drew its own `main`. The forms used `NarrowMain`, a card from `sm`
up. The not-found, error, and global-error pages, and the two messages of the
dashboard routes, repeated the same centred classes inline. The public board
had a `main` of its own, because its intro is a band of colour that runs to
the edges of the screen on a phone, so no padding could sit on the `main`.
The owner dashboard was about to get one more.

The headers kept their edges in line with the content through the same
padding, 20 pixels below `sm` and 40 from there. The design draws the desktop
pages at 1280 pixels, and padding alone keeps content against the left edge on
a wider screen.

Splitting `main` by device instead would not help. Every `main` already serves
both through media queries, and the server cannot know the width of the
screen, so choosing a component by device in JavaScript would render one
layout and replace it with another after hydration.

## Decision

Every page that is not a form lays out on one grid, and its header lays out on
the same grid.

### The grid

`layout-grid`, a utility in `src/app/globals.css`, has two areas. `content` keeps
20 pixels from the edges of the screen below `sm` and 40 from `sm` up, and stops
growing at the `xl` breakpoint, 1280 pixels: there the content is 1200 pixels
wide with the design's 40-pixel margins, and on a wider screen it stays 1200
pixels wide and centres. `full` runs from edge to edge.

The areas come from named lines, `full-start` to `full-end` and
`content-start` to `content-end`, so a child takes one with
`grid-column: content` or `grid-column: full` (Rachel Andrew, "Breaking out
with CSS Grid explained"). The theme gives them as `col-content` and
`col-full`. A child of the grid sits in `content` unless it asks for another
area: the default is written inside `:where()`, which keeps it weaker than any
`col-*` class.

`layout-subgrid` is a band across `full` whose own children use the page's
columns through `grid-template-columns: subgrid`, so the band's colour reaches
the edges while what it holds lines up with the rest of the page.

### PageMain

`PageMain` in `src/components` is a page's `main` on the grid. Its children
take the content area by default. With `align="center"` it is a page that
holds a single message: the message sits in the middle of the screen with 48
pixels above and below, as the not-found page did.

### Where it applies

- The owner dashboard: `/dashboard` and its loading state render `PageMain`,
  and `OwnerOverview` and its skeleton are only the content. The heading, the
  notice, and the address keep a 560-pixel measure inside the content area,
  and the empty state centres in it.
- The public board: `Board` renders its header and `PageMain`. The intro is a
  `layout-subgrid` band, white below `sm`. In the loading state the band stands
  beside the `Skeleton` rather than inside it, with its own `aria-hidden`,
  because inside the `Skeleton` it would be held to the content area. The
  empty state centres in the content area rather than in a narrower column.
- The messages: the not-found, error, and global-error pages, "You don’t have
  a board yet" on `/dashboard`, and "You already have a board" on
  `/dashboard/new` render `PageMain` with `align="center"`.
- The headers of the dashboard and of the board lay out on `layout-grid`.

The forms keep `NarrowMain` and the sign-in page keeps its header for now. The
card can become an element of the content area later, with its own frame from
`sm` up.

## Checking

- `PageMain`'s stories measure the content area, a `layout-subgrid` band, and a
  `col-full` child at 320, 834, 1280, and 1920 pixels, and the vertical centre
  of `align="center"`.
- The dashboard's and the board's page stories check that the header's first
  item and the page's heading start at the same edge at 320, 834, and 1920
  pixels, and the board's that its intro band spans the screen on a phone.
- The geometry stories of both loading states render in `PageMain`.
- Each of these fails when broken on purpose: a 36-pixel margin from `sm`, the
  intro band without `layout-subgrid`, and either header back on fixed padding.

The MVP specification's user interface layer states the rule for new pages
and points here.

## Later

`NarrowMain` and the sign-in header on the grid.
