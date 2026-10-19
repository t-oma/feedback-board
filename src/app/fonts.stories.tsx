import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

// The serif and mono families come from variables the root layout sets on
// `<html>`. Without them `font-family` is invalid as a whole, and the text
// falls back to the body's sans, so every story would show the wrong type.
const meta = {
  title: "Fonts",
  render: () => (
    <>
      <p className="font-serif">Source Serif 4</p>
      <p className="font-mono">JetBrains Mono</p>
    </>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SerifAndMono: Story = {
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByText("Source Serif 4")).fontFamily,
    ).toMatch(/Source Serif 4/);
    await expect(
      getComputedStyle(canvas.getByText("JetBrains Mono")).fontFamily,
    ).toMatch(/JetBrains Mono/);

    // The faces have loaded, not only been named.
    await document.fonts.ready;
    const loaded = [...document.fonts]
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replaceAll(/["']/g, ""));
    await expect(loaded).toContain("Source Serif 4");
    await expect(loaded).toContain("JetBrains Mono");
  },
};
