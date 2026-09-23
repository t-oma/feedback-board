import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthContentSkeleton } from "./auth-content-skeleton";

const meta = {
  title: "Features/Auth/Content Skeleton",
  component: AuthContentSkeleton,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    // The same wrapper `/sign-in` renders it into, so what the story shows is
    // the width, padding and background the skeleton actually appears against.
    (Story) => (
      <main className="flex min-h-svh flex-col gap-y-5 bg-surface px-5 py-6">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof AuthContentSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    // `status` is a live region, so it takes no accessible name from its
    // contents -- the contents are what gets announced. The visually hidden
    // line is therefore the announcement, not a label.
    await expect(status).toHaveTextContent("Loading sign-in");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};
