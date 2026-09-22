import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Tabs } from "@/components/tabs";

type AuthMode = "sign-in" | "create-account";

const meta = {
  title: "Components/Tabs",
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function AuthTabs({ defaultValue }: { defaultValue: AuthMode }) {
  return (
    <Tabs.Root defaultValue={defaultValue} className="w-full">
      <Tabs.List>
        <Tabs.Tab value="sign-in">Sign in</Tabs.Tab>
        <Tabs.Tab value="create-account">Create account</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel value="sign-in">
          <p className="text-sm text-foreground-secondary">
            Sign in to continue to your board.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="create-account">
          <p className="text-sm text-foreground-secondary">
            Create an account to start posting feedback.
          </p>
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  );
}

export const SignInActive: Story = {
  render: () => <AuthTabs defaultValue="sign-in" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "Sign in" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await userEvent.click(canvas.getByRole("tab", { name: "Create account" }));

    // Queried by name rather than by role alone: the panel being left stays
    // mounted and `inert` until its exit transition finishes, so both are in
    // the DOM for a moment.
    const createAccountPanel = await canvas.findByRole("tabpanel", {
      name: "Create account",
    });

    await expect(createAccountPanel).toHaveTextContent(
      "Create an account to start posting feedback.",
    );
  },
};

export const CreateAccountActive: Story = {
  render: () => <AuthTabs defaultValue="create-account" />,
};

export const Links: Story = {
  render: () => (
    <Tabs.Root defaultValue="sign-in" className="w-full">
      <Tabs.List>
        <Tabs.Tab
          value="sign-in"
          nativeButton={false}
          render={<a href="#sign-in" />}
        >
          Sign in
        </Tabs.Tab>
        <Tabs.Tab
          value="create-account"
          nativeButton={false}
          render={<a href="#create-account" />}
        >
          Create account
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Content>
        <Tabs.Panel value="sign-in">
          <p className="text-sm text-foreground-secondary">
            The selected tab is also a real anchor.
          </p>
        </Tabs.Panel>
        <Tabs.Panel value="create-account">
          <p className="text-sm text-foreground-secondary">
            This destination works without Next.js routing.
          </p>
        </Tabs.Panel>
      </Tabs.Content>
    </Tabs.Root>
  ),
};
