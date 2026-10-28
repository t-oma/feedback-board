import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { PageMain } from "@/components/page-main";
import { Skeleton, SkeletonText } from "@/components/skeleton";

const meta = {
  title: "Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-50">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const intro = "Everything here can be changed later in Settings.";

export const AnnouncedAsBusy: Story = {
  args: {
    label: "Loading your dashboard",
    children: (
      <p className="text-sm">
        <SkeletonText>{intro}</SkeletonText>
      </p>
    ),
  },
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status");

    await expect(status).toHaveTextContent("Loading your dashboard");
    await expect(status).toHaveAttribute("aria-busy", "true");
    // Nothing in it can be read, so none of it reaches assistive technology.
    await expect(
      canvas.getByText(intro).closest("[aria-hidden]"),
    ).toHaveAttribute("aria-hidden", "true");
  },
};

// As a band of the layout grid, a band it holds runs across the grid and the
// rest keeps to the content area, as the page's own parts do.
export const AsBand: Story = {
  args: {
    label: "Loading",
    band: true,
    children: (
      <>
        <div data-testid="band" className="layout-subgrid bg-surface-muted">
          <p className="text-sm">{intro}</p>
        </div>
        <p data-testid="content" className="text-sm">
          {intro}
        </p>
      </>
    ),
  },
  render: (args) => (
    <PageMain>
      <Skeleton {...args} />
    </PageMain>
  ),
  play: async ({ canvas }) => {
    const main = canvas.getByRole("main").getBoundingClientRect();
    const band = canvas.getByTestId("band").getBoundingClientRect();
    const content = canvas.getByTestId("content").getBoundingClientRect();

    await expect(band.left).toBe(main.left);
    await expect(band.width).toBe(main.width);
    await expect(content.left).toBeGreaterThan(main.left);
    await expect(content.width).toBeLessThan(main.width);
  },
};

// The skeleton's string wraps where the real one does, one bar per line, each
// shorter than the line so that lines stay apart.
export const TextWrapsLikeTheText: Story = {
  args: {
    label: "Loading",
    children: (
      <>
        <p data-testid="real" className="text-sm">
          {intro}
        </p>
        <p data-testid="skeleton" className="text-sm">
          <SkeletonText>{intro}</SkeletonText>
        </p>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const real = canvas.getByTestId("real").getBoundingClientRect();
    const skeleton = canvas.getByTestId("skeleton");
    const text = canvas.getByText(intro, { selector: "span" });
    const bars = Array.from(text.getClientRects());

    await expect(skeleton.getBoundingClientRect().height).toBe(real.height);
    await expect(bars).toHaveLength(real.height / 20);
    for (const bar of bars) {
      await expect(bar.height).toBeLessThan(20);
    }
    await expect(text).toHaveStyle({
      color: "rgba(0, 0, 0, 0)",
      userSelect: "none",
    });
  },
};
