import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { contentEdge } from "@/components/layout-grid.testing";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import { SignInLink } from "@/widgets/viewer/ui/sign-in-link";

import { Board, BoardSkeleton, sampleBoard } from "./_ui/board";
import { BoardEmpty, BoardNoMatches } from "./_ui/board-empty";
import { BoardFeedbackBoundary } from "./_ui/board-feedback-boundary";
import { BoardFilters, sampleCounts } from "./_ui/board-filters";
import { FeedbackList, sampleFeedbackList } from "./_ui/feedback-list";

// What `ViewerControl` renders for a guest, most of a board's visitors.
const guest = <SignInLink />;

// What the page's feedback region renders for a board with feedback, in the
// default view: the filters and the list.
const withFeedback = (
  <>
    <BoardFilters
      productSlug="orbit-cli"
      view={{ status: "all", sort: "new" }}
      counts={sampleCounts}
    />
    <FeedbackList
      productSlug="orbit-cli"
      feedback={sampleFeedbackList.map((item, index) => ({
        ...item,
        id: `019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7${String(index)}`,
      }))}
    />
  </>
);

function FailingRead(): never {
  throw new Error("The feedback could not be read.");
}

const meta = {
  title: "Board/Page",
  component: Board,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    productName: "Orbit CLI",
    description:
      "Orbit CLI is a deploy tool for small teams.\n\nTell us what is missing.",
    viewer: guest,
    feedback: <BoardEmpty productName="Orbit CLI" />,
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
    const name = canvas.getByText("Orbit CLI", { selector: "p" });
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
    const header = within(canvas.getByRole("banner"));
    await expect(
      header.getByText("Orbit CLI", { selector: "p" }),
    ).toBeVisible();
    await expect(canvas.getByRole("banner")).not.toHaveTextContent("feedback");
    await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
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
    const name = canvas.getByText("A".repeat(80), { selector: "p" });

    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

// The filters and the rows follow the intro, and the empty state is gone.
export const WithFeedback: Story = {
  args: { feedback: withFeedback },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Status" })).toBeVisible();
    await expect(
      canvas.getByRole("link", {
        name: "Watch mode that survives a failed build",
      }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("heading", { name: "No feedback yet" }),
    ).toBeNull();
  },
};

// A status without items keeps the filters, says how many items the board
// holds, and leads back to the bare address.
export const NoMatches: Story = {
  args: {
    feedback: (
      <>
        <BoardFilters
          productSlug="orbit-cli"
          view={{ status: "in-progress", sort: "new" }}
          counts={{ ...sampleCounts, "in-progress": 0 }}
        />
        <BoardNoMatches productSlug="orbit-cli" total={24} />
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 2,
        name: "Nothing matches this filter",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByText("There are 24 items on the board under other statuses."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Reset filters" }),
    ).toHaveAttribute("href", "/p/orbit-cli");
  },
};

// A failed read replaces the feedback alone, under the board's intro.
export const FeedbackFailed: Story = {
  args: {
    feedback: (
      <BoardFeedbackBoundary>
        <FailingRead />
      </BoardFeedbackBoundary>
    ),
  },
  play: async ({ canvas }) => {
    const alert = await canvas.findByRole("alert");

    await expect(alert).toHaveTextContent(
      "We couldn’t load the feedback. Please try again.",
    );
    await expect(
      within(alert).getByRole("button", { name: "Retry" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: "What should we build next?",
      }),
    ).toBeVisible();
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
  args: { ...sampleBoard, viewer: guest, feedback: withFeedback },
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
