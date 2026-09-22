import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import type { ActionError } from "@/shared/action-result";

import { AuthFormMessage } from "./auth-form-message";

const formLevelError: ActionError = {
  ok: false,
  code: "UNAUTHENTICATED",
  message: "That email and password do not match an account.",
};

const fieldScopedError: ActionError = {
  ok: false,
  code: "CONFLICT",
  message: "An account already uses this email.",
  fieldErrors: {
    email: ["An account already uses this email."],
  },
};

const meta = {
  title: "Features/Auth/Form Message",
  component: AuthFormMessage,
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
} satisfies Meta<typeof AuthFormMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormLevel: Story = {
  args: { error: formLevelError },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      formLevelError.message,
    );
  },
};

// Renders nothing, on purpose. An error that already belongs to a field is
// shown beside that field, and repeating it at form level would say it twice.
export const SuppressedWhenFieldScoped: Story = {
  args: { error: fieldScopedError },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
