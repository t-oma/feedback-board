import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, userEvent, waitFor, within } from "storybook/test";

import { createAccountAction, signInAction } from "../actions";
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

// The actions are mocked for every story, so each story below decides what
// the server answers. React resets the form after an action whatever it
// returns; these check what survives that reset.

export const CreateAccountEmailTaken: Story = {
  args: { mode: "create-account" },
  beforeEach: () => {
    mocked(createAccountAction).mockResolvedValue({
      ok: false,
      code: "CONFLICT",
      fieldErrors: { email: ["An account already uses this email."] },
    });
  },
  play: async ({ canvas }) => {
    const form = within(canvas.getByRole("tabpanel"));

    await userEvent.type(form.getByLabelText("Name"), "Marta Kowal");
    await userEvent.type(form.getByLabelText("Email"), "marta@orbit.dev");
    await userEvent.type(form.getByLabelText("Password"), "correct horse");
    await userEvent.click(form.getByRole("button", { name: "Create account" }));

    await expect(
      await form.findByText("An account already uses this email."),
    ).toBeVisible();
    await expect(form.getByLabelText("Name")).toHaveValue("Marta Kowal");
    await expect(form.getByLabelText("Email")).toHaveValue("marta@orbit.dev");
    await expect(form.getByLabelText("Password")).toHaveValue("");
  },
};

export const SignInWrongCredentials: Story = {
  beforeEach: () => {
    mocked(signInAction).mockResolvedValue({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    });
  },
  play: async ({ canvas }) => {
    const form = within(canvas.getByRole("tabpanel"));

    await userEvent.type(form.getByLabelText("Email"), "marta@orbit.dev");
    await userEvent.type(form.getByLabelText("Password"), "wrong password");
    await userEvent.click(form.getByRole("button", { name: "Sign in" }));

    await expect(await form.findByRole("alert")).toHaveTextContent(
      "That email and password do not match an account.",
    );
    await expect(form.getByLabelText("Email")).toHaveValue("marta@orbit.dev");

    const password = form.getByLabelText("Password");
    await expect(password).toHaveValue("");
    await waitFor(() => expect(password).toHaveFocus());
  },
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
