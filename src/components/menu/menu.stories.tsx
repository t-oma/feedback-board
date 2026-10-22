import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { Avatar } from "@/components/avatar";
import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";
import { Menu } from "@/components/menu";
import { themeColor } from "@/components/theme.testing";

// Named after nothing in the app, so the stories test the parts alone.
function SampleMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Sample menu">
        <Avatar name="Sample Person" />
      </Menu.Trigger>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>A group of samples</Menu.GroupLabel>
          <Menu.Item>First sample</Menu.Item>
          <Menu.LinkItem href="/">Sample link</Menu.LinkItem>
          <Menu.Item nativeButton render={<button type="button" />}>
            Sample button
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item>Last sample</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  );
}

const meta = {
  title: "Menu",
  component: SampleMenu,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SampleMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// The popup renders in a portal, outside the story's canvas.
async function openFromKeyboard(trigger: HTMLElement) {
  await tabTo(trigger);
  await userEvent.keyboard("{Enter}");
  await screen.findByRole("menu");
}

export const TriggerFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Sample menu" });
    const { width, height } = trigger.getBoundingClientRect();

    await expect({ width, height }).toEqual({ width: 48, height: 48 });
    await tabTo(trigger);
    await expectFocusRing(trigger, "outside");
  },
};

export const OpensFromKeyboard: Story = {
  play: async ({ canvas }) => {
    await openFromKeyboard(canvas.getByRole("button", { name: "Sample menu" }));

    const first = screen.getByRole("menuitem", { name: "First sample" });
    await waitFor(() => expect(first).toHaveFocus());
    await expectFocusRing(first, "inside");
    await expect(
      screen.getByRole("group", { name: "A group of samples" }),
    ).toBeInTheDocument();
  },
};

export const ArrowKeysLoop: Story = {
  play: async ({ canvas }) => {
    await openFromKeyboard(canvas.getByRole("button", { name: "Sample menu" }));
    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: "First sample" }),
      ).toHaveFocus(),
    );

    await userEvent.keyboard("{ArrowUp}");

    await waitFor(() =>
      expect(
        screen.getByRole("menuitem", { name: "Last sample" }),
      ).toHaveFocus(),
    );
  },
};

export const EscapeReturnsFocus: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Sample menu" });
    await openFromKeyboard(trigger);

    await userEvent.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};

// Whatever element an item renders, a button too, it spans the popup, so the
// highlight and the ring do. Layout widths, because the popup scales in as it
// opens and a bounding box would measure the scale.
export const ItemsFillThePopup: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sample menu" }));
    const menu = await screen.findByRole("menu");

    for (const item of screen.getAllByRole("menuitem")) {
      await expect(item.offsetWidth).toBe(menu.clientWidth);
    }
  },
};

// Every item takes the pointer that `globals.css` gives a button, whether it
// renders a `div`, a link, or a button.
export const ItemsShowThePointer: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sample menu" }));
    await screen.findByRole("menu");

    for (const item of screen.getAllByRole("menuitem")) {
      await expect(item).toHaveStyle({ cursor: "pointer" });
    }
  },
};

export const GroupLabelSetApart: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sample menu" }));
    const label = await screen.findByText("A group of samples");
    const item = screen.getByRole("menuitem", { name: "First sample" });

    await expect(label).toHaveStyle({
      color: themeColor("--color-foreground-muted"),
    });
    await expect(parseFloat(getComputedStyle(label).fontSize)).toBeLessThan(
      parseFloat(getComputedStyle(item).fontSize),
    );
  },
};

export const LinkItemCloses: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sample menu" }));
    const link = await screen.findByRole("menuitem", { name: "Sample link" });

    await expect(link).toHaveAttribute("href", "/");
    await userEvent.click(link);

    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
  },
};
