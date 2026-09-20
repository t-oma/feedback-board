import { Form } from "@base-ui/react/form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field } from "@/components/field";

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
};

export const Filled: Story = {
  render: () => (
    <Field.Root name="name">
      <Field.Label>Name</Field.Label>
      <Field.Control defaultValue="John Doe" autoComplete="name" />
    </Field.Root>
  ),
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
