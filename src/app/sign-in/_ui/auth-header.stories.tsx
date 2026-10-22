import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";
import { contentEdge } from "@/components/layout-grid.testing";
import { parseReturnTo } from "@/entities/user/navigation";

import { getAuthBackTarget } from "./auth-back-target";
import { AuthHeader, AuthHeaderSkeleton } from "./auth-header";

const meta = {
  title: "Sign In/Header",
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
    const link = header.getByRole("link", { name: label });

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

export const Loading: Story = {
  render: () => <AuthHeaderSkeleton />,
  play: async ({ canvas }) => {
    const header = within(canvas.getByRole("banner"));

    await expect(
      header.queryByRole("link", { name: /^Back to/ }),
    ).not.toBeInTheDocument();
  },
};

// The back link's arrow, and from `sm` the brand, start at the content's edge
// of the layout grid, as on every page laid out on it.
const linesUpWithGrid = {
  play: async ({ canvas }) => {
    const arrow = canvas
      .getByRole("link", { name: "Back to Feedback Board" })
      .querySelector("svg");

    await expect(arrow?.getBoundingClientRect().left).toBe(contentEdge());

    const brand = canvas.queryByRole("link", { name: "Feedback Board" });
    if (document.documentElement.clientWidth >= 640) {
      await expect(brand?.getBoundingClientRect().left).toBe(contentEdge());
    } else {
      await expect(brand).not.toBeInTheDocument();
    }
  },
} satisfies Story;

export const LinesUpOnPhone: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "mobile1" } },
};

export const LinesUpOnTablet: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "tablet" } },
};

export const LinesUpOnWideScreen: Story = {
  ...linesUpWithGrid,
  globals: { viewport: { value: "wide" } },
};
