import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import { CreateProductForm } from "./create-product-form";
import { CreateProductFormSkeleton } from "./create-product-form-skeleton";
import { CreateProductProvider } from "./create-product-provider";

const publicHost = "feedbackboard.app";

const meta = {
  title: "Create Product/Form Skeleton",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  render: () => (
    <div className="flex min-h-svh flex-col">
      <NarrowMain>
        <CreateProductFormSkeleton publicHost={publicHost} />
      </NarrowMain>
    </div>
  ),
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading your dashboard");
    await expect(status).toHaveAttribute("aria-busy", "true");
  },
};

// The form above the skeleton that stands in for it, each in the page's
// `main`. Two `main` landmarks on one page fail axe, so the a11y test is off
// here; `Loading` checks the skeleton.
const geometry: Story = {
  parameters: {
    a11y: { test: "off" },
  },
  render: () => (
    <SkeletonGeometry
      frame={(children) => <NarrowMain>{children}</NarrowMain>}
      content={
        <CreateProductProvider>
          <CreateProductForm publicHost={publicHost} />
        </CreateProductProvider>
      }
      skeleton={<CreateProductFormSkeleton publicHost={publicHost} />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSkeletonGeometry(canvasElement);
  },
};

export const LinesUpOnPhone: Story = {
  ...geometry,
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const LinesUpInCard: Story = {
  ...geometry,
  globals: {
    viewport: { value: "tablet" },
  },
};
