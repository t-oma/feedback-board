import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@/components/form";
import { FormError } from "@/components/form-error";

const meta = {
  title: "Components/Form",
  component: Form,
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
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BannerFieldsAndButton: Story = {
  args: {
    children: (
      <>
        <FormError message="We couldn’t complete your request. Please try again." />
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Field.Control type="email" />
        </Field.Root>
        <Field.Root name="password">
          <Field.Label>Password</Field.Label>
          <Field.PasswordControl />
        </Field.Root>
        <Button type="submit">Sign in</Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const [first, ...rest] = Array.from(form?.children ?? [], (part) =>
      part.getBoundingClientRect(),
    );

    await expect(rest).toHaveLength(3);
    let above = first;
    for (const part of rest) {
      await expect(part.top - (above?.bottom ?? 0)).toBe(18);
      above = part;
    }
  },
};
