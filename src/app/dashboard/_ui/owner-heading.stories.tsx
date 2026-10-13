import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { expect, mocked, userEvent } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";
import {
  createProductAction,
  type CreateProductResult,
} from "@/features/create-product/actions";
import { CreateProductForm } from "@/features/create-product/ui/create-product-form";
import { CreateProductProvider } from "@/features/create-product/ui/create-product-provider";

import { OwnerOverview } from "./owner-overview";

// The mocked action calls this the way the real one's `refresh()` makes the
// server render the owner state: in the same transition as its result.
const ownerState: { show: (name: string) => void } = {
  show: () => undefined,
};

// What the dashboard page renders, with the server's choice made here.
function DashboardWithServer() {
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    ownerState.show = setProductName;
  }, []);

  return (
    <CreateProductProvider>
      {productName === null ? (
        <CreateProductForm publicHost="feedbackboard.app" />
      ) : (
        <OwnerOverview
          productName={productName}
          publicUrl="https://feedbackboard.app/p/orbit-cli"
        />
      )}
    </CreateProductProvider>
  );
}

function answerWith(result: CreateProductResult) {
  mocked(createProductAction).mockImplementation(() => {
    ownerState.show("Orbit CLI");
    return Promise.resolve(result);
  });
}

const meta = {
  title: "Features/Products/Owner Heading",
  render: () => <DashboardWithServer />,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <NarrowMain>
          <Story />
        </NarrowMain>
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story["play"]>>[0]["canvas"];

async function createBoard(canvas: Canvas) {
  await userEvent.type(
    canvas.getByRole("textbox", { name: "Product name" }),
    "Orbit CLI",
  );
  await userEvent.click(canvas.getByRole("button", { name: "Create board" }));
}

export const AfterCreating: Story = {
  beforeEach: () => {
    answerWith({ ok: true, data: undefined });
  },
  play: async ({ canvas }) => {
    await createBoard(canvas);

    const heading = await canvas.findByRole("heading", {
      level: 1,
      name: "Orbit CLI",
    });
    // The form's submit button had focus, and it is gone.
    const notice = canvas.getByText("Your board is live").closest("[role]");
    await expect(notice).toHaveAttribute("role", "status");
    await expect(notice).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(canvas.queryByText("Your board is live")).toBeNull();
    await expect(heading).toHaveFocus();
  },
};

// A second tab created the board first. The page shows that board, and the
// notice says why the form went away.
export const SecondBoardRefused: Story = {
  beforeEach: () => {
    answerWith({
      ok: false,
      code: "CONFLICT",
      message: "You already have a board.",
    });
  },
  play: async ({ canvas }) => {
    await createBoard(canvas);

    await expect(
      await canvas.findByRole("heading", { level: 1, name: "Orbit CLI" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("You already have a board.").closest("[role]"),
    ).toHaveFocus();
    await expect(canvas.queryByText("Your board is live")).toBeNull();
  },
};
