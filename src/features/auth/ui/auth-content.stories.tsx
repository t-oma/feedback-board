import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthContent } from "./auth-content";
import { AuthContentSkeleton } from "./auth-content-skeleton";
import { AuthMain } from "./auth-main";

const neutralSignInText =
  "Sign in to vote, add feedback, or manage your board.";

const meta = {
  title: "Features/Auth/Content",
  component: AuthContent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    // The flex column stands in for the root layout's `<body>`, which the
    // page's `AuthMain` fills through `flex-1`.
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <AuthMain>
          <Story />
        </AuthMain>
      </div>
    ),
  ],
  args: {
    returnTo: null,
    intent: null,
    mode: "sign-in",
  },
} satisfies Meta<typeof AuthContent>;

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

// An intent explains why signing in is needed. Account creation always shows
// the privacy sentence instead, whatever brought the visitor here.
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

export const WithReturnTo: Story = {
  args: { returnTo: "/dashboard?tab=planned", intent: "feedback" },
  play: async ({ args, canvas, canvasElement }) => {
    const tabQuery = (name: string) => {
      const href = canvas.getByRole("tab", { name }).getAttribute("href");
      return new URL(href ?? "", window.location.origin).searchParams;
    };

    for (const [name, mode] of [
      ["Sign in", null],
      ["Create account", "create-account"],
    ] as const) {
      const query = tabQuery(name);

      await expect(query.get("returnTo")).toBe(args.returnTo);
      await expect(query.get("intent")).toBe(args.intent);
      await expect(query.get("mode")).toBe(mode);
    }

    // Both panels stay mounted, so each form posts the target with it.
    const hiddenInputs = canvasElement.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="returnTo"]',
    );

    await expect(Array.from(hiddenInputs, (input) => input.value)).toEqual([
      args.returnTo,
      args.returnTo,
    ]);
  },
};

export const Loading: Story = {
  render: () => <AuthContentSkeleton />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    // `status` is a live region, so it takes no accessible name from its
    // contents -- the contents are what gets announced. The visually hidden
    // line is therefore the announcement, not a label.
    await expect(status).toHaveTextContent("Loading sign-in");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};
