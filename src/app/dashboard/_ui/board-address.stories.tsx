import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, waitFor } from "storybook/test";

import { BoardAddress } from "./board-address";

const publicUrl = "https://feedbackboard.app/p/orbit-cli";
const copiedText = fn();

const meta = {
  title: "Dashboard/Board Address",
  component: BoardAddress,
  args: {
    productSlug: "orbit-cli",
    origin: "https://feedbackboard.app",
  },
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-110">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BoardAddress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewPublicBoard: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", {
      name: "View public board (opens in a new tab)",
    });

    await expect(link).toHaveAttribute("href", "/p/orbit-cli");
    await expect(link).toHaveAttribute("target", "_blank");
  },
};

// A slug that does not fit beside the host moves to the next line whole,
// rather than breaking at its hyphens or between two letters.
export const SlugOnItsOwnLineOnPhone: Story = {
  args: { productSlug: "orbit-cli-for-teams" },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const slug = canvas.getByText("orbit-cli-for-teams");
    const address = slug.parentElement;
    if (address === null) throw new Error("The slug has no address around it.");
    const lineHeight = parseFloat(getComputedStyle(address).lineHeight);

    await expect(address).toHaveTextContent(
      "feedbackboard.app/p/orbit-cli-for-teams",
    );
    await expect(slug.getBoundingClientRect().left).toBe(
      address.getBoundingClientRect().left,
    );
    await expect(slug.getBoundingClientRect().height).toBe(lineHeight);
  },
};

// A slug as long as one may be breaks inside itself rather than running past
// the frame.
export const LongSlugOnPhone: Story = {
  args: { productSlug: "a".repeat(48) },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvas }) => {
    const address = canvas.getByText("a".repeat(48)).parentElement;
    if (address === null) throw new Error("The slug has no address around it.");

    await expect(address.scrollWidth).toBe(address.clientWidth);
    await expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
  },
};

export const CopyLink: Story = {
  beforeEach: () => {
    const writeText = spyOn(
      navigator.clipboard,
      "writeText",
    ).mockImplementation((text) => {
      copiedText(text);
      return Promise.resolve();
    });
    return () => {
      writeText.mockRestore();
    };
  },
  play: async ({ canvas }) => {
    // The slug is an element of its own inside the address, so the address
    // is found by its slug and checked as a whole.
    await expect(canvas.getByText("orbit-cli").parentElement).toHaveTextContent(
      "feedbackboard.app/p/orbit-cli",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Copy link" }));

    await expect(copiedText).toHaveBeenCalledOnce();
    await expect(copiedText).toHaveBeenCalledWith(publicUrl);
    await expect(
      await canvas.findByRole("button", { name: "Copied" }),
    ).toBeVisible();
    await expect(canvas.getByText("Link copied")).toHaveAttribute(
      "role",
      "status",
    );

    // The confirmation lasts two seconds.
    await waitFor(
      () =>
        expect(canvas.getByRole("button", { name: "Copy link" })).toBeVisible(),
      { timeout: 3000 },
    );
  },
};

export const CopyFailed: Story = {
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new DOMException("Write permission denied.", "NotAllowedError"),
    );
    return () => {
      writeText.mockRestore();
    };
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy link" }));

    await expect(
      await canvas.findByRole("button", { name: "Couldn’t copy" }),
    ).toBeVisible();
    await expect(canvas.getByText("The link couldn’t be copied")).toBeVisible();
  },
};
