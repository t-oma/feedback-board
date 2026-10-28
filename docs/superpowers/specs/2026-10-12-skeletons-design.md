# Skeletons design

## Context

Two loading states exist: `/sign-in` streams behind `AuthContentSkeleton`, and
`/dashboard` behind `CreateProductFormSkeleton`. Each copies the geometry of
what it stands in for by hand: its own tone class, its own field skeleton, a
fixed number of text bars of hand-picked widths, and heights such as `h-7` and
`h-15` read off the real components. Nothing checks that the copy is right.

At 320px it is not. The onboarding skeleton reserves one bar for an intro that
wraps to two lines, a 28px line for a 32px heading, a 60px block for a 63px
address control, and nothing for the address hint. When the form arrives, its
first field moves down by 32px and its submit button by 61px. The sign-in
skeleton happens to match at that width.

## Decision

A skeleton is built from parts that sit beside the code that renders the real
content and repeat its geometry, and a story checks that the content and its
skeleton line up.

### Text the skeleton knows

`SkeletonText` renders the real string, transparent, inside an element with the
real typography. The browser lays it out like the text it stands for, with the
same line breaks at every width. The span's background paints each line
separately, as wide as the words on it, rounded where the string starts and
ends. `box-decoration-clone` would round every line's bar, but Chromium does not
wrap a paragraph `pretty` around a cloned inline box, and paragraphs wrap
`pretty`, so the bars would break their lines where the text does not. A bar is
as tall as the font's content area, 16px for
14px text on a 20px line, so lines keep a small gap between them.

This covers the static copy of both loading states: headings, intros, labels,
counters, hints and tab names. Text that depends on the request, such as the
sign-in intro, which follows `mode` and `intent`, uses the default string inside
the same reserved space the real text has (`min-h-10`).

The string stays in the DOM. The skeleton's body is `aria-hidden`, and the text
is `select-none`, but the browser's find-in-page can still match it while the
page loads.

Text a skeleton cannot know, such as a product name, does not occur in either
loading state yet. The first skeleton that needs it decides between a toned bar
and `SkeletonText` with a sample of typical length.

### Parts

In `src/components/skeleton`:

- `Skeleton` takes a `label` and renders the shell every loading state repeats:
  `role="status"`, `aria-busy`, the label for screen readers, and an
  `aria-hidden` body. The body stacks its children with the gap `FormPanel`
  puts between the content it stands in for. With `band`, the shell and the
  body are `layout-subgrid` bands instead, so a loading state that stands in
  for bands of the page, such as the board's filters and list on a phone, runs
  to the edges of the screen as they do.
- `SkeletonText`, as above.

Each shared part that appears in a loading state gets a skeleton beside it,
which repeats the classes that place and size the part:

- `Field.Skeleton`: the label row, with the counter's `0 / max` when given, an
  input or textarea block of the control's height, and the hint when given.
- `FormSkeleton`: the form's column.
- `ButtonSkeleton`: a block of the button's height and radius.
- `Tabs.Skeleton`: the tab strip with its names, the first one active, over the
  panel area's offset.
- `PageIntroSkeleton`: the heading and the line under it that the sign-in and
  onboarding intros share, with the room for two lines when the intro reserves
  it.

A feature's own part does the same: `PublicAddressControlSkeleton` beside the
address control, `AuthIntroSkeleton` beside `AuthIntro`, and the onboarding
heading and intro move into `CreateProductIntro` with its skeleton. A feature
skeleton then only composes parts.

### Styles

Classes stay inline, in a part and in its skeleton alike, so reading either
shows its styles. A variable holds classes only where several components share
a look that has to change together, as `Button` and `Link` share
`buttonClassName`, and the text controls `textControlClassName`. What keeps a
skeleton's geometry with its part is the check below, not a shared variable:
the check compares what renders, which a shared class cannot guarantee, since a
skeleton can use every class right and still lay its parts out differently. It
does not see a colour or a font weight, which change a bar's look but move
nothing.

## Checking the geometry

`expectSkeletonGeometry` in `src/components/skeleton/skeleton.testing.tsx`
compares a rendered content tree with its skeleton: the same total height, and
for every control, tab and submit button, the same top and height as the block
standing in for it. A skeleton marks those blocks with `data-skeleton-control`.
Hidden controls, such as the inactive tab panel's, are skipped.

Each feature skeleton has stories that render the content and the skeleton one
under the other, each in its own `FormPanel` inside `PageMain`, at 320px and at the tablet
viewport, where the content sits in the 448px card. Two `main` landmarks on one
page fail axe, so these stories turn the a11y test off; the skeleton's own
accessibility is checked by the stories that render it on its own. Shared parts
with a skeleton check it the same way in their own stories.

## Also in this change

`types.test-d.ts` gains the `form` and `narrow-main` directories, which were
added without their line, and `skeleton`.

## Out of scope

Skeletons for states that do not exist yet, and a shimmer or other animation,
which the design's state sheet rules out. The stories render the serif and mono
text in the app's fonts since `.storybook/preview.ts` sets their variables, so
the geometry checks see the line breaks a page has.
