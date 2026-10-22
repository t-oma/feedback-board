import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import { AvatarSkeleton } from "@/components/avatar";

import { AccountMenu } from "./account-menu";

const meta = {
  title: "Viewer/Account Menu",
  component: AccountMenu,
  parameters: {
    layout: "centered",
    nextjs: {
      navigation: { pathname: "/p/orbit-cli", query: {} },
    },
  },
  args: {
    name: "Artem Levchenko",
    email: "artem@example.com",
  },
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

async function open(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole("button", { name: "Account" }),
  );
  return screen.findByRole("menu");
}

export const Opens: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("button", { name: "Account" }),
    ).toHaveTextContent("AL");

    const menu = within(await open(canvasElement));
    const group = menu.getByRole("group", {
      name: /Artem Levchenko.*artem@example\.com/,
    });

    await expect(
      within(group).getByRole("menuitem", { name: "Dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
    await expect(
      within(group).getByRole("menuitem", { name: "Sign out" }),
    ).toBeInTheDocument();
  },
};

// The name leads in the item's weight and colour, the email stays muted, and a
// separator closes the label, so neither reads as an item.
export const NameSetApart: Story = {
  play: async ({ canvasElement }) => {
    const menu = await open(canvasElement);
    const name = within(menu).getByText("Artem Levchenko");
    const email = within(menu).getByText("artem@example.com");

    await expect(getComputedStyle(name).fontWeight).toBe("500");
    await expect(getComputedStyle(name).color).not.toBe(
      getComputedStyle(email).color,
    );
    await expect(
      name.closest('[role="group"] > *')?.nextElementSibling,
    ).toHaveAttribute("role", "separator");
  },
};

export const DashboardIsCurrent: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/dashboard", query: {} } },
  },
  play: async ({ canvasElement }) => {
    const menu = within(await open(canvasElement));

    await expect(
      menu.getByRole("menuitem", { name: "Dashboard" }),
    ).toHaveAttribute("aria-current", "page");
  },
};

export const DashboardElsewhere: Story = {
  play: async ({ canvasElement }) => {
    const menu = within(await open(canvasElement));

    await expect(
      menu.getByRole("menuitem", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current");
  },
};

// A long address gives way rather than widening the menu past a phone.
export const LongEmailOnPhone: Story = {
  args: {
    email: "a-person-with-a-particularly-long-address@example.com",
  },
  globals: { viewport: { value: "mobile1" } },
  play: async ({ canvasElement }) => {
    const menu = await open(canvasElement);
    const email = within(menu).getByText(/^a-person-with/);

    await expect(email.scrollWidth).toBeGreaterThan(email.clientWidth);
    await expect(menu.offsetWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  },
};

// The skeleton holds the trigger's place while the session loads, so the
// trigger replaces it without moving.
export const TriggerMatchesSkeleton: Story = {
  render: (args) => (
    <div className="flex items-start gap-x-4">
      <div data-testid="skeleton">
        <AvatarSkeleton />
      </div>
      <AccountMenu {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const skeleton = canvas.getByTestId("skeleton").getBoundingClientRect();
    const trigger = canvas
      .getByRole("button", { name: "Account" })
      .getBoundingClientRect();

    await expect({ width: skeleton.width, height: skeleton.height }).toEqual({
      width: trigger.width,
      height: trigger.height,
    });
  },
};
