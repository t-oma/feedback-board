import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight } from "lucide-react";
import { expect, fn, userEvent } from "storybook/test";

import { Button } from "@/components/button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Continue",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

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
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Unavailable" });

    await expect(button).toHaveAttribute("disabled");

    await userEvent.tab();
    await expect(button).not.toHaveFocus();
  },
};

export const SecondaryDisabled: Story = {
  args: {
    children: "Cancel",
    variant: "secondary",
    disabled: true,
  },
};

export const Pending: Story = {
  args: {
    children: "Submitting…",
    pending: true,
  },
  play: async ({ args, canvas }) => {
    // Naming the button asserts the label survives: the spinner is added
    // beside the text, not in place of it. The spinner itself is aria-hidden,
    // so it is found through the DOM rather than a role.
    const button = canvas.getByRole("button", { name: "Submitting…" });

    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).not.toHaveAttribute("disabled");
    await expect(button.querySelector("svg")).toBeInTheDocument();

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
