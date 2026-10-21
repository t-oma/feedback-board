import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FormPanel } from "@/components/form-panel";
import { PageMain } from "@/components/page-main";
import {
  expectSkeletonGeometry,
  SkeletonGeometry,
} from "@/components/skeleton/skeleton.testing";

import { CreateProductForm } from "./create-product-form";
import { CreateProductFormSkeleton } from "./create-product-form-skeleton";

const origin = "https://feedbackboard.app";

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
    <PageMain align="stretch">
      <FormPanel>
        <CreateProductFormSkeleton origin={origin} />
      </FormPanel>
    </PageMain>
  ),
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading board creation");
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
      frame={(children) => (
        <PageMain align="stretch">
          <FormPanel>{children}</FormPanel>
        </PageMain>
      )}
      content={<CreateProductForm origin={origin} />}
      skeleton={<CreateProductFormSkeleton origin={origin} />}
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
