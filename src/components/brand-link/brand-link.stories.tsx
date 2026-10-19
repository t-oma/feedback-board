import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { BrandLink } from "@/components/brand-link";
import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";

const meta = {
  title: "Brand Link",
  component: BrandLink,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BrandLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Feedback Board" });

    await expect(link).toHaveAttribute("href", "/");

    await tabTo(link);
    await expectFocusRing(link, "outside");
  },
};
