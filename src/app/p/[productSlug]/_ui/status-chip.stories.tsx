import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FEEDBACK_STATUSES } from "@/entities/feedback/contracts";

import { feedbackStatusLabels, StatusChip } from "./status-chip";

const meta = {
  title: "Board/Status Chip",
  component: StatusChip,
  parameters: {
    layout: "padded",
  },
  args: {
    status: "open",
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

// The four statuses differ in the dot's shape, so they stay apart for a
// reader who cannot tell colours apart: no two dots draw the same.
export const EveryStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {FEEDBACK_STATUSES.map((status) => (
        <StatusChip key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const dots = FEEDBACK_STATUSES.map((status) => {
      const chip = canvas.getByText(feedbackStatusLabels[status]);
      const dot = chip.querySelector('[aria-hidden="true"]');
      if (dot === null) throw new Error(`No dot for ${status}`);

      const style = getComputedStyle(dot);
      return [
        style.backgroundImage,
        style.backgroundColor,
        style.borderTopWidth,
      ].join(" ");
    });

    await expect(new Set(dots).size).toBe(FEEDBACK_STATUSES.length);
  },
};

// A status is read as its label, whatever the dot looks like.
export const ReadAsItsLabel: Story = {
  args: { status: "in_progress" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("In Progress")).toBeVisible();
  },
};
