import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { PageMain } from "@/components/page-main";

const meta = {
  title: "Page Main",
  component: PageMain,
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        xl: {
          name: "Tailwind xl",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        wide: {
          name: "Wide screen",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <>
        <p data-testid="content">In the content area.</p>
        <div data-testid="band" className="layout-subgrid bg-surface">
          <p data-testid="in-band">In a band, lined up with the content.</p>
        </div>
        <p data-testid="full" className="col-full">
          Across the whole page.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof PageMain>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story["play"]>>[0]["canvas"];

function box(canvas: Canvas, testId: string) {
  const { left, width } = canvas.getByTestId(testId).getBoundingClientRect();
  return { left, width };
}

// Where the content area should be at the viewport's width.
async function expectContentArea(canvas: Canvas, left: number, width: number) {
  const page = document.documentElement.clientWidth;

  await expect(box(canvas, "content")).toEqual({ left, width });
  await expect(box(canvas, "in-band")).toEqual({ left, width });
  await expect(box(canvas, "band")).toEqual({ left: 0, width: page });
  await expect(box(canvas, "full")).toEqual({ left: 0, width: page });
}

export const OnPhone: Story = {
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    await expectContentArea(
      canvas,
      20,
      document.documentElement.clientWidth - 40,
    );
  },
};

export const OnTablet: Story = {
  globals: { viewport: { value: "tablet" } },
  play: async ({ canvas }) => {
    await expectContentArea(
      canvas,
      40,
      document.documentElement.clientWidth - 80,
    );
  },
};

// The width the design draws the page at, and where the content stops
// growing.
export const AtExtraLarge: Story = {
  globals: { viewport: { value: "xl" } },
  play: async ({ canvas }) => {
    await expectContentArea(canvas, 40, 1200);
  },
};

export const OnWideScreen: Story = {
  globals: { viewport: { value: "wide" } },
  play: async ({ canvas }) => {
    await expectContentArea(
      canvas,
      (document.documentElement.clientWidth - 1200) / 2,
      1200,
    );
  },
};

// A message in the middle of the screen, as on the not-found page.
export const Centred: Story = {
  args: {
    align: "center",
    children: <p data-testid="content">Nothing here.</p>,
  },
  play: async ({ canvas }) => {
    const main = canvas.getByRole("main").getBoundingClientRect();
    const content = canvas.getByTestId("content").getBoundingClientRect();
    const above = content.top - main.top;
    const below = main.bottom - content.bottom;

    await expect(Math.abs(above - below)).toBeLessThan(1);
  },
};
