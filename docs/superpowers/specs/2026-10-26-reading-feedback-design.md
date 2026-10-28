# Reading feedback design

## Context

A public board shows its product's name, its heading and description, and
the first-feedback empty state, whatever the board holds: no feedback can be
written yet, and nothing reads it. The schema already has `feedbacks` and
`votes`, without the indexes the MVP specification asks for, and the feedback
bounds still sit in the table definition.

The MVP specification splits the rest of the product into slices: public
board, feedback detail, feedback creation, voting, owner management,
changelog, and hardening and deploy. This design covers the first two, which
together are everything a visitor reads without acting: the board's feedback
list with its status filter and sort, and a feedback item's own page. The
rows link to that page, as the design draws them, so both arrive in one
design and the not-found rules are written once for both.

Nobody can create feedback until the creation slice, so a demo board seeded
into the database gives the list something to show, locally and in
production, where the MVP's Definition of Done asks for a realistic public
demo board.

## Decision

### Data

`src/entities/feedback/` is a new entity slice.

`contracts.ts` holds `FEEDBACK_STATUSES`, the status values as the database
spells them, from which the schema builds its `pgEnum`, and the title and
body maximums, which move out of `src/server/db/schema/feedbacks.ts` as the
product bounds did. The minimums arrive with the creation slice, their first
reader. It also holds the board's query keys: `status` is
`all|open|planned|in-progress|completed` and `sort` is `new|top`, with `all`
and `new` as defaults, and the mapping between the URL's `in-progress` and the
database's `in_progress`.

`schemas.ts` parses the board's `searchParams` with Zod. An unknown, empty, or
repeated value becomes the default, as the sign-in page treats `mode`.
`isFeedbackId` checks that a value is a UUID before any query is made, as
`isProductSlug` checks a slug: PostgreSQL answers a malformed value with
`invalid input syntax for type uuid`, which would surface as an unexpected
error instead of a page that does not exist.

`queries.server.ts` holds three reads, all of visible feedback only, meaning
`hidden_at IS NULL`:

- `getBoardStatusCounts(productId)` counts the board's items per status in one
  `GROUP BY status`, and their total.
- `getBoardFeedback(productId, { status, sort })` returns at most 100 rows:
  the item's id, title, body, status, and creation time, its author's name,
  and its vote count. The count is the MVP specification's `LEFT JOIN` from
  feedback to vote, counting the vote's user column, and the order is the one
  it fixes for `new` and `top`, ending with `id DESC`. The author's name is
  `users.name`, which account creation already tells people is public: "Your
  name is shown next to anything you post."
- `getVisibleFeedback(productId, feedbackId)` returns one item with the same
  fields, or `null` for a hidden item, an item of another board, or a value
  that is not a UUID, which it answers without a query. React's `cache` wraps
  it, because the feedback page and its metadata both read it.

A migration adds two indexes:

- On `feedbacks`, for the public list, a partial index on
  `(product_id, status) WHERE hidden_at IS NULL`; a query for every status
  uses its `product_id` prefix.
- `votes (feedback_id)`. The primary key `(user_id, feedback_id)` begins with
  the user, so it cannot serve a count of one item's votes.

The list's index holds no sort columns. The query groups its rows to count
votes and sorts the groups, so PostgreSQL sorts after the aggregate whatever
order the index keeps. Its plan, with sequential scans turned off, showed a
`Sort` above the `HashAggregate` with `created_at DESC, id DESC` in the
index as well as without them; the index served only the filter.

The changelog's index on completion time arrives with the changelog, its
only reader.

### The board

#### Structure and states

The page reads the product as it does now; a failed or missing product is the
whole page, so `error.tsx` and the root not-found page still answer for it.
It then parses `searchParams` into a view, a status and a sort.

`Board` stays synchronous, so its stories render the page's composition, and
takes the feedback region as a slot, as it takes the viewer. The page fills
the slot with an error boundary made with `catchError` from `next/error`,
stable since Next.js 16.3, around an `async` region. The region reads the
counts and renders one of three states:

1. The board has no visible feedback: design state 04, "No feedback yet", as
   today, with no filters and no sort.
2. The chosen status has none: the filters with their counts, then design
   state 05, "Nothing matches this filter", a sentence with the board's
   total, "There are 24 items on the board under other statuses.", and a
   "Reset filters" link to the board's bare address.
3. Otherwise: the filters, then the list inside a `Suspense` boundary whose
   fallback is the rows' skeleton.

The error boundary carries ``key={`${status}:${sort}`}``. A probe against a
production build showed why. With a plain `Suspense` around a list that took
two seconds, a click on a sort link changed nothing for those two seconds,
neither the address nor the list, and then swapped both at once: Next.js runs
a navigation as a transition, and React does not put a boundary that already
shows content back to its fallback during one. With a key on the boundary, the
address had changed and the list's fallback showed within 100 milliseconds,
under the board's bar and intro. The key on the error boundary remounts the
whole region, so the list's `Suspense` is new on every change of view, and an
error from one view does not stay on the next.

When the region fails, the bar and the intro stay. In its place comes
`ErrorState`, "We couldn’t load the feedback. Please try again.", with Retry
calling the boundary's `retry()`.

The first visit still waits behind `loading.tsx`. `BoardSkeleton` draws the
filters and a few rows in place of the empty state, with the sample board it
already uses, and its geometry stories compare it with the board showing rows.

#### Filters and sort

Status and sort are two labelled groups of links, the current one marked with
`aria-current="page"`. `boardHref(slug, view)` builds each address and leaves
out default values, so the bare `/p/orbit-cli` is All and Newest, as the
design writes it. A status link keeps the current sort, and a sort link keeps
the current status. Each status shows its count, as the design does. On a
phone the row of filters scrolls sideways, as the mobile design draws it.

They stay links, so they work before hydration and without JavaScript. They
are not in the prerendered shell, which the MVP specification expected:
which link is current depends on the address, and the counts, and whether
the filters show at all, depend on the data.

#### A row

The list is an ordered list, since its order is the sort. A row holds:

- The vote count at the start, "▲ 128". Until the voting slice it is text,
  read as "128 votes", not a control.
- The title, a link to `/p/{slug}/feedback/{id}` stretched over the whole row,
  so a click anywhere on the row, the count included, opens the item, and the
  focus ring goes around the row. The voting slice lifts its control above the
  stretched link, as the design has it: "the vote control is a separate
  button inside it".
- The body, cut to two lines from `sm` up, and left out on a phone, as in the
  mobile design.
- The author's name and the date, in mono: "Marta K. · 14 Aug 2026".
- The status chip, at the end of the row from `sm` up and under the title on a
  phone. It is monochrome, as the design draws it: the dot's shape, empty,
  half, hatched, or full, tells the statuses apart, not a colour.
  `StatusChip` sits in the board's `_ui/`, which the feedback page below it
  may use; it moves to `entities/feedback/ui/` when the dashboard needs it.

A title or a name with no space in it breaks rather than widening the page,
as the board's name already does.

#### Dates

A date is a `<time>` with its `dateTime`, formatted by
`Intl.DateTimeFormat("en-GB", { timeZone: "UTC" })`: "14 Aug 2026" in a row
and "14 August 2026" on the feedback page. The year is always shown, where the
design's rows leave it out; leaving it out for the current year would make the
text depend on the moment it was rendered, which a cached list would then
freeze. The time zone is UTC, so a visitor far from it can see a date a day
off their own; their local time would need the date formatted in the browser.

### The feedback page

`/p/[productSlug]/feedback/[feedbackId]` follows the board's composition. The
page reads the product and then `getVisibleFeedback`, and renders a
synchronous `FeedbackDetail` from its `_ui/`; `loading.tsx` renders
`FeedbackDetailSkeleton` with a sample item, and geometry stories compare the
two. `generateMetadata` titles the page with the item's title through the same
cached read.

An unknown slug, a value that is not a UUID, a hidden item, and an item of
another board all call `notFound()` and get design state 03, the same words
for each, so a link to a hidden item cannot be told from one that never
existed. As on the board, the status is 200 with a `noindex` tag, since the
page has started streaming. A failed read is the whole page and reaches
`error.tsx`.

Each page renders its own header. A header in the board's layout would stay
on screen from the board to an item, but only the item's header has a way
back, so the layout would have to learn which page it holds in the browser,
and `SiteHeader` would have to decide its layout there too. The cost of a
header per page is a moment of the header's skeleton on that navigation. The
board and the changelog share their bar, intro, and tabs, which is where a
layout pays off, so it comes with the changelog.

The way back reads "Back to Orbit CLI", with the product's name, and leads to
the board's bare address. On a phone it replaces the product's name in the
bar, and the mobile design names the product there so that a link opened cold
still says whose item it is; on a wider screen it is the first line under the
bar. One label serves both, and `BackLink` keeps its single `label`.

The page shows what the design shows, each width as drawn: "▲ 128 VOTES", as
text until voting, the title as the `h1`, the status chip, above the title on
a phone, "Marta K. · 14 August 2026", and the body with the line breaks its
author typed. A "Copy link" button follows the body. `CopyLinkButton` moves
from the dashboard's `_ui/` to `src/components`, now that a second route uses
it. The mobile design draws the count only in the vote button pinned to the
bottom of the screen, so until voting a phone shows it at the end of the line
under the title: "Marta K. · 14 Aug 2026 · 128 votes".

### The demo board

`pnpm db:seed --owner-email you@example.com [--replace]` runs
`tsx --conditions=react-server --env-file-if-exists=.env scripts/seed-demo-board.ts`.
`tsx` is a new development dependency: plain Node resolves neither the `@/`
paths nor, without the `react-server` condition, `server-only`, which throws
on import. A probe ran the database client this way against the development
database, and the same probe without the condition failed on `server-only`.
In production the same script runs once after deployment, with the
production database's variables in the shell. Node keeps a variable the
environment already holds over the file's value, and a missing `.env` is no
error; a run with the test database's variables exported seeded the test
database, not the one `.env` names.

`seedDemoBoard({ ownerEmail, slug, replace })` does the work in one
transaction:

1. It finds the account with that email, and fails if there is none, asking
   for the account to be created first.
2. If that account already owns the demo board, it fails, unless `replace` is
   set; then it deletes the board, and the cascade removes its feedback and
   votes. An account that owns a different board, or a slug that another
   account owns, also fails. Replacing is explicit because it also deletes
   whatever real visitors wrote on the demo.
3. It creates the product, Orbit CLI at `orbit-cli`, with the design's
   description.
4. It inserts the authors and the voters as accounts without a password, so
   nobody can sign in as them, with fixed emails under the reserved `.invalid`
   domain, where no mail can be delivered. A second run reuses them. Authors'
   names show on the board; voters' names show nowhere.
5. It inserts the design's 24 items, 12 Open, 5 Planned, 3 In Progress, and 4
   Completed, created over the months before the run, the completed ones with
   their `completedAt`. Their votes follow the design, up to 128, so the seed
   creates as many voters as the largest count needs, and every item has its
   author's vote, as creating feedback gives it.

`seedDemoBoard` sits in `src/server/db/seed/`, with the demo's text in a
module of its own beside it, and with its database test, since the `db`
Vitest project collects `src/**/*.db.test.ts`. `scripts/seed-demo-board.ts`
only reads the arguments.

### Departures from the design

The MVP specification's user interface layer records these:

- A row's date always shows the year, and dates are in UTC.
- A failed feedback list shows Retry alone, without the "Go to the board" of
  state 02: the board is still around it.
- The feedback page has no side panel. Its Status, Votes, and Requested by
  repeat the column beside them, and its Board repeats the bar and the way
  back; its "Copy feedback link" becomes the "Copy link" button under the body.
- The way back reads "Back to {product}" at every width, where the desktop
  design reads "Back to board".
- The way back leads to the board's bare address, where the mobile design
  returns with "its filter and sort intact"; the browser's Back button keeps
  them.
- Until voting, a phone shows an item's vote count in the line under its
  title, where the mobile design puts it in the vote button.
- A row leaves out the grey circle the design draws before the author's name,
  which stands for a picture the app does not have.
- A status dot is drawn in its text's colour, on a chip and on a filter, so
  it shows on the dark current filter too.

### Updates to other specifications

Each pull request below updates what it changes:

- The MVP specification's user interface layer drops the claim that the
  filters sit in the prerendered shell and records the departures above.
- The site header design's "Not in this change" loses the phone label, now
  decided, and its note on the board's layout points to the changelog.

### Not in this change

- Add feedback, on the board and in the empty state.
- The vote control, "you voted", and the closed control of completed items.
- The board's Board and Changelog tabs, and the changelog's index.
- `use cache` for these reads. Caching is proven by expiring a cached read
  after a write, and this slice writes nothing, so it arrives with feedback
  creation, together with `updateTag()` and a test that a new item shows at
  once.
- The owner's view of feedback.
- "View demo board" on the landing page.

## Checking

- Unit tests: parsing `searchParams`, including unknown, empty, and repeated
  values and `in-progress`; `boardHref` leaving out defaults;
  `isFeedbackId`; date formatting.
- Database tests: an item without votes appears under both sorts with a count
  of zero; a hidden item is left out of the list, the counts, and the detail
  read; another board's item reads as `null`; items created at the same moment
  order by `id`; 101 items return 100; the seed's counts per status match its
  data, every item holds its author's vote, a second run fails without
  `replace` and passes with it. The seed runs against the test database under
  a unique slug, since that database is never reset.
- Stories: a row on a phone and from `sm` up, with a long title and as
  Completed; the filters with the current link and its `aria-current`; states
  04 and 05; the region's error state; `StatusChip`; the feedback page; the
  skeleton geometry of the board and the feedback page at 320 and 834 pixels.
- End-to-end tests against the production build, with feedback inserted into
  the test database: the board lists items with their counts; Top changes the
  address and the order; Planned leaves only planned items; a status with no
  items shows state 05, and Reset filters returns to the bare address; a row
  opens its page, and the way back returns to the bare board; a hidden item is
  not on the board and its address is not found, and so are a malformed and
  another board's id.

## Delivery

Three pull requests, the feedback page before the board's list, so that every
row links to a page that exists:

1. Data: the entity's contracts, schemas, and queries with their database
   tests, the index migration, and the seed with `tsx` and its test.
2. The feedback page: the page and its skeleton, the way back, `CopyLinkButton`
   in `src/components`, and its end-to-end tests.
3. The board: the region with its error boundary, the filters, the rows, the
   states, the skeleton, and the board's end-to-end tests.
