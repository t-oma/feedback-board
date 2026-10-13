import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, userEvent } from "storybook/test";

import { NarrowMain } from "@/components/narrow-main";

import { createProductAction, type CreateProductResult } from "../actions";
import { CreateProductForm } from "./create-product-form";
import { CreateProductProvider } from "./create-product-provider";

const meta = {
  title: "Create Product/Form",
  render: () => (
    <CreateProductProvider>
      <CreateProductForm publicHost="feedbackboard.app" />
    </CreateProductProvider>
  ),
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

function fields(canvas: Canvas) {
  return {
    name: canvas.getByRole("textbox", { name: "Product name" }),
    address: canvas.getByRole("textbox", { name: "Public address" }),
    description: canvas.getByRole("textbox", { name: "Description optional" }),
  };
}

export const AddressFollowsTheName: Story = {
  play: async ({ canvas }) => {
    const { name, address } = fields(canvas);

    await userEvent.type(name, "Orbit  CLI!");
    await expect(address).toHaveValue("orbit-cli");

    // Each counter counts what validation counts: the collapsed name and the
    // normalized address.
    await expect(name).toHaveAccessibleDescription(/10 of 80 characters/);
    await expect(address).toHaveAccessibleDescription(/9 of 48 characters/);
    await expect(address).toHaveAccessibleDescription(
      /feedbackboard\.app\/p\//,
    );

    await userEvent.clear(address);
    await userEvent.type(address, "my-board");
    await userEvent.type(name, " Pro");
    await expect(address).toHaveValue("my-board");
  },
};

export const BlocksAnInvalidSubmit: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Create board" }));

    await expect(canvas.getByText("Enter a product name")).toBeVisible();
    await expect(
      canvas.getByText("Use Latin letters, numbers and hyphens"),
    ).toBeVisible();
    await expect(fields(canvas).name).toHaveFocus();
    await expect(createProductAction).not.toHaveBeenCalled();
  },
};

// On a phone the keyboard can cover the button, so the return key is how the
// form gets submitted while typing.
export const SubmitsWithTheReturnKey: Story = {
  play: async ({ canvas }) => {
    const { name, address } = fields(canvas);

    await userEvent.type(name, "Orbit CLI{Enter}");
    await expect(createProductAction).toHaveBeenCalledTimes(1);

    await userEvent.type(address, "{Enter}");
    await expect(createProductAction).toHaveBeenCalledTimes(2);
  },
};

// The actions are mocked for every story, so the stories below decide what
// the server answers. React resets the form after an action whatever it
// returns; these check that every value survives it.

async function fillAndSubmit(canvas: Canvas) {
  const { name, description } = fields(canvas);
  await userEvent.type(name, "Orbit CLI");
  await userEvent.type(description, "Tell us what is missing.");
  await userEvent.click(canvas.getByRole("button", { name: "Create board" }));
}

async function expectValuesKept(canvas: Canvas) {
  const { name, address, description } = fields(canvas);
  await expect(name).toHaveValue("Orbit CLI");
  await expect(address).toHaveValue("orbit-cli");
  await expect(description).toHaveValue("Tell us what is missing.");
}

export const SlugTaken: Story = {
  beforeEach: () => {
    mocked(createProductAction).mockResolvedValue({
      ok: false,
      code: "CONFLICT",
      fieldErrors: {
        slug: ["This slug is already taken. Choose another one."],
      },
    } satisfies CreateProductResult);
  },
  play: async ({ canvas }) => {
    await fillAndSubmit(canvas);

    await expect(
      await canvas.findByText(
        "This slug is already taken. Choose another one.",
      ),
    ).toBeVisible();
    await expectValuesKept(canvas);
    await expect(fields(canvas).address).toHaveFocus();
  },
};

export const UnexpectedFailure: Story = {
  beforeEach: () => {
    mocked(createProductAction).mockResolvedValue({
      ok: false,
      code: "UNEXPECTED",
      message: "We couldn’t complete your request. Please try again.",
    } satisfies CreateProductResult);
  },
  play: async ({ canvas }) => {
    await fillAndSubmit(canvas);

    const banner = await canvas.findByRole("alert");
    await expect(banner).toHaveTextContent(
      "We couldn’t complete your request. Please try again.",
    );
    // Every value is still there, so submitting again is the next step.
    await expect(banner).toHaveFocus();
    await expectValuesKept(canvas);
  },
};

export const SessionEnded: Story = {
  beforeEach: () => {
    mocked(createProductAction).mockResolvedValue({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Your session has ended. Sign in again to create your board.",
    } satisfies CreateProductResult);
  },
  play: async ({ canvas }) => {
    await fillAndSubmit(canvas);

    await expect(await canvas.findByRole("alert")).toHaveFocus();
    await expect(
      canvas.getByRole("link", { name: "Sign in again" }),
    ).toHaveAttribute("href", "/sign-in?returnTo=%2Fdashboard");
    await expectValuesKept(canvas);
  },
};

export const Pending: Story = {
  beforeEach: () => {
    mocked(createProductAction).mockReturnValue(new Promise(() => undefined));
  },
  play: async ({ canvas }) => {
    await fillAndSubmit(canvas);

    await expect(
      await canvas.findByRole("button", { name: "Creating…" }),
    ).toHaveAttribute("aria-busy", "true");
    for (const field of Object.values(fields(canvas))) {
      await expect(field).toHaveAttribute("readonly");
    }
  },
};

export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvas }) => {
    for (const field of Object.values(fields(canvas))) {
      await expect(field).toHaveStyle({ fontSize: "16px" });
    }
  },
};
