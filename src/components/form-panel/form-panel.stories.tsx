import type { Meta, StoryContext, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FormPanel } from "@/components/form-panel";
import { PageMain } from "@/components/page-main";

const meta = {
  title: "Form Panel",
  component: FormPanel,
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        sm: {
          name: "Tailwind sm",
          styles: { width: "640px", height: "800px" },
          type: "tablet",
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <PageMain align="stretch">
        <Story />
      </PageMain>
    ),
  ],
  args: {
    children: (
      <>
        <h1 className="font-serif text-2xl font-semibold">Create your board</h1>
        <p className="text-foreground-muted">
          Everything here can be changed later in Settings.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof FormPanel>;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = StoryContext["canvas"];

function boxes(canvas: Canvas) {
  const heading = canvas.getByRole("heading");
  const panel = heading.parentElement;
  if (panel === null) throw new Error("The heading has no panel around it.");

  return {
    main: canvas.getByRole("main").getBoundingClientRect(),
    panel: panel.getBoundingClientRect(),
    heading: heading.getBoundingClientRect(),
    paragraph: canvas.getByText(/^Everything here/).getBoundingClientRect(),
  };
}

// A band of the surface across the page and down to its bottom, its content
// at the layout grid's margin.
export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const { main, panel, heading, paragraph } = boxes(canvas);

    await expect(panel.left).toBe(0);
    await expect(panel.width).toBe(page);
    await expect(panel.bottom).toBe(main.bottom);
    await expect(heading.left).toBe(20);
    await expect(heading.right).toBe(page - 20);
    // The panel grows, not the rows in it: the heading stays one line tall,
    // and the next row follows 20 pixels below.
    const lineHeight = parseFloat(
      getComputedStyle(canvas.getByRole("heading")).lineHeight,
    );
    await expect(heading.height).toBe(lineHeight);
    await expect(paragraph.top - heading.bottom).toBe(20);
  },
};

// The narrowest width with the card. A wider card, with its padding and
// border, would stick out of the viewport here and scroll the page sideways.
export const AtSmallestCardWidth: Story = {
  globals: {
    viewport: { value: "sm" },
  },
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const { panel, heading, paragraph } = boxes(canvas);
    const panelElement = canvas.getByRole("heading").parentElement;
    if (panelElement === null) throw new Error("The heading has no panel.");
    const { paddingBottom, borderBottomWidth } = getComputedStyle(panelElement);

    await expect(page).toBe(640);
    await expect(heading.width).toBe(440);
    // The card ends with its content, its bottom padding and border below,
    // rather than reaching down the page.
    await expect(panel.bottom - paragraph.bottom).toBe(
      parseFloat(paddingBottom) + parseFloat(borderBottomWidth),
    );
    await expect(panel.left + panel.width / 2).toBe(page / 2);
    await expect(panel.left).toBeGreaterThan(0);
    await expect(panel.right).toBeLessThan(page);
  },
};

// The card stays 440 pixels of content in the middle of a wide screen.
export const OnWideScreen: Story = {
  globals: {
    viewport: { value: "wide" },
  },
  play: async ({ canvas }) => {
    const page = document.documentElement.clientWidth;
    const { panel, heading } = boxes(canvas);

    await expect(heading.width).toBe(440);
    await expect(panel.left + panel.width / 2).toBe(page / 2);
  },
};
