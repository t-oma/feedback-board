import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    children: "Continue",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      Continue
      <ArrowRight aria-hidden="true" className="size-4" />
    </Button>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true,
  },
};

export const Pending: Story = {
  args: {
    children: "Submitting…",
    disabled: true,
    showSpinner: true,
  },
};
