import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  buildSignInHref,
  getAuthBackTarget,
  parseReturnTo,
  type SignInQuery,
} from "../navigation";
import { AuthContentSkeleton } from "./auth-content-skeleton";
import { AuthHeader, AuthHeaderSkeleton } from "./auth-header";
import { AuthIntro } from "./auth-intro";
import { AuthMain } from "./auth-main";
import { AuthTabs } from "./auth-tabs";

const meta = {
  title: "Features/Auth/SignIn",
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
    returnTo: null,
    intent: null,
    mode: "sign-in",
  },
  render: ({ returnTo, intent, mode }) => (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <AuthMain>
        <AuthIntro mode={mode} intent={intent} />
        <AuthTabs
          mode={mode}
          returnTo={returnTo}
          signInHref={buildSignInHref({ returnTo, intent })}
          createAccountHref={buildSignInHref({
            returnTo,
            intent,
            mode: "create-account",
          })}
        />
      </AuthMain>
    </>
  ),
} satisfies Meta<SignInQuery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    returnTo: parseReturnTo(
      "/p/orbit-cli?sort=top#vote",
      "https://feedback.example",
    ),
    intent: "feedback",
  },
};

export const CreateAccount: Story = {
  args: { mode: "create-account", returnTo: "/dashboard", intent: "board" },
};

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

export const OnTablet: Story = {
  globals: {
    viewport: { value: "tablet" },
  },
  play: async ({ canvas }) => {
    const { left, width } = canvas.getByRole("main").getBoundingClientRect();
    const tabStrip = canvas.getByRole("tablist").getBoundingClientRect();

    await expect(tabStrip.width).toBe(440);
    await expect(left).toBe((document.documentElement.clientWidth - width) / 2);
  },
};

export const Loading: Story = {
  render: () => (
    <>
      <AuthHeaderSkeleton />
      <AuthMain>
        <AuthContentSkeleton />
      </AuthMain>
    </>
  ),
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading sign-in");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};
