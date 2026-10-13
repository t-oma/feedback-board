import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NarrowMain } from "@/components/narrow-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";
import { buildSignInHref } from "@/entities/user/navigation";

import { AuthContentSkeleton } from "./auth-content-skeleton";
import { AuthIntro } from "./auth-intro";
import { AuthTabs } from "./auth-tabs";

// The sign-in content above the skeleton that stands in for it, each in the
// page's `main`. Two `main` landmarks on one page fail axe, so the a11y test is
// off here; the `Loading` story of `Features/Auth/SignIn` checks the skeleton.
const meta = {
  title: "Features/Auth/Content Skeleton",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "off" },
  },
  render: () => (
    <SkeletonGeometry
      frame={(children) => <NarrowMain>{children}</NarrowMain>}
      content={
        <>
          <AuthIntro mode="sign-in" intent={null} />
          <AuthTabs
            mode="sign-in"
            returnTo={null}
            signInHref={buildSignInHref({})}
            createAccountHref={buildSignInHref({ mode: "create-account" })}
          />
        </>
      }
      skeleton={<AuthContentSkeleton />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const InCard: Story = {
  globals: {
    viewport: { value: "tablet" },
  },
};
