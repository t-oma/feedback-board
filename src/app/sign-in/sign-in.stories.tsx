import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import {
  buildSignInHref,
  getAuthBackTarget,
  parseReturnTo,
  type SignInQuery,
} from "@/entities/user/navigation";

import { AuthHeader } from "./_ui/auth-header";
import { AuthIntro } from "./_ui/auth-intro";
import { AuthTabs } from "./_ui/auth-tabs";
import SignInLoading from "./loading";

// What the page renders once it has parsed the query. The page itself is
// async and reads `searchParams`, so the stories compose its parts instead.
function SignInPage({ returnTo, intent, mode }: SignInQuery) {
  return (
    <>
      <AuthHeader backTarget={getAuthBackTarget(returnTo)} />
      <NarrowMain>
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
      </NarrowMain>
    </>
  );
}

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
  render: (args) => <SignInPage {...args} />,
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
    const { left, width } = canvas.getByRole("main").getBoundingClientRect();
    const tabStrip = canvas.getByRole("tablist").getBoundingClientRect();

    await expect(tabStrip.width).toBe(440);
    await expect(left).toBe((document.documentElement.clientWidth - width) / 2);
    await expect(
      canvas.getByRole("link", { name: "Feedback Board" }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  render: () => <SignInLoading />,
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
      content={<SignInPage {...args} />}
      skeleton={<SignInLoading />}
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
