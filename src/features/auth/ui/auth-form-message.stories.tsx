import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import type { ActionError } from "@/shared/action-result";

import { AuthFormMessage } from "./auth-form-message";

const formLevelError = {
  ok: false,
  code: "UNAUTHENTICATED",
  message: "That email and password do not match an account.",
} satisfies ActionError;

const fieldScopedError = {
  ok: false,
  code: "CONFLICT",
  fieldErrors: {
    email: ["An account already uses this email."],
  },
} satisfies ActionError;

const formAndFieldError = {
  ok: false,
  code: "VALIDATION",
  message: "Use a phone number that differs from your email",
  fieldErrors: {
    email: ["Enter a complete email address"],
  },
} satisfies ActionError;

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

// Renders nothing, on purpose. An error that belongs only to a field carries
// no message, because the field shows it.
export const SuppressedWhenFieldScoped: Story = {
  args: { error: fieldScopedError },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

// Field errors do not hide the banner: the message is about the form as a
// whole, and no field would show it.
export const WithFieldErrors: Story = {
  args: { error: formAndFieldError },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      formAndFieldError.message,
    );
  },
};
