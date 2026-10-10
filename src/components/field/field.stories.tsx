import { Form } from "@base-ui/react/form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Field } from "@/components/field";
import { expectFocusRing, tabTo } from "@/components/focus-ring.testing";

const meta = {
  title: "Components/Field",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function themeColor(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export const Email: Story = {
  render: () => (
    <Field.Root name="email">
      <Field.Label>Email</Field.Label>
      <Field.Control
        type="email"
        required
        placeholder="you@example.com"
        autoComplete="email"
      />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByLabelText("Email");
    const placeholder = getComputedStyle(control, "::placeholder");

    await expect(placeholder.color).toBe("rgb(111, 107, 98)");
  },
};

export const Filled: Story = {
  render: () => (
    <Field.Root name="name">
      <Field.Label>Name</Field.Label>
      <Field.Control defaultValue="John Doe" autoComplete="name" />
    </Field.Root>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Field.Root name="slug">
      <Field.Label>Public address</Field.Label>
      <Field.Control defaultValue="orbit-cli" autoComplete="off" />
      <Field.Description>
        Lowercase letters, numbers and hyphens
      </Field.Description>
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByLabelText("Public address"),
    ).toHaveAccessibleDescription("Lowercase letters, numbers and hyphens");
  },
};

export const WithCounter: Story = {
  render: () => (
    <Field.Root name="name">
      <Field.Label counter={{ count: 9, max: 80 }}>Product name</Field.Label>
      <Field.Control defaultValue="Orbit CLI" autoComplete="off" />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByRole("textbox");

    // The name stays the label's own text however the count changes.
    await expect(control).toHaveAccessibleName("Product name");
    await expect(control).toHaveAccessibleDescription("9 of 80 characters");
    await expect(canvas.getByText("9")).toHaveStyle({
      color: themeColor("--color-foreground-subtle"),
      textDecorationLine: "none",
    });
  },
};

// Marked as soon as the count passes the maximum, before anything is
// validated. Only the count is marked; the maximum stays as it was.
export const CounterOverMaximum: Story = {
  render: () => (
    <Field.Root name="description">
      <Field.Label counter={{ count: 512, max: 500 }}>Description</Field.Label>
      <Field.Control defaultValue="Orbit CLI is a deploy tool" />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("512")).toHaveStyle({
      color: themeColor("--color-danger"),
      textDecorationLine: "underline",
      textDecorationStyle: "wavy",
    });
    await expect(canvas.getByText("/ 500")).toHaveStyle({
      color: themeColor("--color-foreground-subtle"),
    });
  },
};

// The error can be about something other than length, such as a taken
// address, so it leaves the count alone. Both still describe the field.
export const CounterWithFieldError: Story = {
  render: () => (
    <Form errors={{ name: ["Use at least 2 characters"] }}>
      <Field.Root name="name">
        <Field.Label counter={{ count: 1, max: 80 }}>Product name</Field.Label>
        <Field.Control defaultValue="O" autoComplete="off" />
        <Field.Error />
      </Field.Root>
    </Form>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByRole("textbox");

    await expect(control).toHaveAccessibleDescription(/1 of 80 characters/);
    await expect(control).toHaveAccessibleDescription(
      /Use at least 2 characters/,
    );
    await expect(canvas.getByText("1")).toHaveStyle({
      color: themeColor("--color-foreground-subtle"),
      textDecorationLine: "none",
    });
  },
};

export const Password: Story = {
  render: () => (
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <Field.PasswordControl
        required
        placeholder="••••••••"
        autoComplete="current-password"
      />
    </Field.Root>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByLabelText("Password");
    const toggle = canvas.getByRole("button", { name: "Show password" });

    await tabTo(toggle);
    await expectFocusRing(toggle, "inside");

    await expect(toggle).toHaveStyle({ cursor: "pointer" });
    await expect(control).toHaveAttribute("type", "password");

    await userEvent.click(
      canvas.getByRole("button", { name: "Show password" }),
    );
    await expect(control).toHaveAttribute("type", "text");

    await userEvent.click(
      canvas.getByRole("button", { name: "Hide password" }),
    );
    await expect(control).toHaveAttribute("type", "password");
  },
};

export const OnPhone: Story = {
  globals: {
    viewport: { value: "mobile1" },
  },
  render: () => (
    <div className="flex flex-col gap-y-4">
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" autoComplete="email" />
      </Field.Root>
      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.PasswordControl autoComplete="current-password" />
      </Field.Root>
    </div>
  ),
  play: async ({ canvas }) => {
    for (const label of ["Email", "Password"]) {
      await expect(canvas.getByLabelText(label)).toHaveStyle({
        fontSize: "16px",
      });
    }
  },
};

export const Invalid: Story = {
  render: () => (
    <Form errors={{ email: ["Enter a complete email address"] }}>
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="text"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field.Error />
      </Field.Root>
    </Form>
  ),
};

export const ReadOnlyPassword: Story = {
  render: () => (
    <Field.Root name="password">
      <Field.Label>Password</Field.Label>
      <Field.PasswordControl
        readOnly
        value="correct horse battery staple"
        autoComplete="current-password"
      />
    </Field.Root>
  ),
};
