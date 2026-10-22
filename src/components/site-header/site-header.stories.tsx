import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BrandLink } from "@/components/brand-link";
import { Button } from "@/components/button";
import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";
import { contentEdge } from "@/components/layout-grid.testing";
import {
  BackLink,
  BackLinkSkeleton,
  SiteHeader,
} from "@/components/site-header";

const meta = {
  title: "Site Header",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    children: <BrandLink />,
    end: <Button variant="secondary">Sign in</Button>,
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = StoryContext["canvas"];

const backToBoard = <BackLink href="/p/orbit-cli" label="Back to board" />;

function banner(canvas: Canvas) {
  return within(canvas.getByRole("banner"));
}

function rect(element: Element) {
  return element.getBoundingClientRect();
}

// Lines of text an element's first text node wraps onto.
function lineCount(element: Element) {
  const text = document
    .createTreeWalker(element, NodeFilter.SHOW_TEXT)
    .nextNode();
  if (text === null) throw new Error("The element holds no text.");

  const range = document.createRange();
  range.selectNodeContents(text);
  return new Set(
    Array.from(range.getClientRects(), (line) => Math.round(line.top)),
  ).size;
}

// The identity starts and the end finishes at the content's edges, and the
// bar is as tall at every width.
const linesUpWithGrid = {
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const header = banner(canvas);

    await expect(
      rect(header.getByRole("link", { name: "Feedback Board" })).left,
    ).toBe(contentEdge());
    await expect(
      rect(header.getByRole("button", { name: "Sign in" })).right,
    ).toBe(page - contentEdge());
    await expect(rect(canvas.getByRole("banner")).height).toBe(60);
  },
} satisfies Story;

export const LinesUpOnPhone: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "mobile1" } },
};

export const LinesUpOnTablet: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "tablet" } },
};

export const LinesUpOnWideScreen: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "wide" } },
};

// A name too long for a phone gives way, and the end keeps its size rather
// than wrapping its label.
export const LongNameOnPhone: Story = {
  args: {
    children: (
      <p className="truncate font-serif font-semibold">
        A product with a name far too long for the bar of a phone
      </p>
    ),
  },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const header = banner(canvas);
    const name = header.getByText(/^A product with a name/);
    const end = header.getByRole("button", { name: "Sign in" });

    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(lineCount(end)).toBe(1);
    await expect(rect(end).left).toBeGreaterThanOrEqual(rect(name).right);
    await expect(rect(end).right).toBe(
      document.documentElement.clientWidth - contentEdge(),
    );
  },
};

// Below `sm` the way back stands in the bar in place of the identity, with
// the end beside it.
export const WithBackOnPhone: Story = {
  args: { back: backToBoard },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const header = banner(canvas);
    const link = header.getByRole("link", { name: "Back to board" });
    const arrow = link.querySelector("svg");
    const end = header.getByRole("button", { name: "Sign in" });

    await expect(link).toHaveAttribute("href", "/p/orbit-cli");
    await expect(
      header.queryByRole("link", { name: "Feedback Board" }),
    ).not.toBeInTheDocument();
    await expect(arrow && rect(arrow).left).toBe(contentEdge());
    await expect(rect(link).bottom).toBeLessThanOrEqual(60);
    await expect(rect(end).bottom).toBeLessThanOrEqual(60);
    await expect(rect(canvas.getByRole("banner")).height).toBe(60);
  },
};

// From `sm` up the bar keeps the identity, and the way back is the first line
// under it.
export const WithBackOnTablet: Story = {
  args: { back: backToBoard },
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const header = banner(canvas);
    const brand = header.getByRole("link", { name: "Feedback Board" });
    const link = header.getByRole("link", { name: "Back to board" });
    const arrow = link.querySelector("svg");

    await expect(rect(brand).left).toBe(contentEdge());
    await expect(arrow && rect(arrow).left).toBe(contentEdge());
    await expect(rect(link).top).toBeGreaterThanOrEqual(60);
  },
};

// On a phone the bar is the top of the page, so the ring stays inside the
// link.
export const BackFocusOnPhone: Story = {
  args: { back: backToBoard },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const link = banner(canvas).getByRole("link", { name: "Back to board" });

    await tabTo(link);
    await expectFocusRing(link, "inside");
  },
};

export const BackFocusOnTablet: Story = {
  ...BackFocusOnPhone,
  globals: { viewport: { value: "tablet" } },
};

// The way back is not known yet, so nothing in its place can be followed.
export const BackLoading: Story = {
  args: { back: <BackLinkSkeleton /> },
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const header = banner(canvas);

    await expect(
      header.getAllByRole("link").map((link) => link.textContent),
    ).toEqual(["Feedback Board"]);
  },
};
