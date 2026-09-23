import "../src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    // axe violations are defects, not suggestions. The addon panel reports them
    // while developing; this setting is what fails the story project in
    // `pnpm test`, and with it the `Unit and story tests` job in CI.
    a11y: {
      test: "error",
    },
  },
};

export default preview;
