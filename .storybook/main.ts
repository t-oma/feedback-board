import type { StorybookConfig } from "@storybook/nextjs-vite";

const files = "**/*.stories.@(ts|tsx)";

const config: StorybookConfig = {
  // Each layer's directory gives its stories the first part of their title, so
  // a story moved to another layer moves in the sidebar with it. A directory
  // left out of this list is a directory whose stories neither Storybook nor
  // `pnpm test` collects, which is why `entities` is here before it has a
  // story; until then both warn that its pattern matches no files.
  stories: [
    { directory: "../src/components", files, titlePrefix: "Components" },
    { directory: "../src/entities", files, titlePrefix: "Entities" },
    { directory: "../src/features", files, titlePrefix: "Features" },
    { directory: "../src/app", files, titlePrefix: "Pages" },
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
};

export default config;
