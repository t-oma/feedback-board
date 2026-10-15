import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, waitFor } from "storybook/test";

import { OwnerOverview } from "./owner-overview";

const publicUrl = "https://feedbackboard.app/p/orbit-cli";
const copiedText = fn();

const meta = {
  title: "Dashboard/Owner Overview",
  component: OwnerOverview,
  args: {
    productName: "Orbit CLI",
    productSlug: "orbit-cli",
    origin: "https://feedbackboard.app",
  },
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex w-full max-w-155 flex-col gap-y-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OwnerOverview>;

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
    await expect(
      canvas.getByText("feedbackboard.app/p/orbit-cli"),
    ).toBeVisible();

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
