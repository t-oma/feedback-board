import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { EmptyState, EmptyStateSkeleton } from "@/components/empty-state";
import { Link } from "@/components/link";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

const meta = {
  title: "Empty State",
  component: EmptyState,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithEyebrow: Story = {
  args: {
    eyebrow: "404",
    title: "This page doesn't exist",
    description:
      "The link may be wrong, or the board may have moved to a new address.",
    headingLevel: 1,
    children: (
      <Link variant="secondary" href="/">
        Go to the landing page
      </Link>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: "This page doesn't exist",
      }),
    ).toBeVisible();
    await expect(canvas.getByText("404")).toBeVisible();
  },
};

export const WithoutEyebrow: Story = {
  args: {
    title: "No feedback yet",
    description: "Be the first to say what Orbit CLI should do next.",
    headingLevel: 2,
    children: (
      <Link variant="primary" href="/">
        Add feedback
      </Link>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "No feedback yet" }),
    ).toBeVisible();
  },
};

export const Skeleton: Story = {
  args: {
    title: "No feedback yet",
    description: "Be the first to say what Orbit CLI should do next.",
    headingLevel: 2,
  },
  render: (args) => (
    <SkeletonGeometry
      content={<EmptyState {...args} />}
      skeleton={
        <EmptyStateSkeleton title={args.title} description={args.description} />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
};
