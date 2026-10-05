import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";

import { getAuthBackTarget, parseReturnTo } from "../navigation";
import { AuthHeader, AuthHeaderSkeleton } from "./auth-header";

const meta = {
  title: "Features/Auth/Header",
  component: AuthHeader,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    backTarget: getAuthBackTarget(null),
  },
} satisfies Meta<typeof AuthHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

function checkBackLink(label: string): NonNullable<Story["play"]> {
  return async ({ args, canvas }) => {
    const header = within(canvas.getByRole("banner"));
    const navigation = within(
      header.getByRole("navigation", { name: "Exit authentication" }),
    );
    const link = navigation.getByRole("link", { name: label });

    await expect(link).toHaveAttribute("href", args.backTarget.href);
    await expect(link).toBeVisible();

    await tabTo(link);
    await expectFocusRing(link, "inside");
  };
}

export const Home: Story = {
  play: checkBackLink("Back to Feedback Board"),
};

export const Board: Story = {
  args: {
    backTarget: getAuthBackTarget(
      parseReturnTo("/p/orbit-cli?sort=top#vote", "https://feedback.example"),
    ),
  },
  play: checkBackLink("Back to orbit-cli"),
};

export const Feedback: Story = {
  args: {
    backTarget: getAuthBackTarget(
      parseReturnTo(
        "/p/orbit-cli/feedback/019a0000-0000-7000-8000-000000000001",
        "https://feedback.example",
      ),
    ),
  },
  play: checkBackLink("Back to feedback"),
};

export const Changelog: Story = {
  args: {
    backTarget: getAuthBackTarget(
      parseReturnTo("/p/orbit-cli/changelog", "https://feedback.example"),
    ),
  },
  play: checkBackLink("Back to changelog"),
};

export const LongBoardSlug: Story = {
  args: {
    backTarget: getAuthBackTarget(
      parseReturnTo(
        "/p/a-product-with-a-particularly-long-but-valid-slug",
        "https://feedback.example",
      ),
    ),
  },
  play: checkBackLink(
    "Back to a-product-with-a-particularly-long-but-valid-slug",
  ),
};

export const Desktop: Story = {
  globals: {
    viewport: { value: "desktop" },
  },
  play: async ({ canvas }) => {
    const header = within(canvas.getByRole("banner"));
    const homeLink = header.getByRole("link", { name: "Feedback Board" });

    await expect(homeLink).toHaveAttribute("href", "/");

    await tabTo(homeLink);
    await expectFocusRing(homeLink, "outside");
  },
};

export const Loading: Story = {
  render: () => <AuthHeaderSkeleton />,
  play: async ({ canvas }) => {
    const header = within(canvas.getByRole("banner"));
    const navigation = within(
      header.getByRole("navigation", { name: "Exit authentication" }),
    );

    await expect(navigation.queryByRole("link")).not.toBeInTheDocument();
  },
};
