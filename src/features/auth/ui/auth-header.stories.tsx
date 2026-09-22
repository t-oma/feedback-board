import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthHeader } from "./auth-header";

const meta = {
  title: "Features/Auth/Header",
  component: AuthHeader,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AuthHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// No args, so this exercises the default `goBackText`. The arrow is decorative;
// the link's name comes from its `aria-label`, which is what a screen reader
// announces and what this asserts.
export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "Go back to Feedback Board",
    });

    await expect(link).toHaveAttribute("href", "/");
  },
};

export const CustomDestination: Story = {
  args: { goBackText: "Orbit CLI" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Go back to Orbit CLI" }),
    ).toBeVisible();
  },
};
