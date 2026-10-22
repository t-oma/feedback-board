import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignInLink } from "./sign-in-link";

const meta = {
  title: "Viewer/Sign In Link",
  component: SignInLink,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SignInLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReturnsHere: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/p/orbit-cli", query: { sort: "top" } },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      `/sign-in?${new URLSearchParams({ returnTo: "/p/orbit-cli?sort=top" })}`,
    );
  },
};

export const ReturnsHereWithoutQuery: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/p/orbit-cli", query: {} },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      `/sign-in?${new URLSearchParams({ returnTo: "/p/orbit-cli" })}`,
    );
  },
};
