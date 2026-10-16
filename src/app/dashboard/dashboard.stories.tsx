import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { PageMain } from "@/components/page-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import { DashboardHeader } from "./_ui/dashboard-header";
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
    viewport: {
      options: {
        wide: {
          name: "Wide screen",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
    },
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

// What the layout and the page render for an owner.
const ownerPage = {
  render: () => (
    <>
      <DashboardHeader />
      <PageMain>
        <OwnerOverview {...sampleOwnerBoard} origin={origin} />
      </PageMain>
    </>
  ),
  play: async ({ canvas }) => {
    const brand = canvas
      .getByRole("link", { name: "Feedback Board" })
      .getBoundingClientRect();
    const heading = canvas
      .getByRole("heading", { level: 1, name: sampleOwnerBoard.productName })
      .getBoundingClientRect();

    // The header and the page share the grid, so their edges meet.
    await expect(heading.left).toBe(brand.left);
    await expect(heading.left).toBe(
      Math.max(
        document.documentElement.clientWidth >= 640 ? 40 : 20,
        (document.documentElement.clientWidth - 1200) / 2,
      ),
    );
  },
} satisfies Story;

export const OwnerOnPhone: Story = {
  ...ownerPage,
  globals: { viewport: { value: "mobile1" } },
};

export const OwnerOnTablet: Story = {
  ...ownerPage,
  globals: { viewport: { value: "tablet" } },
};

export const OwnerOnWideScreen: Story = {
  ...ownerPage,
  globals: { viewport: { value: "wide" } },
};

// What `loading.tsx` renders. It reads the origin from the server's
// environment, which a story has no access to.
export const Loading: Story = {
  render: () => (
    <PageMain>
      <OwnerOverviewSkeleton origin={origin} />
    </PageMain>
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
      frame={(children) => <PageMain>{children}</PageMain>}
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
  globals: { viewport: { value: "mobile1" } },
};

export const LoadingLinesUpOnTablet: Story = {
  ...loadingLinesUp,
  globals: { viewport: { value: "tablet" } },
};

export const LoadingLinesUpOnWideScreen: Story = {
  ...loadingLinesUp,
  globals: { viewport: { value: "wide" } },
};
