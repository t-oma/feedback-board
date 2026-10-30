import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { tabTo } from "@/components/focus-ring.testing";
import { contentEdge } from "@/components/layout-grid.testing";
import { PageMain } from "@/components/page-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import { themeColor } from "@/components/theme.testing";

import {
  FeedbackList,
  FeedbackListSkeleton,
  sampleFeedbackList,
} from "./feedback-list";

const feedback = [
  {
    id: "019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b",
    title: "Watch mode that survives a failed build",
    body: "Right now a syntax error kills the watcher and I have to restart the whole thing. It should log the error and keep watching the file tree. On a large monorepo the restart takes about forty seconds, which makes watch mode slower than running the build by hand.",
    status: "open",
    createdAt: new Date("2026-08-14T09:00:00Z"),
    authorName: "Marta K.",
    voteCount: 128,
  },
  {
    id: "019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7c",
    title: "Shell completions for zsh and fish",
    body: "Completions for commands and flags.",
    status: "completed",
    createdAt: new Date("2026-07-21T09:00:00Z"),
    authorName: "Olena V.",
    voteCount: 1,
  },
] as const;

const meta = {
  title: "Feedback/List",
  component: FeedbackList,
  parameters: {
    layout: "fullscreen",
  },
  // A band of the layout grid below `sm`, so it renders on the page's grid.
  // The loading stories frame each of their halves instead.
  render: (args) => (
    <PageMain>
      <FeedbackList {...args} />
    </PageMain>
  ),
  args: {
    productSlug: "orbit-cli",
    feedback: [...feedback],
  },
} satisfies Meta<typeof FeedbackList>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = StoryContext["canvas"];

function firstRow(canvas: Canvas) {
  const link = canvas.getByRole("link", { name: feedback[0].title });
  const row = link.closest("li");
  if (row === null) throw new Error("The link is not in a row.");
  return { link, row };
}

// The rows run to the edges of the screen, and their text keeps to the
// content area. The body is left out and the status sits under the title.
export const OnPhone: Story = {
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const { link, row } = firstRow(canvas);
    const title = link.getBoundingClientRect();
    const status = canvas.getAllByText("Open")[0];

    await expect(row.getBoundingClientRect().width).toBe(
      document.documentElement.clientWidth,
    );
    await expect(
      canvas.getByText(/^Right now a syntax error/),
    ).not.toBeVisible();
    await expect(status?.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      title.bottom,
    );
    await expect(
      canvas.getByText(/^128/).closest("p")?.getBoundingClientRect().left,
    ).toBe(contentEdge());
  },
};

// A card in the content area, with the body cut to two lines and the status
// at the end of the row.
export const OnTablet: Story = {
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const { link, row } = firstRow(canvas);
    const list = row.parentElement;
    const body = canvas.getByText(/^Right now a syntax error/);
    const lineHeight = parseFloat(getComputedStyle(body).lineHeight);
    const status = canvas
      .getAllByText("Open")
      .find((element) => element.checkVisibility());

    await expect(list?.getBoundingClientRect().left).toBe(contentEdge());
    await expect(body).toBeVisible();
    await expect(body.getBoundingClientRect().height).toBeLessThanOrEqual(
      2 * lineHeight + 1,
    );
    await expect(status?.getBoundingClientRect().left).toBeGreaterThan(
      link.getBoundingClientRect().right,
    );
  },
};

// A click anywhere on a row, its vote count included, opens the item.
export const RowIsTheLink: Story = {
  play: async ({ canvas }) => {
    const { link } = firstRow(canvas);
    const count = canvas.getByText(/^128/).getBoundingClientRect();

    await expect(
      document.elementFromPoint(
        count.left + count.width / 2,
        count.top + count.height / 2,
      ),
    ).toBe(link);
    await expect(link).toHaveAttribute(
      "href",
      `/p/orbit-cli/feedback/${feedback[0].id}`,
    );
  },
};

// The ring goes around the whole row the link is stretched over.
export const FocusRingAroundTheRow: Story = {
  play: async ({ canvas }) => {
    const { link, row } = firstRow(canvas);

    await tabTo(link);

    // A computed style gives a colour as `rgb()`, so the theme's value is
    // computed the same way before the two are compared.
    const accent = document.createElement("span");
    accent.style.color = themeColor("--color-accent");
    document.body.append(accent);
    const accentColor = getComputedStyle(accent).color;
    accent.remove();

    const ring = getComputedStyle(link, "::after");
    await expect(ring.outlineStyle).toBe("solid");
    await expect(ring.outlineWidth).toBe("2px");
    await expect(ring.outlineColor).toBe(accentColor);
    await expect(ring.outlineOffset).toBe("-2px");
    await expect(parseFloat(ring.width)).toBe(
      row.getBoundingClientRect().width,
    );
  },
};

// The vote block is as tall as what it holds, however tall the column beside
// it: its count ends where its padding begins.
export const VoteBlockKeepsItsHeight: Story = {
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const count = canvas.getByText(/^128$/);
    const block = count.parentElement;
    if (block === null) throw new Error("The count has no block.");

    const { paddingBottom, borderBottomWidth } = getComputedStyle(block);
    await expect(
      block.getBoundingClientRect().bottom -
        count.getBoundingClientRect().bottom,
    ).toBeCloseTo(parseFloat(paddingBottom) + parseFloat(borderBottomWidth), 0);
  },
};

// How far each line of an element's text reaches, from its text alone: a
// range over the element would also give the box of an inline block in it.
function lineWidths(element: Element) {
  const rights = new Map<number, number>();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      const top = Math.round(rect.top);
      rights.set(top, Math.max(rights.get(top) ?? 0, rect.right));
    }
  }
  const left = element.getBoundingClientRect().left;
  return Array.from(rights.values(), (right) => Math.round(right - left));
}

// A title breaks its lines as the same heading without the link does, so
// paragraphs' and headings' `pretty` wrapping reaches it: the link's
// stretched `::after` would stop it.
export const TitleWrapsPretty: Story = {
  args: {
    feedback: [
      {
        ...feedback[0],
        title: "Rollback to a named release, not just the previous one",
        // The widest chip leaves the title the room in which a line would
        // end on "one" alone without `pretty`.
        status: "in_progress",
      },
    ],
  },
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { level: 2 });
    const plain = document.createElement("h2");
    plain.className = heading.className;
    plain.textContent = heading.textContent;
    heading.after(plain);

    try {
      await expect(lineWidths(heading)).toEqual(lineWidths(plain));
    } finally {
      plain.remove();
    }
  },
};

// The word after the count is for screen readers alone, so the count reads
// as "128 votes" and the design's bare number stays on screen.
export const CountsReadAsVotes: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/^128$/)).toHaveTextContent(/^128 votes$/);
    await expect(canvas.getByText(/^1$/)).toHaveTextContent(/^1 vote$/);
  },
};

// A title and a name as long as they may be, with no space to break them, do
// not make the page scroll sideways.
export const LongWordsOnPhone: Story = {
  args: {
    feedback: [
      {
        ...feedback[0],
        title: "W".repeat(120),
        authorName: "N".repeat(80),
      },
    ],
  },
  globals: { viewport: { value: "mobile1" } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

// The items the loading state assumes, above the loading state.
const loadingLinesUp = {
  args: {
    feedback: sampleFeedbackList.map((item, index) => ({
      ...item,
      id: `019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7${String(index)}`,
    })),
  },
  render: (args) => (
    <SkeletonGeometry
      content={<FeedbackList {...args} />}
      skeleton={<FeedbackListSkeleton />}
      frame={(children) => <PageMain>{children}</PageMain>}
    />
  ),
  parameters: {
    a11y: { test: "off" },
  },
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
} satisfies Story;

export const LoadingLinesUpOnPhone: Story = {
  ...loadingLinesUp,
  globals: { viewport: { value: "mobile1" } },
};

export const LoadingLinesUpOnTablet: Story = {
  ...loadingLinesUp,
  globals: { viewport: { value: "tablet" } },
};
