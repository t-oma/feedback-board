import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { expectFocusRing } from "@/components/focus-ring.testing";
import { FormError } from "@/components/form-error";

const message = "We couldn’t complete your request. Please try again.";

const meta = {
  title: "Components/Form Error",
  component: FormError,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMessage: Story = {
  args: { message },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(message);
  },
};

// Renders nothing, on purpose: an error that belongs only to fields carries
// no message, because the fields show it.
export const WithoutMessage: Story = {
  args: { message: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

// A form moves focus here from script. Tab never stops here.
export const FocusedByTheForm: Story = {
  args: { message },
  play: async ({ canvas }) => {
    const banner = canvas.getByRole("alert");

    await userEvent.tab();
    await expect(banner).not.toHaveFocus();

    banner.focus();
    await expectFocusRing(banner, "outside");
  },
};
