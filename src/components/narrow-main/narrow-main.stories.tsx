import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";

const meta = {
  title: "Narrow Main",
  component: NarrowMain,
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
  args: {
    children: (
      <>
        <h1 className="font-serif text-2xl font-semibold">Create your board</h1>
        <p className="text-foreground-muted">
          Everything here can be changed later in Settings.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof NarrowMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvas }) => {
    const { left, width } = canvas.getByRole("main").getBoundingClientRect();

    await expect(left).toBe(0);
    await expect(width).toBe(document.documentElement.clientWidth);
  },
};

// The narrowest width with the card. A wider card, with its padding and
// border, would stick out of the viewport here and scroll the page sideways.
export const AtSmallestCardWidth: Story = {
  parameters: {
    viewport: {
      options: {
        sm: {
          name: "Tailwind sm",
          styles: { width: "640px", height: "800px" },
          type: "tablet",
        },
      },
    },
  },
  globals: {
    viewport: { value: "sm" },
  },
  play: async ({ canvas }) => {
    const viewportWidth = document.documentElement.clientWidth;
    const { left, right, width } = canvas
      .getByRole("main")
      .getBoundingClientRect();

    await expect(viewportWidth).toBe(640);
    await expect(
      canvas.getByRole("heading").getBoundingClientRect().width,
    ).toBe(440);
    await expect(left).toBe((viewportWidth - width) / 2);
    await expect(left).toBeGreaterThan(0);
    await expect(right).toBeLessThan(viewportWidth);
  },
};
