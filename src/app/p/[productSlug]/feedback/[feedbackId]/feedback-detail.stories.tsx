import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import { SignInLink } from "@/widgets/viewer/ui/sign-in-link";

import {
  FeedbackDetail,
  FeedbackDetailSkeleton,
  sampleFeedback,
} from "./_ui/feedback-detail";

// What `ViewerControl` renders for a guest, most of a board's visitors.
const guest = <SignInLink />;

const feedback = {
  id: "019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b",
  title: "Watch mode that survives a failed build",
  body: "Right now a syntax error kills the watcher.\n\nOn a large monorepo the restart takes about forty seconds.",
  status: "planned",
  createdAt: new Date("2026-08-14T23:30:00Z"),
  authorName: "Marta K.",
  voteCount: 128,
} as const;

const meta = {
  title: "Feedback/Page",
  component: FeedbackDetail,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    productName: "Orbit CLI",
    productSlug: "orbit-cli",
    feedback,
    url: `https://feedbackboard.app/p/orbit-cli/feedback/${feedback.id}`,
    viewer: guest,
  },
} satisfies Meta<typeof FeedbackDetail>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = StoryContext["canvas"];

function wayBack(canvas: Canvas) {
  return within(canvas.getByRole("banner")).getByRole("link", {
    name: "Back to Orbit CLI",
  });
}

export const OnPhone: Story = {
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const banner = canvas.getByRole("banner");
    const title = canvas.getByRole("heading", {
      level: 1,
      name: feedback.title,
    });
    const status = canvas.getByText("Planned");

    // The way back stands in the bar in place of the product's name, and
    // leads to the board's bare address.
    await expect(wayBack(canvas)).toBeVisible();
    await expect(wayBack(canvas)).toHaveAttribute("href", "/p/orbit-cli");
    await expect(
      within(banner).getByText("Orbit CLI", { selector: "p" }),
    ).not.toBeVisible();

    await expect(status.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      title.getBoundingClientRect().top,
    );
    await expect(
      canvas.getByText("14 Aug 2026", { exact: false }),
    ).toBeVisible();
    await expect(
      canvas.getByText("· 128 votes", { exact: false }),
    ).toBeVisible();
    await expect(
      canvas.getByText("128", { selector: "span" }),
    ).not.toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Copy link" }),
    ).toBeVisible();
  },
};

export const OnTablet: Story = {
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const title = canvas.getByRole("heading", { level: 1 });
    const status = canvas.getByText("Planned");

    await expect(wayBack(canvas)).toBeVisible();
    await expect(
      within(canvas.getByRole("banner")).getByText("Orbit CLI", {
        selector: "p",
      }),
    ).toBeVisible();
    await expect(status.getBoundingClientRect().left).toBeGreaterThan(
      title.getBoundingClientRect().right,
    );
    await expect(canvas.getByText("14 August 2026")).toBeVisible();
    await expect(canvas.getByText("128", { selector: "span" })).toBeVisible();
    await expect(
      canvas.getByText("· 128 votes", { exact: false }),
    ).not.toBeVisible();
  },
};

// The date is the day in UTC, whatever the reader's time zone, and the
// machine is written as a time a browser can read.
export const DateInUtc: Story = {
  play: async ({ canvas }) => {
    const time = canvas.getByText("14 August 2026").closest("time");

    await expect(time).toHaveAttribute("datetime", "2026-08-14T23:30:00.000Z");
  },
};

// The blank line the author typed stays between the two sentences.
export const KeepsLineBreaks: Story = {
  play: async ({ canvas }) => {
    const body = canvas.getByText(/^Right now a syntax error/);
    const lineHeight = parseFloat(getComputedStyle(body).lineHeight);

    await expect(body.getBoundingClientRect().height).toBeGreaterThan(
      2 * lineHeight,
    );
  },
};

// The vote block is as tall as what it holds, whatever the length of the
// column beside it: its last line ends where its padding begins.
export const VoteBlockKeepsItsHeight: Story = {
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    const label = canvas.getByText("votes", { selector: "span" });
    const block = label.parentElement;
    if (block === null) throw new Error("The votes label has no block");

    const { paddingBottom, borderBottomWidth } = getComputedStyle(block);
    await expect(
      block.getBoundingClientRect().bottom -
        label.getBoundingClientRect().bottom,
    ).toBeCloseTo(parseFloat(paddingBottom) + parseFloat(borderBottomWidth), 0);
  },
};

export const OneVote: Story = {
  args: { feedback: { ...feedback, voteCount: 1 } },
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("vote", { selector: "span" })).toBeVisible();
  },
};

// A title and a name as long as they may be, with no space to break them,
// do not make the page scroll sideways.
export const LongWordsOnPhone: Story = {
  args: {
    feedback: {
      ...feedback,
      title: "W".repeat(120),
      authorName: "N".repeat(80),
      body: `See https://example.com/${"docs/".repeat(40)}`,
    },
  },
  globals: { viewport: { value: "mobile1" } },
  play: async () => {
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

export const Loading: Story = {
  render: () => <FeedbackDetailSkeleton />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading the feedback");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};

// The item the loading state assumes, above the loading state. Two `main`
// landmarks on one page fail axe, so the a11y test is off here; `Loading`
// checks the loading state on its own.
const loadingLinesUp = {
  args: {
    productName: sampleFeedback.productName,
    feedback: { ...sampleFeedback.feedback, id: feedback.id },
  },
  parameters: {
    a11y: { test: "off" },
  },
  render: (args) => (
    <SkeletonGeometry
      content={<FeedbackDetail {...args} />}
      skeleton={<FeedbackDetailSkeleton />}
    />
  ),
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
