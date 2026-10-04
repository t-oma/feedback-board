import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthIntro } from "./auth-intro";
import { AuthMain } from "./auth-main";

const neutralSignInText =
  "Sign in to vote, add feedback, or manage your board.";

const meta = {
  title: "Features/Auth/Intro",
  component: AuthIntro,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <AuthMain>
          <Story />
        </AuthMain>
      </div>
    ),
  ],
  args: {
    intent: null,
    mode: "sign-in",
  },
} satisfies Meta<typeof AuthIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Sign in" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(neutralSignInText)).toBeInTheDocument();
  },
};

export const IntentVote: Story = {
  args: { intent: "vote" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sign in to vote.")).toBeInTheDocument();
  },
};

export const IntentFeedback: Story = {
  args: { intent: "feedback" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Sign in to add feedback."),
    ).toBeInTheDocument();
  },
};

export const IntentBoard: Story = {
  args: { intent: "board" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Sign in to create your board."),
    ).toBeInTheDocument();
  },
};

export const CreateAccount: Story = {
  args: { mode: "create-account", intent: "vote" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Create an account" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "Your name is shown next to anything you post. Nothing else is public.",
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText("Sign in to vote."),
    ).not.toBeInTheDocument();
  },
};
