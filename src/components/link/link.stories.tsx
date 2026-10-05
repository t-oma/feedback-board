import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";
import { Link } from "@/components/link";

const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    layout: "centered",
  },
  args: {
    href: "/",
    children: "Go to the landing page",
    variant: "primary",
  },
  // Looking like a button must not make it one: a screen reader announces
  // the role, and this navigates.
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Go to the landing page" });

    await expect(link).toHaveAttribute("href", "/");
    await expect(link).toHaveStyle({ cursor: "pointer" });
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();

    await tabTo(link);
    await expectFocusRing(link, "outside");
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};
