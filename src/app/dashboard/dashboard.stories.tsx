import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import {
  OwnerOverview,
  OwnerOverviewSkeleton,
  sampleOwnerBoard,
} from "./_ui/owner-overview";

const origin = "https://feedbackboard.app";

const meta = {
  title: "Dashboard/Page",
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// What `loading.tsx` renders. It reads the origin from the server's
// environment, which a story has no access to.
export const Loading: Story = {
  render: () => (
    <NarrowMain>
      <OwnerOverviewSkeleton origin={origin} />
    </NarrowMain>
  ),
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading your dashboard");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};

// The owner's board the loading state assumes, above the loading state, each
// in the page's `main`. Two `main` landmarks on one page fail axe, so the
// a11y test is off here; `Loading` checks the loading state on its own.
const loadingLinesUp = {
  parameters: {
    a11y: { test: "off" },
  },
  render: () => (
    <SkeletonGeometry
      frame={(children) => <NarrowMain>{children}</NarrowMain>}
      content={<OwnerOverview {...sampleOwnerBoard} origin={origin} />}
      skeleton={<OwnerOverviewSkeleton origin={origin} />}
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

export const LoadingLinesUpInCard: Story = {
  ...loadingLinesUp,
  globals: {
    viewport: { value: "tablet" },
  },
};
