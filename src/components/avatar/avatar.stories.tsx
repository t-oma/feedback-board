import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Avatar, AvatarSkeleton } from "@/components/avatar";

const meta = {
  title: "Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "Artem Levchenko",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  play: async ({ canvas }) => {
    const avatar = canvas.getByText("AL");
    const { width, height } = avatar.getBoundingClientRect();

    await expect(avatar).toHaveAttribute("aria-hidden", "true");
    await expect({ width, height }).toEqual({ width: 32, height: 32 });
  },
};

export const OneName: Story = {
  args: { name: "Artem" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("A")).toBeVisible();
  },
};

export const Loading: Story = {
  render: () => <AvatarSkeleton />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("[aria-hidden]");
    const circle = box?.firstElementChild;

    await expect(box?.getBoundingClientRect().width).toBe(48);
    await expect(box?.getBoundingClientRect().height).toBe(48);
    await expect(circle?.getBoundingClientRect().width).toBe(32);
  },
};
