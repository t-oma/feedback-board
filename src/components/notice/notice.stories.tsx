import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { expectFocusRing } from "@/components/focus-ring.testing";

import { Notice } from "./notice";

const meta = {
  title: "Notice",
  component: Notice,
  args: {
    message: { text: "Your board is live", variant: "success" },
    onDismiss: fn(),
  },
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Your board is live",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};

export const Info: Story = {
  args: {
    message: { text: "You already have a board.", variant: "info" },
  },
};

// The page moves focus to the notice from script. Tab stops only at the
// dismiss button.
export const Focus: Story = {
  play: async ({ canvas }) => {
    const notice = canvas.getByRole("status");
    const dismiss = canvas.getByRole("button", { name: "Dismiss" });

    await userEvent.tab();
    await expectFocusRing(dismiss, "inside");

    notice.focus();
    await expectFocusRing(notice, "outside");
  },
};
