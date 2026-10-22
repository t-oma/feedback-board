import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, screen, userEvent, waitFor } from "storybook/test";

import { Menu } from "@/components/menu";

import { signOutAction } from "../actions";
import { SignOutMenuItem } from "./sign-out-menu-item";

const meta = {
  title: "Sign Out/Menu Item",
  component: SignOutMenuItem,
  parameters: {
    layout: "centered",
    nextjs: {
      navigation: { pathname: "/p/orbit-cli", query: { sort: "top" } },
    },
  },
  decorators: [
    (Story) => (
      <Menu.Root defaultOpen>
        <Menu.Trigger aria-label="Account">AL</Menu.Trigger>
        <Menu.Popup>
          <Story />
        </Menu.Popup>
      </Menu.Root>
    ),
  ],
} satisfies Meta<typeof SignOutMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

function submittedReturnTo() {
  const [formData] = mocked(signOutAction).mock.calls[0] ?? [];
  return formData?.get("returnTo");
}

export const ReturnsToThisPage: Story = {
  play: async () => {
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Sign out" }),
    );

    await waitFor(() => expect(signOutAction).toHaveBeenCalledOnce());
    await expect(submittedReturnTo()).toBe("/p/orbit-cli?sort=top");
  },
};

export const SignsOutFromKeyboard: Story = {
  play: async () => {
    const item = await screen.findByRole("menuitem", { name: "Sign out" });
    // The open menu takes focus only after it has rendered, and the arrow key
    // moves focus on from there.
    await waitFor(() => expect(screen.getByRole("menu")).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(item).toHaveFocus());

    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(signOutAction).toHaveBeenCalledOnce());
  },
};

// The action never settles here, so the story sees what the visitor sees
// until the redirect.
export const StaysOpenWhilePending: Story = {
  beforeEach: () => {
    mocked(signOutAction).mockReturnValue(new Promise(() => undefined));
  },
  play: async () => {
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Sign out" }),
    );

    const item = await screen.findByRole("menuitem", {
      name: "Signing out…",
    });
    await expect(item).toHaveAttribute("aria-busy", "true");
    await expect(item).toHaveAttribute("aria-disabled", "true");
    await expect(item).toHaveStyle({ cursor: "not-allowed" });
    // A closing menu stays in the document while it animates out, so its
    // state is what tells.
    await expect(screen.getByRole("menu")).toHaveAttribute("data-open");
  },
};
