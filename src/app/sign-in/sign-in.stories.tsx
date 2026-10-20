import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import { parseReturnTo } from "@/entities/user/navigation";

import { SignIn, SignInSkeleton } from "./_ui/sign-in";

const meta = {
  title: "Sign In/Page",
  component: SignIn,
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
} satisfies Meta<typeof SignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignInMode: Story = {
  args: {
    returnTo: parseReturnTo(
      "/p/orbit-cli?sort=top#vote",
      "https://feedback.example",
    ),
    intent: "feedback",
  },
};

export const CreateAccountMode: Story = {
  args: { mode: "create-account", returnTo: "/dashboard", intent: "board" },
};

export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const main = canvas.getByRole("main").getBoundingClientRect();
    const tabStrip = canvas.getByRole("tablist").getBoundingClientRect();

    await expect(main.left).toBe(0);
    await expect(main.width).toBe(page);
    await expect(tabStrip.left).toBe(20);
    await expect(tabStrip.right).toBe(page - 20);
    await expect(
      canvas.queryByRole("link", { name: "Feedback Board" }),
    ).not.toBeInTheDocument();
  },
};

// The header and the card switch together at `sm`. An iPad mini in portrait
// is narrower than `md`, so this width tells the two breakpoints apart.
export const OnTablet: Story = {
  parameters: {
    viewport: {
      options: {
        ipadMini: {
          name: "iPad mini",
          styles: { width: "744px", height: "1133px" },
          type: "tablet",
        },
      },
    },
  },
  globals: {
    viewport: { value: "ipadMini" },
  },
  play: async ({ canvas }) => {
    const tabStrip = canvas.getByRole("tablist").getBoundingClientRect();

    await expect(tabStrip.width).toBe(440);
    await expect(tabStrip.left + tabStrip.width / 2).toBe(
      document.documentElement.clientWidth / 2,
    );
    await expect(
      canvas.getByRole("link", { name: "Feedback Board" }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  render: () => <SignInSkeleton />,
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading sign-in");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};

// The page above the loading state that stands in for it. Two `main`
// landmarks on one page fail axe, so the a11y test is off here; the `Loading`
// story checks the loading state on its own.
const loadingLinesUp = {
  parameters: {
    a11y: { test: "off" },
  },
  render: (args) => (
    <SkeletonGeometry
      content={<SignIn {...args} />}
      skeleton={<SignInSkeleton />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
} satisfies Story;

export const LoadingLinesUpOnPhone: Story = {
  ...loadingLinesUp,
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const LoadingLinesUpInCard: Story = {
  ...loadingLinesUp,
  globals: {
    viewport: { value: "tablet" },
  },
};
