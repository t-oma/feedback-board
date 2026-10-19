import "../src/app/globals.css";

import type { Preview } from "@storybook/nextjs-vite";
import { sb } from "storybook/test";

import { jetbrainsMono, sourceSerif } from "../src/app/fonts";

// The root layout puts the fonts' variables on `<html>`, and `font-serif` and
// `font-mono` read them. Stories render without that layout, so the preview
// sets them on the same element. `src/app/fonts.stories.tsx` checks it.
document.documentElement.classList.add(
  sourceSerif.variable,
  jetbrainsMono.variable,
);

// The real modules import the database driver, which cannot load in a browser,
// so every story that renders a form would fail before it starts. Each mock
// sits in `__mocks__` beside its module. Storybook resolves these paths itself,
// relative to this file, and finds nothing without the extension.
sb.mock("../src/features/create-account/actions.ts");
sb.mock("../src/features/create-product/actions.ts");
sb.mock("../src/features/sign-in/actions.ts");
sb.mock("../src/features/sign-out/actions.ts");

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
