import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { buildSignInHref } from "../navigation";
import { AuthMain } from "./auth-main";
import { AuthTabs } from "./auth-tabs";

const meta = {
  title: "Features/Auth/Tabs",
  component: AuthTabs,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-svh flex-col">
        <AuthMain>
          <Story />
        </AuthMain>
      </div>
    ),
  ],
  args: {
    mode: "sign-in",
    returnTo: null,
    signInHref: buildSignInHref(),
    createAccountHref: buildSignInHref({ mode: "create-account" }),
  },
} satisfies Meta<typeof AuthTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Sign in" })).toHaveFocus();

    // The panel opens with a field, so it is not a Tab stop of its own.
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
  },
};

export const CreateAccount: Story = {
  args: { mode: "create-account" },
};

const returnTo = "/dashboard?tab=planned";
const intent = "feedback";

export const WithReturnTo: Story = {
  args: {
    returnTo,
    signInHref: buildSignInHref({ returnTo, intent }),
    createAccountHref: buildSignInHref({
      returnTo,
      intent,
      mode: "create-account",
    }),
  },
  play: async ({ args, canvas, canvasElement }) => {
    const tabQuery = (name: string) => {
      const href = canvas.getByRole("tab", { name }).getAttribute("href");
      return new URL(href ?? "", window.location.origin).searchParams;
    };

    for (const [name, mode] of [
      ["Sign in", null],
      ["Create account", "create-account"],
    ] as const) {
      const query = tabQuery(name);

      await expect(query.get("returnTo")).toBe(args.returnTo);
      await expect(query.get("intent")).toBe(intent);
      await expect(query.get("mode")).toBe(mode);
    }

    const hiddenInputs = canvasElement.querySelectorAll<HTMLInputElement>(
      'input[type="hidden"][name="returnTo"]',
    );

    await expect(Array.from(hiddenInputs, (input) => input.value)).toEqual([
      args.returnTo,
      args.returnTo,
    ]);
  },
};
