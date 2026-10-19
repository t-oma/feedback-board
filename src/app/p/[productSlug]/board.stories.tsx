import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { contentEdge } from "@/components/layout-grid.testing";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import { Board, BoardSkeleton, sampleBoard } from "./_ui/board";

const meta = {
  title: "Board/Page",
  component: Board,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    productName: "Orbit CLI",
    description:
      "Orbit CLI is a deploy tool for small teams.\n\nTell us what is missing.",
  },
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

// The header and the page share the grid, so the board's name and its heading
// start at the same edge. Below `sm` the intro's surface runs to the edges of
// the screen while its text keeps to the content area.
const linesUpWithHeader = {
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const name = canvas.getByText("Orbit CLI", { selector: "span" });
    const heading = canvas.getByRole("heading", { level: 1 });
    const band = heading.parentElement?.parentElement;

    await expect(heading.getBoundingClientRect().left).toBe(
      name.getBoundingClientRect().left,
    );
    await expect(heading.getBoundingClientRect().left).toBe(contentEdge());
    await expect(band?.getBoundingClientRect().width).toBe(page);
  },
} satisfies Story;

export const LinesUpOnPhone: Story = {
  ...linesUpWithHeader,
  globals: { viewport: { value: "mobile1" } },
};

export const LinesUpOnTablet: Story = {
  ...linesUpWithHeader,
  globals: { viewport: { value: "tablet" } },
};

export const LinesUpOnWideScreen: Story = {
  ...linesUpWithHeader,
  globals: { viewport: { value: "wide" } },
};

export const WithDescription: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("banner")).toHaveTextContent(
      "Orbit CLIfeedback",
    );
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: "What should we build next?",
      }),
    ).toBeVisible();

    // The blank line the owner typed stays between the two sentences.
    const description = canvas.getByText(/^Orbit CLI is a deploy tool/);
    const lineHeight = parseFloat(getComputedStyle(description).lineHeight);
    await expect(description.getBoundingClientRect().height).toBeGreaterThan(
      2 * lineHeight,
    );

    await expect(
      canvas.getByRole("heading", { level: 2, name: "No feedback yet" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("Be the first to say what Orbit CLI should do next."),
    ).toBeVisible();
  },
};

export const WithoutDescription: Story = {
  args: { description: "" },
  play: async ({ canvas }) => {
    const intro = canvas.getByRole("heading", { level: 1 }).parentElement;

    await expect(intro?.children).toHaveLength(1);
  },
};

// A name as long as one may be, with no space to break it, stays on the bar's
// one line. Neither it nor a long link in the description makes the page
// scroll sideways.
export const LongWordsOnPhone: Story = {
  args: {
    productName: "A".repeat(80),
    description: `Read the docs first: https://example.com/${"docs/".repeat(20)}`,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvas }) => {
    const name = canvas.getByText("A".repeat(80), { selector: "span" });

    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(canvas.getByText("feedback")).toBeVisible();
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

export const Loading: Story = {
  render: () => <BoardSkeleton />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading the board");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};

// The board the loading state assumes, above the loading state. Two `main`
// landmarks on one page fail axe, so the a11y test is off here; `Loading`
// checks the loading state on its own.
const loadingLinesUp = {
  args: sampleBoard,
  parameters: {
    a11y: { test: "off" },
  },
  render: (args) => (
    <SkeletonGeometry
      content={<Board {...args} />}
      skeleton={<BoardSkeleton />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
} satisfies Story;

export const LoadingLinesUpOnPhone: Story = {
  ...loadingLinesUp,
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const LoadingLinesUpOnTablet: Story = {
  ...loadingLinesUp,
  globals: {
    viewport: { value: "tablet" },
  },
};
