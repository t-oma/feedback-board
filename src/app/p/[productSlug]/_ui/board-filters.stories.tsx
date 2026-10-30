import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { contentEdge } from "@/components/layout-grid.testing";
import { PageMain } from "@/components/page-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import {
  BoardFilters,
  BoardFiltersSkeleton,
  sampleCounts,
} from "./board-filters";

const meta = {
  title: "Board/Filters",
  component: BoardFilters,
  parameters: {
    layout: "fullscreen",
  },
  // A band of the layout grid, so it renders on the page's grid. The loading
  // stories frame each of their halves instead.
  render: (args) => (
    <PageMain>
      <BoardFilters {...args} />
    </PageMain>
  ),
  args: {
    productSlug: "orbit-cli",
    view: { status: "all", sort: "new" },
    counts: sampleCounts,
  },
} satisfies Meta<typeof BoardFilters>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = StoryContext["canvas"];

function statuses(canvas: Canvas) {
  return within(canvas.getByRole("list", { name: "Status" }));
}

function sorts(canvas: Canvas) {
  return within(canvas.getByRole("list", { name: "Sort" }));
}

function dotOf(link: HTMLElement | undefined) {
  const dot = link?.querySelector('[aria-hidden="true"]');
  if (!(dot instanceof HTMLElement)) throw new Error("The link has no dot.");
  return dot;
}

// Each filter shows its count, and the view the page shows is the current
// link in both groups.
export const DefaultView: Story = {
  play: async ({ canvas }) => {
    await expect(
      statuses(canvas).getByRole("link", { name: "All 24" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      statuses(canvas).getByRole("link", { name: "Planned 5" }),
    ).not.toHaveAttribute("aria-current");
    await expect(
      sorts(canvas).getByRole("link", { name: "Newest" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

// A status link keeps the sort, and a sort link keeps the status; the default
// of either stays out of the address.
export const KeepsTheOtherHalf: Story = {
  args: { view: { status: "planned", sort: "top" } },
  play: async ({ canvas }) => {
    await expect(
      statuses(canvas).getByRole("link", { name: "Planned 5" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      statuses(canvas).getByRole("link", { name: "All 24" }),
    ).toHaveAttribute("href", "/p/orbit-cli?sort=top");
    await expect(
      statuses(canvas).getByRole("link", { name: "In Progress 3" }),
    ).toHaveAttribute("href", "/p/orbit-cli?status=in-progress&sort=top");
    await expect(
      sorts(canvas).getByRole("link", { name: "Newest" }),
    ).toHaveAttribute("href", "/p/orbit-cli?status=planned");
  },
};

// The statuses scroll sideways from the content's edge, without their dots,
// and every target is 44 pixels tall. An overlay scrollbar over the bottom of
// the band stays clear of the statuses above it and of the sort below.
export const OnPhone: Story = {
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const list = canvas.getByRole("list", { name: "Status" });
    const links = within(list).getAllByRole("link");
    const newest = sorts(canvas).getByRole("link", { name: "Newest" });
    // The bottom of the band's padding box, where an overlay scrollbar lies;
    // a classic one takes room of its own below it.
    const bandBottom =
      list.getBoundingClientRect().top + list.clientTop + list.clientHeight;

    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await expect(bandBottom).toBeGreaterThan(
      links[0]?.getBoundingClientRect().bottom ?? Infinity,
    );
    await expect(bandBottom).toBeLessThan(
      canvas.getByRole("list", { name: "Sort" }).getBoundingClientRect().top,
    );
    await expect(links[0]?.getBoundingClientRect().left).toBe(contentEdge());
    for (const link of [...links, newest]) {
      await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        44,
      );
    }
    await expect(dotOf(links[1])).not.toBeVisible();
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

// The filters and the sort share a line, and the statuses show their dots.
export const OnTablet: Story = {
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const links = statuses(canvas).getAllByRole("link");
    const tops = new Set(
      links.map((link) => Math.round(link.getBoundingClientRect().top)),
    );
    const newest = sorts(canvas).getByRole("link", { name: "Newest" });

    await expect(tops.size).toBe(1);
    await expect(
      Math.abs(
        newest.getBoundingClientRect().top -
          (links[0]?.getBoundingClientRect().top ?? 0),
      ),
    ).toBeLessThanOrEqual(1);
    await expect(dotOf(links[1]).getBoundingClientRect().width).toBe(10);
  },
};

// The filters the loading state assumes, above the loading state.
const loadingLinesUp = {
  render: (args) => (
    <SkeletonGeometry
      content={<BoardFilters {...args} />}
      skeleton={<BoardFiltersSkeleton />}
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
