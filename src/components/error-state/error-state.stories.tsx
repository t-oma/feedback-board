import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { Link } from "@/components/link";

const retry = fn();

const meta = {
  title: "Components/Error State",
  component: ErrorState,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithActions: Story = {
  args: {
    title: "We couldn't load this page. Please try again.",
    description:
      "If it keeps happening, the board may be temporarily unavailable.",
    headingLevel: 1,
    children: (
      <>
        <Button onClick={retry}>Retry</Button>
        <Link variant="secondary" href="/">
          Go to the landing page
        </Link>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const alert = canvas.getByRole("alert");

    await expect(alert).toContainElement(
      canvas.getByRole("heading", {
        level: 1,
        name: "We couldn't load this page. Please try again.",
      }),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(retry).toHaveBeenCalledOnce();
  },
};
