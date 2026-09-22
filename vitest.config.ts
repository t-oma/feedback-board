import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      // Domain and schema tests. No DOM is involved and none is wanted: a test
      // that needs one belongs to a story instead.
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
        },
      },
      // Every story, rendered in a real browser. The stories are the component
      // test suite; `play` functions drive them and axe runs against the result
      // under the `a11y.test` policy set in `.storybook/preview.ts`.
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
