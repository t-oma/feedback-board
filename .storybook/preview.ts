import "../src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    // axe violations are defects, not suggestions. The addon panel reports them
    // while developing; this setting is what a story runner would fail on, and
    // the project has no such runner yet.
    a11y: {
      test: "error",
    },
  },
};

export default preview;
