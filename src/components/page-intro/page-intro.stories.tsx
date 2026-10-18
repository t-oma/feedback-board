import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { PageIntro, PageIntroSkeleton } from "@/components/page-intro";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

const meta = {
  title: "Page Intro",
  component: PageIntro,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-110">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Create your board",
    description: "Everything here can be changed later in Settings.",
  },
} satisfies Meta<typeof PageIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

function themeColor(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: args.title }),
    ).toBeVisible();
    // The supporting copy colour of the theme, which both designs draw.
    await expect(canvas.getByText(args.description)).toHaveStyle({
      color: themeColor("--color-foreground-muted"),
    });
  },
};

// A one-line description keeps the room of two, as a longer one would take.
export const ReservingTwoLines: Story = {
  args: { reserveTwoLines: true, description: "Sign in to vote." },
  play: async ({ canvas, args }) => {
    const description = canvas.getByText(args.description);
    const lineHeight = parseFloat(getComputedStyle(description).lineHeight);

    await expect(description.getBoundingClientRect().height).toBe(
      2 * lineHeight,
    );
  },
};

const geometry = {
  render: (args) => (
    <SkeletonGeometry
      content={<PageIntro {...args} />}
      skeleton={<PageIntroSkeleton {...args} />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
} satisfies Story;

export const Skeleton: Story = geometry;

export const SkeletonReservingTwoLines: Story = {
  ...geometry,
  args: { reserveTwoLines: true, description: "Sign in to vote." },
};
