import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, spyOn, userEvent } from "storybook/test";

import { PageMain } from "@/components/page-main";
import { CREATED_SEARCH_PARAM } from "@/features/create-product/contracts";

import { OwnerOverview } from "./owner-overview";

// Storybook's own address must stay as it is.
function stubReplaceState() {
  return spyOn(window.history, "replaceState").mockImplementation(
    () => undefined,
  );
}

let replaceState: ReturnType<typeof stubReplaceState>;

const meta = {
  title: "Dashboard/Owner Heading",
  render: () => (
    <OwnerOverview
      productName="Orbit CLI"
      productSlug="orbit-cli"
      origin="https://feedbackboard.app"
    />
  ),
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <PageMain>
          <Story />
        </PageMain>
      </div>
    ),
  ],
  beforeEach: () => {
    replaceState = stubReplaceState();
    return () => {
      replaceState.mockRestore();
    };
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AfterCreating: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/dashboard",
        query: { [CREATED_SEARCH_PARAM]: "1" },
      },
    },
  },
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
      level: 1,
      name: "Orbit CLI",
    });
    const notice = canvas.getByText("Your board is live").closest("[role]");
    await expect(notice).toHaveAttribute("role", "status");
    await expect(notice).toHaveFocus();

    // The address loses the parameter, so a reload says nothing.
    await expect(replaceState).toHaveBeenCalledOnce();
    const [, , url] = replaceState.mock.calls[0] ?? [];
    await expect(
      new URL(String(url)).searchParams.has(CREATED_SEARCH_PARAM),
    ).toBe(false);

    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(canvas.queryByText("Your board is live")).toBeNull();
    await expect(heading).toHaveFocus();
  },
};

export const OnLaterVisits: Story = {
  parameters: {
    nextjs: {
      navigation: { pathname: "/dashboard", query: {} },
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Orbit CLI" }),
    ).toBeVisible();
    await expect(canvas.queryByText("Your board is live")).toBeNull();
    await expect(replaceState).not.toHaveBeenCalled();
  },
};
